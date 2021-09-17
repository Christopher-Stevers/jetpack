/**
 * Publicize sharing panel component.
 *
 * Displays Publicize notifications if no
 * services are connected or displays form if
 * services are connected.
 */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { withDispatch, withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PublicizeConnectionVerify from '../connection-verify';
import PublicizeForm from '../form';
import PublicizeTwitterOptions from '../twitter/options';

const PublicizePanel = ( { connections, prePublish } ) => (
	<Fragment>
		{ connections && connections.some( connection => connection.enabled ) && (
			<PublicizeConnectionVerify />
		) }
		<div>
			{ __( "Connect and select the accounts where you'd like to share your post.", 'jetpack' ) }
		</div>

		<PublicizeForm />

		<PublicizeTwitterOptions prePublish={ prePublish } />
	</Fragment>
);

export default compose( [
	withSelect( select => ( {
		connections: select( 'core/editor' ).getEditedPostAttribute( 'jetpack_publicize_connections' ),
	} ) ),
	withDispatch( dispatch => ( {
		refreshConnections: dispatch( 'core/editor' ).refreshPost,
	} ) ),
] )( PublicizePanel );
