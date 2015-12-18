/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
module.exports = function mockWindow(testResult) {
    return {
        HTML5: {
            document: {},
            history: {
                pushState: function (state, title, url) {
                    testResult.pushState = {
                        state: state,
                        title: title,
                        url: url
                    };
                },
                replaceState: function (state, title, url) {
                    testResult.replaceState = {
                        state: state,
                        title: title,
                        url: url
                    };
                }
            },
            addEventListener: function (evt, listener) {
                testResult.addEventListener = {
                    evt: evt,
                    listener: listener
                };
            },
            removeEventListener: function (evt, listener) {
                testResult.removeEventListener = {
                    evt: evt,
                    listener: listener
                };
            }
        },
        Firefox: {
            document: {},
            history: {
                pushState: function (state, title, url) {
                    if (arguments.length < 3) {
                        throw new TypeError('Not enough arguments to History.pushState.');
                    }
                    testResult.pushState = {
                        state: state,
                        title: title,
                        url: url
                    };
                },
                replaceState: function (state, title, url) {
                    if (arguments.length < 3) {
                        throw new TypeError('Not enough arguments to History.replaceState.');
                    }
                    testResult.pushState = {
                        state: state,
                        title: title,
                        url: url
                    };
                    testResult.replaceState = {
                        state: state,
                        title: title,
                        url: url
                    };
                }
            },
            addEventListener: function (evt, listener) {
                testResult.addEventListener = {
                    evt: evt,
                    listener: listener
                };
            },
            removeEventListener: function (evt, listener) {
                testResult.removeEventListener = {
                    evt: evt,
                    listener: listener
                };
            }
        },
        OLD: {
            document: {},
            addEventListener: function (evt, listener) {
                testResult.addEventListener = {
                    evt: evt,
                    listener: listener
                };
            },
            removeEventListener: function (evt, listener) {
                testResult.removeEventListener = {
                    evt: evt,
                    listener: listener
                };
            }
        }
    };

};
