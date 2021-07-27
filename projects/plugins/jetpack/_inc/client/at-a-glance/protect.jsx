/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getRedirectUrl } from '@automattic/jetpack-components';

/**
 * Internal dependencies
 */
import DashItem from 'components/dash-item';
import { getProtectCount } from 'state/at-a-glance';
import { isOfflineMode, hasConnectedOwner, authorizeUserInPlace } from 'state/connection';
import { isModuleAvailable } from 'state/modules';
import { numberFormat } from 'components/number-format';
import QueryProtectCount from 'components/data/query-dash-protect';

class DashProtect extends Component {
	static propTypes = {
		isOfflineMode: PropTypes.bool.isRequired,
		protectCount: PropTypes.any.isRequired,
		isModuleAvailable: PropTypes.bool.isRequired,
		hasConnectedOwner: PropTypes.bool.isRequired,
		authorizeUserInPlace: PropTypes.func.isRequired,
	};

	activateProtect = () => this.props.updateOptions( { protect: true } );

	connect = () => this.props.authorizeUserInPlace();

	getContent() {
		const labelName = __( 'Protect', 'jetpack' );
		const support = {
			text: __(
				'Protects your site from traditional and distributed brute force login attacks.',
				'jetpack'
			),
			link: getRedirectUrl( 'jetpack-support-protect' ),
		};

		if (
			this.props.getOptionValue( 'protect' ) &&
			! this.props.isOfflineMode &&
			this.props.hasConnectedOwner
		) {
			const protectCount = this.props.protectCount;

			if ( false === protectCount || '0' === protectCount || 'N/A' === protectCount ) {
				return (
					<DashItem
						label={ labelName }
						module="protect"
						support={ support }
						status="is-working"
						className="jp-dash-item__recently-activated"
					>
						<div className="jp-dash-item__recently-activated-lower">
							<QueryProtectCount />
							<p className="jp-dash-item__description">
								{ __(
									'Jetpack is actively blocking malicious login attempts. Data will display here soon!',
									'jetpack'
								) }
							</p>
						</div>
					</DashItem>
				);
			}
			return (
				<DashItem label={ labelName } module="protect" support={ support } status="is-working">
					<h2 className="jp-dash-item__count">{ numberFormat( protectCount ) }</h2>
					<p className="jp-dash-item__description">
						{ __( 'Total malicious attacks blocked on your site.', 'jetpack' ) }
					</p>
				</DashItem>
			);
		}

		return (
			<DashItem
				label={ labelName }
				module="protect"
				support={ support }
				className="jp-dash-item__is-inactive"
				noToggle={ ! this.props.hasConnectedOwner }
			>
				<p className="jp-dash-item__description">
					{ this.props.isOfflineMode && __( 'Unavailable in Offline Mode', 'jetpack' ) }

					{ ! this.props.isOfflineMode &&
						! this.props.hasConnectedOwner &&
						createInterpolateElement(
							__(
								'<a>Connect your WordPress.com</a> account to keep your site protected from malicious sign in attempts.',
								'jetpack'
							),
							{
								a: <a href="javascript:void(0)" onClick={ this.connect } />,
							}
						) }

					{ ! this.props.isOfflineMode &&
						this.props.hasConnectedOwner &&
						createInterpolateElement(
							__(
								'<a>Activate Protect</a> to keep your site protected from malicious sign in attempts.',
								'jetpack'
							),
							{
								a: <a href="javascript:void(0)" onClick={ this.activateProtect } />,
							}
						) }
				</p>
			</DashItem>
		);
	}

	render() {
		return (
			this.props.isModuleAvailable && (
				<div className="jp-dash-item__interior">
					<QueryProtectCount />
					{ this.getContent() }
				</div>
			)
		);
	}
}

export default connect(
	state => ( {
		protectCount: getProtectCount( state ),
		isOfflineMode: isOfflineMode( state ),
		isModuleAvailable: isModuleAvailable( state, 'protect' ),
		hasConnectedOwner: hasConnectedOwner( state ),
	} ),
	dispatch => ( {
		authorizeUserInPlace: () => {
			return dispatch( authorizeUserInPlace() );
		},
	} )
)( DashProtect );
