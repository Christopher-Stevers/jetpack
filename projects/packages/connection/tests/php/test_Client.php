<?php // phpcs:ignore WordPress.Files.FileName.NotHyphenatedLowercase
/**
 * Client functionality testing.
 *
 * @package automattic/jetpack-connection
 */

namespace Automattic\Jetpack\Connection;

use WorDBless\BaseTestCase;

/**
 * Client functionality testing.
 */
class Client_Test extends BaseTestCase {

	const TEST_URL = 'https://www.example.com';

	/**
	 * Tests that the idc query arguments are added to the request url in the remote_request() method.
	 */
	public function test_remote_request_adds_idc_args() {
		$this->set_up_idc_query_arg_tests();

		$result = Client::remote_request( array( 'url' => 'https://www.example.com/' ) );

		$this->tear_down_idc_query_arg_tests();

		$query_args = wp_parse_args( wp_parse_url( $result )['query'] );

		$this->assertSame( self::TEST_URL, $query_args['siteurl'] );
		$this->assertSame( self::TEST_URL, $query_args['home'] );
		$this->assertSame( '1', $query_args['idc'] );
		$this->assertFalse( isset( $query_args['migrate_for_idc'] ) );
	}

	/**
	 * Tests that the idc query arguments are added to the request url in the remote_request() method when the
	 * `migrate_for_idc` option is set to true.
	 */
	public function test_remote_request_adds_idc_args_with_migrate_for_idc() {
		$this->set_up_idc_query_arg_tests();
		\Jetpack_Options::update_option( 'migrate_for_idc', true );

		$result = Client::remote_request( array( 'url' => 'https://www.example.com/' ) );

		$this->tear_down_idc_query_arg_tests();

		$query_args = wp_parse_args( wp_parse_url( $result )['query'] );

		$this->assertSame( self::TEST_URL, $query_args['siteurl'] );
		$this->assertSame( self::TEST_URL, $query_args['home'] );
		$this->assertSame( '1', $query_args['idc'] );
		$this->assertSame( '1', $query_args['migrate_for_idc'] );
	}

	/**
	 * Tests that the idc query arguments are added to the request url in the remote_request() method when the
	 * 'jetpack_sync_idc_optin' filter returns false.
	 */
	public function test_remote_request_adds_idc_args_without_idc() {
		$this->set_up_idc_query_arg_tests();
		add_filter( 'jetpack_sync_idc_optin', '__return_false' );

		$result = Client::remote_request( array( 'url' => 'https://www.example.com/' ) );

		$this->tear_down_idc_query_arg_tests();

		$query_args = wp_parse_args( wp_parse_url( $result )['query'] );

		$this->assertSame( self::TEST_URL, $query_args['siteurl'] );
		$this->assertSame( self::TEST_URL, $query_args['home'] );
		$this->assertFalse( isset( $query_args['idc'] ) );
		$this->assertFalse( isset( $query_args['migrate_for_idc'] ) );
	}

	/**
	 * Sets up the test environment for idc query argument tests.
	 */
	public function set_up_idc_query_arg_tests() {
		// Short circuit the request.
		add_filter( 'pre_http_request', array( $this, 'return_request_url' ), 10, 3 );

		add_filter( 'jetpack_sync_site_url', array( $this, 'return_test_url' ) );
		add_filter( 'jetpack_sync_home_url', array( $this, 'return_test_url' ) );

		\Jetpack_Options::update_option( 'blog_token', 'asdasd.123123' );
	}

	/**
	 * Tears down the test environment after idc query argument tests.
	 */
	public function tear_down_idc_query_arg_tests() {
		remove_filter( 'pre_http_request', array( $this, 'return_request_url' ), 10, 3 );

		remove_filter( 'jetpack_sync_site_url', array( $this, 'return_test_url' ) );
		remove_filter( 'jetpack_sync_home_url', array( $this, 'return_test_url' ) );

		remove_filter( 'jetpack_sync_idc_optin', '__return_false' );

		\Jetpack_Options::delete_option( 'blog_token' );
		\Jetpack_Options::delete_option( 'migrate_for_idc' );
	}

	/**
	 * Returns the request url to the 'pre_http_request' filter hook.
	 *
	 * @param false|array|WP_Error $preempt     A preemptive return value of an HTTP request. Default false.
	 * @param array                $parsed_args HTTP request arguments.
	 * @param string               $url         The request URL.
	 */
	public function return_request_url( $preempt, $parsed_args, $url ) {
		return $url;
	}

	/**
	 * Returns the test url.
	 */
	public function return_test_url() {
		return self::TEST_URL;
	}
}
