/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Button from 'components/button';
import getRedirectUrl from 'lib/jp-redirect';
import {
	getSiteConnectionStatus as _getSiteConnectionStatus,
	disconnectSite,
	isDisconnectingSite as _isDisconnectingSite,
	isFetchingConnectUrl as _isFetchingConnectUrl,
	getConnectUrl as _getConnectUrl,
	unlinkUser,
	authorizeUserInPlace,
	isCurrentUserLinked as _isCurrentUserLinked,
	isUnlinkingUser as _isUnlinkingUser,
	isAuthorizingUserInPlace as _isAuthorizingUserInPlace,
} from 'state/connection';
import { getSiteRawUrl, isSafari, doNotConnectInPlace } from 'state/initial-state';
import onKeyDownCallback from 'utils/onkeydown-callback';
import JetpackDisconnectModal from 'components/jetpack-termination-dialog/disconnect-modal';

// import {
// 	isFetchingConnectUrl as _isFetchingConnectUrl,
// 	getConnectUrl as _getConnectUrl,
// 	fetchUserConnectionData,
// 	authorizeUserInPlaceSuccess,
// 	isAuthorizingUserInPlace,
// 	hasConnectedOwner,
// 	isSiteRegistered,
// } from 'state/connection';

import './style.scss';

export class ConnectButton extends React.Component {
	static displayName = 'ConnectButton';

	static propTypes = {
		connectUser: PropTypes.bool,
		from: PropTypes.string,
		asLink: PropTypes.bool,
		connectLegend: PropTypes.string,
		connectInPlace: PropTypes.bool,
		customConnect: PropTypes.func,
	};

	static defaultProps = {
		connectUser: false,
		from: '',
		asLink: false,
		connectInPlace: true,
	};

	state = {
		showModal: false,
	};

	handleOpenModal = e => {
		analytics.tracks.recordJetpackClick( 'manage_site_connection' );
		e.preventDefault();
		this.toggleVisibility();
	};

	disconnectSite = () => {
		this.toggleVisibility();
		this.props.disconnectSite();
	};

	toggleVisibility = () => {
		this.setState( { showModal: ! this.state.showModal } );
	};

	connectInPlace = e => {
		e.preventDefault();
		// If the iframe is already loaded or we don't have a connectUrl yet, return.
		if ( this.props.isAuthorizing || this.props.fetchingConnectUrl ) {
			return;
		}

		// Track click
		analytics.tracks.recordJetpackClick( 'link_account_in_place' );

		if ( this.props.customConnect ) {
			this.props.customConnect();
		} else {
			// Dispatch user in place authorization.
			this.props.authorizeUserInPlace();
		}
	};

	// loadPopup = ( e, url ) => {
	// 	e.preventDefault();

	// 	// Track click
	// 	analytics.tracks.recordJetpackClick( 'link_account_in_popup' );

	// 	url = url + '&close_window_after_authorize=1&calypso_env=development';

	// 	const dialog = window.open(
	// 		url,
	// 		'jetpack-connect',
	// 		'status=0,toolbar=0,location=1,menubar=0,directories=0,resizable=1,scrollbars=1,height=660,width=500'
	// 	);
	// 	var timer = setInterval( function () {
	// 		// detect authorized status and closed dialog
	// 		if ( dialog.closed ) {
	// 			clearInterval( timer );
	// 			console.warn( 'detected dialog closed' );
	// 		}
	// 	}, 1000 );
	// };

	renderUserButton = () => {
		// Already linked
		if ( this.props.isLinked ) {
			return (
				<div>
					<a
						role="button"
						tabIndex="0"
						className="jp-jetpack-unlink__button"
						onKeyDown={ onKeyDownCallback( this.props.unlinkUser ) }
						onClick={ this.props.unlinkUser }
						disabled={ this.props.isUnlinking }
					>
						{ this.props.connectLegend || __( 'Disconnect your WordPress.com account', 'jetpack' ) }
					</a>
				</div>
			);
		}

		let connectUrl = this.props.connectUrl;
		if ( this.props.from ) {
			connectUrl += `&from=${ this.props.from }`;
		}

		const buttonProps = {
				className: 'is-primary jp-jetpack-connect__button',
				href: connectUrl,
				disabled: this.props.fetchingConnectUrl || this.props.isAuthorizing,
			},
			connectLegend =
				this.props.connectLegend || __( 'Connect your WordPress.com account', 'jetpack' );

		// Secondary users in-place connection flow

		// Due to the limitation in how 3rd party cookies are handled in Safari,
		// we're falling back to the original flow on Safari desktop and mobile,
		// thus ignore the 'connectInPlace' property value.

		// We also check the `doNotConnectInPlace` initial global state property.
		// This will override the button's `connectInPlace` property.

		if ( this.props.connectInPlace && ! this.props.doNotConnectInPlace ) {
			buttonProps.onClick = this.connectInPlace;
		}

		// if ( this.props.connectInPopup ) {
		// 	buttonProps.onClick = e => this.loadPopup( e, connectUrl );
		// }

		return this.props.asLink ? (
			<a { ...buttonProps }>{ connectLegend }</a>
		) : (
			<Button { ...buttonProps }>{ connectLegend }</Button>
		);
	};

	renderContent = () => {
		if ( this.props.connectUser ) {
			return this.renderUserButton();
		}

		if ( this.props.isSiteConnected ) {
			return (
				<a
					role="button"
					tabIndex="0"
					onKeyDown={ onKeyDownCallback( this.handleOpenModal ) }
					onClick={ this.handleOpenModal }
					disabled={ this.props.isDisconnecting }
				>
					{ this.props.connectLegend || __( 'Manage site connection', 'jetpack' ) }
				</a>
			);
		}

		let connectUrl = this.props.connectUrl;
		if ( this.props.from ) {
			connectUrl += `&from=${ this.props.from }`;
		}

		const buttonProps = {
				className: 'jp-jetpack-connect__button',
				href: connectUrl,
				disabled: this.props.fetchingConnectUrl,
			},
			connectLegend = this.props.connectLegend || __( 'Set up Jetpack', 'jetpack' );

		return this.props.asLink ? (
			<a { ...buttonProps }>{ connectLegend }</a>
		) : (
			<Button { ...buttonProps }>{ connectLegend }</Button>
		);
	};

	render() {
		return (
			<div>
				{ ! this.props.isSiteConnected && (
					<p className="jp-banner__tos-blurb">
						{ createInterpolateElement(
							__(
								'By clicking the button below, you agree to our <tosLink>Terms of Service</tosLink> and to <shareDetailsLink>share details</shareDetailsLink> with WordPress.com.',
								'jetpack'
							),
							{
								tosLink: (
									<a
										href={ getRedirectUrl( 'wpcom-tos' ) }
										rel="noopener noreferrer"
										target="_blank"
									/>
								),
								shareDetailsLink: (
									<a
										href={ getRedirectUrl( 'jetpack-support-what-data-does-jetpack-sync' ) }
										rel="noopener noreferrer"
										target="_blank"
									/>
								),
							}
						) }
					</p>
				) }
				{ this.renderContent() }
				{ this.props.children }
				<JetpackDisconnectModal
					show={ this.state.showModal }
					showSurvey={ false }
					toggleModal={ this.toggleVisibility }
				/>
			</div>
		);
	}
}

export default connect(
	state => {
		return {
			siteRawUrl: getSiteRawUrl( state ),
			isSiteConnected: _getSiteConnectionStatus( state ),
			isDisconnecting: _isDisconnectingSite( state ),
			fetchingConnectUrl: _isFetchingConnectUrl( state ),
			connectUrl: _getConnectUrl( state ),
			isLinked: _isCurrentUserLinked( state ),
			isUnlinking: _isUnlinkingUser( state ),
			isAuthorizing: _isAuthorizingUserInPlace( state ),
			isSafari: isSafari( state ),
			doNotConnectInPlace: doNotConnectInPlace( state ),
		};
	},
	dispatch => {
		return {
			disconnectSite: () => {
				return dispatch( disconnectSite() );
			},
			unlinkUser: () => {
				return dispatch( unlinkUser() );
			},
			authorizeUserInPlace: () => {
				return dispatch( authorizeUserInPlace() );
			},
		};
	}
)( ConnectButton );
