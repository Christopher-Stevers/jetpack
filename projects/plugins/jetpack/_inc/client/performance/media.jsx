/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { __, sprintf } from '@wordpress/i18n';
import { getRedirectUrl } from '@automattic/jetpack-components';
import { ProgressBar } from '@automattic/components';

/**
 * Internal dependencies
 */
import {
	getPlanClass,
	getJetpackProductUpsellByFeature,
	FEATURE_VIDEOPRESS,
	FEATURE_VIDEO_HOSTING_JETPACK,
} from 'lib/plans/constants';
import { FormLegend } from 'components/forms';
import JetpackBanner from 'components/jetpack-banner';
import { ModuleToggle } from 'components/module-toggle';
import { withModuleSettingsFormHelpers } from 'components/module-settings/with-module-settings-form-helpers';
import SettingsCard from 'components/settings-card';
import SettingsGroup from 'components/settings-group';
import { getUpgradeUrl } from 'state/initial-state';
import { getModule, getModuleOverride } from 'state/modules';
import { isModuleFound as _isModuleFound } from 'state/search';
import { getSitePlan, getVideoPressStorageUsed, hasActiveVideoPressPurchase } from 'state/site';

class Media extends React.Component {
	render() {
		const foundVideoPress = this.props.isModuleFound( 'videopress' );

		if ( ! foundVideoPress ) {
			return null;
		}

		const videoPress = this.props.module( 'videopress' ),
			planClass = getPlanClass( this.props.sitePlan.product_slug ),
			{ hasVideoPressPurchase, upgradeUrl, videoPressStorageUsed } = this.props;

		const shouldDisplayStorage = hasVideoPressPurchase && null !== videoPressStorageUsed;

		const hasUpgrade =
			includes(
				[
					'is-premium-plan',
					'is-business-plan',
					'is-daily-security-plan',
					'is-realtime-security-plan',
					'is-complete-plan',
				],
				planClass
			) || hasVideoPressPurchase;

		const freeUploadsUsed =
			! hasVideoPressPurchase && null !== videoPressStorageUsed && 0 === videoPressStorageUsed
				? 0
				: 1;

		const videoPressSettings = (
			<SettingsGroup
				hasChild
				disableInOfflineMode
				module={ videoPress }
				support={ {
					link: getRedirectUrl( 'jetpack-support-videopress' ),
				} }
			>
				<FormLegend className="jp-form-label-wide">{ __( 'VideoPress', 'jetpack' ) }</FormLegend>
				<p>
					{ ' ' }
					{ __(
						'Engage your visitors with high-resolution, ad-free video. Save time by uploading videos directly through the WordPress editor. With Jetpack VideoPress, you can customize your video player to deliver your message without the distraction.',
						'jetpack'
					) }{ ' ' }
				</p>
				{ shouldDisplayStorage && (
					<div className="media__videopress-storage">
						<span>{ __( 'Video storage used out of 1TB:', 'jetpack' ) }</span>
						<ProgressBar value={ videoPressStorageUsed / 10000 } />
					</div>
				) }
				<ModuleToggle
					slug="videopress"
					disabled={ this.props.isUnavailableInOfflineMode( 'videopress' ) }
					activated={ this.props.getOptionValue( 'videopress' ) }
					toggling={ this.props.isSavingAnyOption( 'videopress' ) }
					toggleModule={ this.props.toggleModuleNow }
				>
					<span className="jp-form-toggle-explanation">
						{ __( 'Enable VideoPress', 'jetpack' ) }
					</span>
				</ModuleToggle>
			</SettingsGroup>
		);

		const videoPressForcedInactive = 'inactive' === this.props.getModuleOverride( 'videopress' );

		return (
			<SettingsCard
				{ ...this.props }
				header={ __( 'Media', 'jetpack' ) }
				feature={ ! videoPressForcedInactive && FEATURE_VIDEO_HOSTING_JETPACK }
				hideButton
			>
				{ foundVideoPress && videoPressSettings }
				{ foundVideoPress && ! hasUpgrade && (
					<JetpackBanner
						className="media__videopress-upgrade"
						callToAction={ __( 'Upgrade', 'jetpack' ) }
						title={ sprintf(
							/* translators: placeholder is a number. */
							__(
								'%d/1 free videos used. Upgrade now to unlock more videos and 1TB of storage.',
								'jetpack'
							),
							freeUploadsUsed
						) }
						eventFeature="videopress"
						icon="video"
						plan={ getJetpackProductUpsellByFeature( FEATURE_VIDEOPRESS ) }
						feature="jetpack_videopress"
						href={ upgradeUrl }
					/>
				) }
			</SettingsCard>
		);
	}
}

export default connect( state => {
	return {
		module: module_name => getModule( state, module_name ),
		isModuleFound: module_name => _isModuleFound( state, module_name ),
		sitePlan: getSitePlan( state ),
		hasVideoPressPurchase: hasActiveVideoPressPurchase( state ),
		getModuleOverride: module_name => getModuleOverride( state, module_name ),
		upgradeUrl: getUpgradeUrl( state, 'videopress-upgrade' ),
		videoPressStorageUsed: getVideoPressStorageUsed( state ),
	};
} )( withModuleSettingsFormHelpers( Media ) );
