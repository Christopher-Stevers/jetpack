/**
 * For a detailed explanation of configuration properties, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

if ( process.env.E2E_DEBUG ) {
	process.env.DEBUG = 'pw:browser|api|error';
	process.env.PWDEBUG = 1;
}

module.exports = {
	testEnvironment: '<rootDir>/node_modules/jetpack-e2e-tests/lib/env/playwright-environment.js',
	globalSetup: '<rootDir>/node_modules/jetpack-e2e-tests/lib/env/global-setup.js',
	globalTeardown: '<rootDir>/node_modules/jetpack-e2e-tests/lib/env/global-teardown.js',
	setupFilesAfterEnv: [
		'<rootDir>/node_modules/jetpack-e2e-tests/jest.setup.js',
		'expect-playwright',
	],
	testRunner: 'jest-circus/runner',
	runner: 'groups',
	testEnvironmentOptions: {
		resultsDir: 'output/allure-results',
	},
	reporters: [
		'default',
		[
			'jest-junit',
			{
				suiteName: 'Jetpack Boost E2E tests',
				outputDirectory: 'output/reports',
				outputName: 'junit-results.xml',
				uniqueOutputName: 'true',
			},
		],
		[
			'jest-stare',
			{
				resultDir: `output/reports/jest-stare`,
				reportTitle: 'Jetpack Boost E2E tests',
			},
		],
	],
};