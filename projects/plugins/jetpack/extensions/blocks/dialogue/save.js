/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { BASE_CLASS_NAME } from './utils';
import { convertTimeCodeToSeconds } from '../../shared/components/media-player-control/utils';

export default function save( { attributes } ) {
	const { content, label, showTimestamp, timestamp } = attributes;

	return (
		<div>
			<div className={ `${ BASE_CLASS_NAME }__meta` }>
				<div className={ `${ BASE_CLASS_NAME }__participant has-bold-style` }>
					{ label }
				</div>
				{ showTimestamp && (
					<div className={ `${ BASE_CLASS_NAME }__timestamp-label` }>
						<a
							className={ `${ BASE_CLASS_NAME }__timestamp_link` }
							href={ `#${ convertTimeCodeToSeconds( timestamp ) }` }
						>
							{ timestamp }
						</a>
					</div>
				) }
			</div>
			<div className={ `${ BASE_CLASS_NAME }__content-wrapper entry-content` }>
				<RichText.Content
					multiline
					value={ content }
				/>
			</div>
		</div>
	);
}
