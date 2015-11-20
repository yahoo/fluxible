/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global browser */

exports.config = {
    framework: 'mocha',
    seleniumAddress: process.env.SELENIUM_HUB_URL || 'http://localhost:4444/wd/hub',
    specs: ['**/*.spec.js'],
    onPrepare: function () {
        browser.ignoreSynchronization = true;
    }
};
