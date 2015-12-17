/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var HistoryWithHash = require('../../../addons/HistoryWithHash'),
    expect = require('chai').expect,
    _ = require('lodash'),
    windowMock,
    testResult;

describe('HistoryWithHash', function () {

    beforeEach(function () {
        testResult = {};
        windowMock = require('../../mocks/mockWindow')(testResult);
    });

    describe('constructor', function () {
        it ('no useHashRoute; has pushState', function () {
            var history = new HistoryWithHash({win: windowMock.HTML5});
            expect(history.win).to.equal(windowMock.HTML5);
            expect(history._hasPushState).to.equal(true);
            expect(history._popstateEvt).to.equal('popstate');
            expect(history._useHashRoute).to.equal(false);
        });
        it ('no useHashRoute; no pushState', function () {
            var history = new HistoryWithHash({win: windowMock.OLD});
            expect(history.win).to.equal(windowMock.OLD);
            expect(history._hasPushState).to.equal(false);
            expect(history._popstateEvt).to.equal('hashchange');
            expect(history._useHashRoute).to.equal(true);
        });
        it ('useHashRoute=true; has pushState', function () {
            var history = new HistoryWithHash({win: windowMock.HTML5, useHashRoute: true});
            expect(history.win).to.equal(windowMock.HTML5);
            expect(history._hasPushState).to.equal(true);
            expect(history._useHashRoute).to.equal(true);
        });
        it ('useHashRoute=false; no pushState', function () {
            var history = new HistoryWithHash({win: windowMock.OLD, useHashRoute: false});
            expect(history.win).to.equal(windowMock.OLD);
            expect(history._hasPushState).to.equal(false);
            expect(history._useHashRoute).to.equal(false);
        });
    });

    describe('on', function () {
        it ('has pushState', function () {
            var history = new HistoryWithHash({win: windowMock.HTML5});
            var listener = function () {};
            history.on(listener);
            expect(testResult.addEventListener).to.eql({evt: 'popstate', listener: listener});
        });
        it ('no pushState', function () {
            var history = new HistoryWithHash({win: windowMock.OLD});
            var listener = function () {};
            history.on(listener);
            expect(testResult.addEventListener).to.eql({evt: 'hashchange', listener: listener});
        });
    });

    describe('off', function () {
        it ('has pushState', function () {
            var history = new HistoryWithHash({win: windowMock.HTML5});
            var listener = function () {};
            history.off(listener);
            expect(testResult.removeEventListener).to.eql({evt: 'popstate', listener: listener});
        });
        it ('no pushState', function () {
            var history = new HistoryWithHash({win: windowMock.OLD});
            var listener = function () {};
            history.off(listener);
            expect(testResult.removeEventListener).to.eql({evt: 'hashchange', listener: listener});
        });
    });

    describe('getState', function () {
        it ('has pushState', function () {
            var history = new HistoryWithHash({win: _.merge({history: {state: {foo: 'bar'}}}, windowMock.HTML5)});
            expect(history.getState()).to.eql({foo: 'bar'});
        });
        it ('no pushState', function () {
            var history = new HistoryWithHash({win: windowMock.OLD});
            expect(history.getState()).to.eql(null);
        });
    });

    describe('getUrl', function () {
        it ('has pushState', function () {
            var win = _.extend({}, windowMock.HTML5, {
                location: {
                    pathname: '/path/to/page',
                    search: '',
                    hash: '#/path/to/abc'
                }
            });
            var history = new HistoryWithHash({win: win});
            var url = history.getUrl();
            expect(url).to.equal('/path/to/page');
        });
        it ('has pushState with query', function () {
            var win = _.extend({}, windowMock.HTML5, {
                location: {
                    pathname: '/path/to/page',
                    search: '?foo=bar&x=y'
                }
            });
            var history = new HistoryWithHash({win: win});
            var url = history.getUrl();
            expect(url).to.equal('/path/to/page?foo=bar&x=y');
        });
        it ('no pushState', function () {
            var win, history, path;
            win = _.extend({}, windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: '#/path/to/abc',
                    search: ''
                }
            });
            history = new HistoryWithHash({win: win});
            var url = history.getUrl();
            expect(url).to.equal('/path/to/abc');

            win = _.extend({}, windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: '#',
                    search: ''
                }
            });
            history = new HistoryWithHash({win: win});
            url = history.getUrl();
            expect(url).to.equal('/', 'hash=#');

            win = _.extend({}, windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: '',
                    search: ''
                }
            });
            history = new HistoryWithHash({win: win});
            url = history.getUrl();
            expect(url).to.equal('/');

            history = new HistoryWithHash({win: win, defaultHashRoute: '/default'});
            url = history.getUrl();
            expect(url).to.equal('/default');
        });
        it ('no pushState, with query', function () {
            var win, history, url;
            win = _.extend({}, windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: '#/path/to/abc?foo=bar&x=y'
                }
            });
            history = new HistoryWithHash({win: win});
            url = history.getUrl();
            expect(url).to.equal('/path/to/abc?foo=bar&x=y');

            win = _.extend({}, windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: '#/?foo=bar&x=y'
                }
            });
            history = new HistoryWithHash({win: win});
            url = history.getUrl();
            expect(url).to.equal('/?foo=bar&x=y');
        });
    });

    describe('pushState', function () {
        it ('useHashRoute=false; has pushState', function () {
            var win = _.extend(windowMock.HTML5, {
                'document': {
                    title: 'current title'
                },
                location: {
                    href: '/currentUrl'
                }
            });
            var history = new HistoryWithHash({win: win});

            history.pushState({foo: 'bar'});
            expect(testResult.pushState.state).to.eql({foo: 'bar'});
            expect(testResult.pushState.title).to.equal('current title');
            expect(testResult.pushState.url).to.equal('/currentUrl');

            history.pushState({foo: 'bar'}, 't', '/url');
            expect(testResult.pushState.state).to.eql({foo: 'bar'});
            expect(testResult.pushState.title).to.equal('t');
            expect(testResult.pushState.url).to.equal('/url');
            expect(windowMock.HTML5.document.title).to.equal('t');

            history.pushState({foo: 'bar'}, 'tt', '/url?a=b&x=y');
            expect(testResult.pushState.state).to.eql({foo: 'bar'});
            expect(testResult.pushState.title).to.equal('tt');
            expect(testResult.pushState.url).to.equal('/url?a=b&x=y');
            expect(windowMock.HTML5.document.title).to.equal('tt');
        });
        it ('useHashRoute=false; has pushState; Firefox', function () {
            var win = _.extend(windowMock.Firefox, {
                'document': {
                    title: 'current title'
                },
                location: {
                    href: '/currentUrl'
                }
            });
            var history = new HistoryWithHash({win: win});

            history.pushState({foo: 'bar'});
            expect(testResult.pushState.state).to.eql({foo: 'bar'});
            expect(testResult.pushState.title).to.equal('current title');
            expect(testResult.pushState.url).to.equal('/currentUrl');

            history.pushState({foo: 'bar'}, 't', '/url');
            expect(testResult.pushState.state).to.eql({foo: 'bar'});
            expect(testResult.pushState.title).to.equal('t');
            expect(testResult.pushState.url).to.equal('/url');
        });
        it ('useHashRoute=false; no pushState', function () {
            var win = _.extend({}, windowMock.OLD, {location: {}});
            var history = new HistoryWithHash({
                win: win,
                useHashRoute: false
            });

            history.pushState({foo: 'bar'}, 't', '/url');
            expect(win.location.href).to.equal('/url');

            history.pushState({foo: 'bar'}, 't', '/url?a=b&x=y');
            expect(win.location.href).to.equal('/url?a=b&x=y');
        });
        it ('useHashRoute=true; has pushState', function () {
            var win = _.extend({}, windowMock.HTML5, {
                location: {
                    pathname: '/path',
                    search: '?a=b'
                }
            });
            var history = new HistoryWithHash({win: win, useHashRoute: true});

            history.pushState({foo: 'bar'}, 't', '/url');
            expect(testResult.pushState.state).to.eql({foo: 'bar'});
            expect(testResult.pushState.title).to.equal('t');
            expect(testResult.pushState.url).to.equal('/path?a=b#/url');

            history.pushState({foo: 'bar'}, 't', '/url?a=b&x=y');
            expect(testResult.pushState.state).to.eql({foo: 'bar'});
            expect(testResult.pushState.title).to.equal('t');
            expect(testResult.pushState.url).to.equal('/path?a=b#/url?a=b&x=y');
        });
        it ('useHashRoute=true; has pushState; has hashRouteTransformer', function () {
            var win = _.extend({}, windowMock.HTML5, {
                location: {
                    pathname: '/path',
                    search: '?a=b'
                }
            });
            var history = new HistoryWithHash({
                win: win,
                useHashRoute: true,
                hashRouteTransformer: {
                    transform: function (hash) {
                        return hash.replace(/\//g, '-');
                    }
                }
            });

            history.pushState({foo: 'bar'}, 't', '/url');
            expect(testResult.pushState.state).to.eql({foo: 'bar'});
            expect(testResult.pushState.title).to.equal('t');
            expect(testResult.pushState.url).to.equal('/path?a=b#-url');

            history.pushState({foo: 'bar'}, 't', '/url?a=b&x=y');
            expect(testResult.pushState.state).to.eql({foo: 'bar'});
            expect(testResult.pushState.title).to.equal('t');
            expect(testResult.pushState.url).to.equal('/path?a=b#-url?a=b&x=y');
        });
        it ('useHashRoute=true; no pushState', function () {
            var win = _.extend({}, windowMock.OLD, {
                location: {}
            });
            var history = new HistoryWithHash({win: win, useHashRoute: true});

            history.pushState({foo: 'bar'}, 't', '/url');
            expect(win.location.hash).to.equal('#/url');

            history.pushState({foo: 'bar'}, 't', '/url?a=b&x=y');
            expect(win.location.hash).to.equal('#/url?a=b&x=y');
        });
    });

    describe('replaceState', function () {
        it ('useHashRouter=false; has pushState', function () {
            // var history = new HistoryWithHash({win: windowMock.HTML5});
            var win = _.extend(windowMock.HTML5, {
                'document': {
                    title: 'current title'
                },
                location: {
                    href: '/currentUrl'
                }
            });
            var history = new HistoryWithHash({win: win});

            history.replaceState({foo: 'bar'});
            expect(testResult.replaceState.state).to.eql({foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('current title');
            expect(testResult.replaceState.url).to.equal('/currentUrl');

            history.replaceState({foo: 'bar'}, 't', '/url');
            expect(testResult.replaceState.state).to.eql({foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('t');
            expect(testResult.replaceState.url).to.equal('/url');
            expect(windowMock.HTML5.document.title).to.equal('t');

            history.replaceState({foo: 'bar'}, 'tt', '/url?a=b&x=y');
            expect(testResult.replaceState.state).to.eql({foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('tt');
            expect(testResult.replaceState.url).to.equal('/url?a=b&x=y', 'url has query');
            expect(windowMock.HTML5.document.title).to.equal('tt');
        });
        it ('useHashRouter=false; has pushState; Firefox', function () {
            var win = _.extend(windowMock.Firefox, {
                'document': {
                    title: 'current title'
                },
                location: {
                    href: '/currentUrl'
                }
            });
            var history = new HistoryWithHash({win: win});

            history.replaceState({foo: 'bar'});
            expect(testResult.replaceState.state).to.eql({foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('current title');
            expect(testResult.replaceState.url).to.equal('/currentUrl');

            history.replaceState({foo: 'bar'}, 't', '/url');
            expect(testResult.replaceState.state).to.eql({foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('t');
            expect(testResult.replaceState.url).to.equal('/url');
        });
        it ('useHashRouter=false; no pushState', function () {
            var win = _.extend({}, windowMock.OLD, {
                location: {
                    pathname: '/path',
                    search: '?foo=bar',
                    replace: function(url) {
                        testResult.locationReplace = {url: url};
                    }
                }
            });
            var history = new HistoryWithHash({
                win: win,
                useHashRoute: false
            });
            history.replaceState({foo: 'bar'}, 't', '/url');
            expect(testResult.locationReplace.url).to.equal('/url');

            history.replaceState({foo: 'bar'}, 't', '/url?a=b&x=y');
            expect(testResult.locationReplace.url).to.equal('/url?a=b&x=y');

            testResult.locationReplace.url = null;
            history.replaceState({foo: 'bar'});
            expect(testResult.locationReplace.url).to.equal(null);
        });
        it ('useHashRouter=true; has pushState', function () {
            var win = _.extend({}, windowMock.HTML5, {
                location: {
                    pathname: '/path',
                    search: '?foo=bar'
                }
            });
            var history = new HistoryWithHash({win: win, useHashRoute: true});
            history.replaceState({foo: 'bar'}, 't', '/url');
            expect(testResult.replaceState.state).to.eql({foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('t');
            expect(testResult.replaceState.url).to.equal('/path?foo=bar#/url');

            history.replaceState({foo: 'bar'}, 't', '/url?a=b&x=y');
            expect(testResult.replaceState.state).to.eql({foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('t');
            expect(testResult.replaceState.url).to.equal('/path?foo=bar#/url?a=b&x=y', 'url has query');

        });
        it ('useHashRouter=true; has pushState; has hashRouteTransformer', function () {
            var win = _.extend({}, windowMock.HTML5, {
                location: {
                    pathname: '/path',
                    search: '?foo=bar'
                }
            });
            var history = new HistoryWithHash({
                win: win,
                useHashRoute: true,
                hashRouteTransformer: {
                    transform: function (hash) {
                        return hash.replace(/\//g, '-').replace(/\?/g, '+');
                    }
                }
            });
            history.replaceState({foo: 'bar'}, 't', '/url');
            expect(testResult.replaceState.state).to.eql({foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('t');
            expect(testResult.replaceState.url).to.equal('/path?foo=bar#-url');

            history.replaceState({foo: 'bar'}, 't', '/url?a=b&x=y');
            expect(testResult.replaceState.state).to.eql({foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('t');
            expect(testResult.replaceState.url).to.equal('/path?foo=bar#-url+a=b&x=y', 'url has query');

        });
        it ('useHashRoute=true; no pushState', function () {
            var win = _.extend({}, windowMock.OLD, {
                location: {
                    pathname: '/path',
                    search: '?foo=bar',
                    replace: function(url) {
                        testResult.locationReplace = {url: url};
                    }
                }
            });
            var history = new HistoryWithHash({win: win, useHashRoute: true});
            history.replaceState({foo: 'bar'}, 't', '/url');
            expect(testResult.locationReplace.url).to.equal('/path?foo=bar#/url');
            history.replaceState({foo: 'bar'}, 't', '/url?a=b&x=y');
            expect(testResult.locationReplace.url).to.equal('/path?foo=bar#/url?a=b&x=y');
            testResult.locationReplace.url = null;
            history.replaceState({foo: 'bar'});
            expect(testResult.locationReplace.url).to.equal(null);
        });
    });

});
