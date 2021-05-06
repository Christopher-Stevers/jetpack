/**
 * External dependencies
 */
import ReactDOM from 'react-dom';
import React from 'react';

/**
 * Internal dependencies
 */
import SearchDashboard from './search-dashboard';

/**
 * Mounts the Search Dashboard to #jp-search-dashboard if available.
 */
function init() {
	const container = document.getElementById( 'jp-search-dashboard' );

	if ( container === null ) {
		return;
	}

	ReactDOM.render( <SearchDashboard />, container );
}

// Initialize Instant Search when DOMContentLoaded is fired, or immediately if it already has been.
if ( document.readyState !== 'loading' ) {
	init();
} else {
	document.addEventListener( 'DOMContentLoaded', init );
}
