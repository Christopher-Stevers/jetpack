/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useEffect, useCallback } from '@wordpress/element';
/**
 * Internal dependencies
 */
import './style.scss';
import {
	ControlBackFiveIcon,
	ControlForwardFiveIcon,
	ControlPlayInTimeIcon,
	ControlSyncIcon,
	ControlUnsyncIcon,
} from '../../icons';
import { STATE_PAUSED, STATE_PLAYING, STORE_ID } from '../../../store/media-source/constants';
import { convertSecondsToTimeCode } from './utils';

function noop () {}

export function MediaPlayerControl( {
	skipForwardTime = 5,
	jumpBackTime = 5,
	customTimeToPlay,
	syncMode = false,
	playIcon = 'controls-play',
	pauseIcon = 'controls-pause',
	backFiveIcon = ControlBackFiveIcon,
	forwardFiveIcon = ControlForwardFiveIcon,
	onTimeChange = noop,
} ) {
	const {
		playerState,
		playerCurrentTime,
		defaultMediaSource,
		syncModeEnabled,
	} = useSelect( select => {
		const {
			getMediaSourceCurrentTime,
			getMediaPlayerState,
			getMediaSourceSyncMode,
			getDefaultMediaSource,
		} = select( STORE_ID );

		return {
			playerState: getMediaPlayerState(),
			playerCurrentTime: getMediaSourceCurrentTime(),
			syncModeEnabled: getMediaSourceSyncMode(),
			defaultMediaSource: getDefaultMediaSource(),
		};
	}, [] );
	const timeInFormat = convertSecondsToTimeCode( playerCurrentTime );
	const isDisabled = ! defaultMediaSource;

	const {
		toggleMediaSource,
		playMediaSource,
		setMediaSourceCurrentTime,
		setMediaSourceSyncMode,
	} = useDispatch( STORE_ID );

	function togglePlayer() {
		toggleMediaSource( defaultMediaSource.id );
	}

	function setPlayerCurrentTime( time ) {
		setMediaSourceCurrentTime( defaultMediaSource.id, time );
	}

	const setSyncMode = useCallback( ( enabled ) => {
		setMediaSourceSyncMode( defaultMediaSource.id, enabled );
	}, [ defaultMediaSource.id, setMediaSourceSyncMode ] );

	function playPlayerInCustomTime() {
		setPlayerCurrentTime( customTimeToPlay );
		playMediaSource( defaultMediaSource.id );
	}

	function setCurrentTime( time ) {
		onTimeChange( time );
	}

	/*
	 * Set sync mode always false.
	 * It could be annyging for users
	 * getting the timestamp changing automatically.
	 */
	useEffect( () => {
		setSyncMode( false );
	}, [ setSyncMode ] );

	/**
	 * Syncornize player current time with block property.
	 */
	useEffect( () => {
		if ( ! syncModeEnabled || playerState !== STATE_PLAYING ) {
			return;
		}

		onTimeChange( playerCurrentTime );
	}, [ syncModeEnabled, playerCurrentTime, onTimeChange, playerState ] );

	return (
		<>
			{ jumpBackTime !== false && (
				<ToolbarButton
					icon={ backFiveIcon }
					isDisabled={ isDisabled }
					onClick={ () => setCurrentTime( customTimeToPlay - jumpBackTime ) }
					label={ __( 'Jump back', 'jetpack' ) }
				/>
			) }

			<ToolbarButton
				icon={ playerState === STATE_PAUSED ? playIcon : pauseIcon }
				isDisabled={ isDisabled }
				onClick={ togglePlayer }
				label={ __( 'Play', 'jetpack' ) }
			/>

			{ customTimeToPlay !== false && (
				<ToolbarButton
					icon={ ControlPlayInTimeIcon }
					isDisabled={ isDisabled }
					onClick={ playPlayerInCustomTime }
					label={ __( 'Play in custom time', 'jetpack' ) }
				/>
			) }

			{ skipForwardTime && (
				<ToolbarButton
					icon={ forwardFiveIcon }
					isDisabled={ isDisabled }
					onClick={ () => setCurrentTime( customTimeToPlay + skipForwardTime ) }
					label={ __( 'Skip forward', 'jetpack' ) }
				/>
			) }

			{ syncMode && (
				<ToolbarButton
					icon={ syncModeEnabled ? ControlUnsyncIcon : ControlSyncIcon }
					isDisabled={ isDisabled }
					onClick={ () => setSyncMode( ! syncModeEnabled ) }
					label={ __( 'Keep in-sync mode', 'jetpack' ) }
				/>
			) }

			<div
				className={ classnames(
					'media-player-control__current-time', {
						'is-disabled': isDisabled,
						[ `has-${ timeInFormat.split( ':' ) }-parts` ]: true
					}
				) }
			>
				{ timeInFormat }
			</div>
		</>
	);
}

export function MediaPlayerToolbarControl( props ) {
	return (
		<ToolbarGroup>
			<MediaPlayerControl { ...props } />
		</ToolbarGroup>
	);
}