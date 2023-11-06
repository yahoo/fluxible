/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
const _ = require('lodash');
const { HistoryWithHash } = require('../../');

let windowMock;
let testResult;

describe('HistoryWithHash', function () {
    beforeEach(function () {
        testResult = {};
        windowMock = require('../mocks/mockWindow')(testResult);
    });

    describe('constructor', function () {
        it('no useHashRoute; has pushState', function () {
            var history = new HistoryWithHash({ win: windowMock.HTML5 });
            expect(history.win).toBe(windowMock.HTML5);
            expect(history._hasPushState).toBe(true);
            expect(history._popstateEvt).toBe('popstate');
            expect(history._useHashRoute).toBe(false);
        });
        it('no useHashRoute; no pushState', function () {
            var history = new HistoryWithHash({ win: windowMock.OLD });
            expect(history.win).toBe(windowMock.OLD);
            expect(history._hasPushState).toBe(false);
            expect(history._popstateEvt).toBe('hashchange');
            expect(history._useHashRoute).toBe(true);
        });
        it('useHashRoute=true; has pushState', function () {
            var history = new HistoryWithHash({
                win: windowMock.HTML5,
                useHashRoute: true,
            });
            expect(history.win).toBe(windowMock.HTML5);
            expect(history._hasPushState).toBe(true);
            expect(history._useHashRoute).toBe(true);
        });
        it('useHashRoute=false; no pushState', function () {
            var history = new HistoryWithHash({
                win: windowMock.OLD,
                useHashRoute: false,
            });
            expect(history.win).toBe(windowMock.OLD);
            expect(history._hasPushState).toBe(false);
            expect(history._useHashRoute).toBe(false);
        });
    });

    describe('on', function () {
        it('has pushState', function () {
            var history = new HistoryWithHash({ win: windowMock.HTML5 });
            var listener = function () {};
            history.on(listener);
            expect(testResult.addEventListener).toEqual({
                evt: 'popstate',
                listener: listener,
            });
        });
        it('no pushState', function () {
            var history = new HistoryWithHash({ win: windowMock.OLD });
            var listener = function () {};
            history.on(listener);
            expect(testResult.addEventListener).toEqual({
                evt: 'hashchange',
                listener: listener,
            });
        });
    });

    describe('off', function () {
        it('has pushState', function () {
            var history = new HistoryWithHash({ win: windowMock.HTML5 });
            var listener = function () {};
            history.off(listener);
            expect(testResult.removeEventListener).toEqual({
                evt: 'popstate',
                listener: listener,
            });
        });
        it('no pushState', function () {
            var history = new HistoryWithHash({ win: windowMock.OLD });
            var listener = function () {};
            history.off(listener);
            expect(testResult.removeEventListener).toEqual({
                evt: 'hashchange',
                listener: listener,
            });
        });
    });

    describe('getState', function () {
        it('has pushState', function () {
            var history = new HistoryWithHash({
                win: _.merge(
                    { history: { state: { foo: 'bar' } } },
                    windowMock.HTML5,
                ),
            });
            expect(history.getState()).toEqual({ foo: 'bar' });
        });
        it('no pushState', function () {
            var history = new HistoryWithHash({ win: windowMock.OLD });
            expect(history.getState()).toBe(null);
        });
    });

    describe('getUrl', function () {
        it('has pushState', function () {
            var win = _.extend({}, windowMock.HTML5, {
                location: {
                    pathname: '/path/to/page',
                    search: '',
                    hash: '#/path/to/abc',
                },
            });
            var history = new HistoryWithHash({ win: win });
            var url = history.getUrl();
            expect(url).toBe('/path/to/page');
        });
        it('has pushState with query', function () {
            var win = _.extend({}, windowMock.HTML5, {
                location: {
                    pathname: '/path/to/page',
                    search: '?foo=bar&x=y',
                },
            });
            var history = new HistoryWithHash({ win: win });
            var url = history.getUrl();
            expect(url).toBe('/path/to/page?foo=bar&x=y');
        });
        it('no pushState', function () {
            var win, history, path;
            win = _.extend({}, windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: '#/path/to/abc',
                    search: '',
                },
            });
            history = new HistoryWithHash({ win: win });
            var url = history.getUrl();
            expect(url).toBe('/path/to/abc');

            win = _.extend({}, windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: '#',
                    search: '',
                },
            });
            history = new HistoryWithHash({ win: win });
            url = history.getUrl();
            expect(url).toBe('/');

            win = _.extend({}, windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: '',
                    search: '',
                },
            });
            history = new HistoryWithHash({ win: win });
            url = history.getUrl();
            expect(url).toBe('/');

            history = new HistoryWithHash({
                win: win,
                defaultHashRoute: '/default',
            });
            url = history.getUrl();
            expect(url).toBe('/default');
        });
        it('no pushState, with query', function () {
            var win, history, url;
            win = _.extend({}, windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: '#/path/to/abc?foo=bar&x=y',
                },
            });
            history = new HistoryWithHash({ win: win });
            url = history.getUrl();
            expect(url).toBe('/path/to/abc?foo=bar&x=y');

            win = _.extend({}, windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: '#/?foo=bar&x=y',
                },
            });
            history = new HistoryWithHash({ win: win });
            url = history.getUrl();
            expect(url).toBe('/?foo=bar&x=y');
        });
    });

    describe('pushState', function () {
        it('useHashRoute=false; has pushState', function () {
            var win = _.extend(windowMock.HTML5, {
                document: {
                    title: 'current title',
                },
                location: {
                    href: '/currentUrl',
                },
            });
            var history = new HistoryWithHash({ win: win });

            history.pushState({ foo: 'bar' });
            expect(testResult.pushState.state).toEqual({ foo: 'bar' });
            expect(testResult.pushState.title).toBe('current title');
            expect(testResult.pushState.url).toBe('/currentUrl');

            history.pushState({ foo: 'bar' }, 't', '/url');
            expect(testResult.pushState.state).toEqual({ foo: 'bar' });
            expect(testResult.pushState.title).toBe('t');
            expect(testResult.pushState.url).toBe('/url');
            expect(windowMock.HTML5.document.title).toBe('t');

            history.pushState({ foo: 'bar' }, 'tt', '/url?a=b&x=y');
            expect(testResult.pushState.state).toEqual({ foo: 'bar' });
            expect(testResult.pushState.title).toBe('tt');
            expect(testResult.pushState.url).toBe('/url?a=b&x=y');
            expect(windowMock.HTML5.document.title).toBe('tt');
        });
        it('useHashRoute=false; has pushState; Firefox', function () {
            var win = _.extend(windowMock.Firefox, {
                document: {
                    title: 'current title',
                },
                location: {
                    href: '/currentUrl',
                },
            });
            var history = new HistoryWithHash({ win: win });

            history.pushState({ foo: 'bar' });
            expect(testResult.pushState.state).toEqual({ foo: 'bar' });
            expect(testResult.pushState.title).toBe('current title');
            expect(testResult.pushState.url).toBe('/currentUrl');

            history.pushState({ foo: 'bar' }, 't', '/url');
            expect(testResult.pushState.state).toEqual({ foo: 'bar' });
            expect(testResult.pushState.title).toBe('t');
            expect(testResult.pushState.url).toBe('/url');
        });
        it('useHashRoute=false; no pushState', function () {
            var win = _.extend({}, windowMock.OLD, { location: {} });
            var history = new HistoryWithHash({
                win: win,
                useHashRoute: false,
            });

            history.pushState({ foo: 'bar' }, 't', '/url');
            expect(win.location.href).toBe('/url');

            history.pushState({ foo: 'bar' }, 't', '/url?a=b&x=y');
            expect(win.location.href).toBe('/url?a=b&x=y');
        });
        it('useHashRoute=true; has pushState', function () {
            var win = _.extend({}, windowMock.HTML5, {
                location: {
                    pathname: '/path',
                    search: '?a=b',
                },
            });
            var history = new HistoryWithHash({ win: win, useHashRoute: true });

            history.pushState({ foo: 'bar' }, 't', '/url');
            expect(testResult.pushState.state).toEqual({ foo: 'bar' });
            expect(testResult.pushState.title).toBe('t');
            expect(testResult.pushState.url).toBe('/path?a=b#/url');

            history.pushState({ foo: 'bar' }, 't', '/url?a=b&x=y');
            expect(testResult.pushState.state).toEqual({ foo: 'bar' });
            expect(testResult.pushState.title).toBe('t');
            expect(testResult.pushState.url).toBe('/path?a=b#/url?a=b&x=y');
        });
        it('useHashRoute=true; has pushState; has hashRouteTransformer', function () {
            var win = _.extend({}, windowMock.HTML5, {
                location: {
                    pathname: '/path',
                    search: '?a=b',
                },
            });
            var history = new HistoryWithHash({
                win: win,
                useHashRoute: true,
                hashRouteTransformer: {
                    transform: function (hash) {
                        return hash.replace(/\//g, '-');
                    },
                },
            });

            history.pushState({ foo: 'bar' }, 't', '/url');
            expect(testResult.pushState.state).toEqual({ foo: 'bar' });
            expect(testResult.pushState.title).toBe('t');
            expect(testResult.pushState.url).toBe('/path?a=b#-url');

            history.pushState({ foo: 'bar' }, 't', '/url?a=b&x=y');
            expect(testResult.pushState.state).toEqual({ foo: 'bar' });
            expect(testResult.pushState.title).toBe('t');
            expect(testResult.pushState.url).toBe('/path?a=b#-url?a=b&x=y');
        });
        it('useHashRoute=true; no pushState', function () {
            var win = _.extend({}, windowMock.OLD, {
                location: {},
            });
            var history = new HistoryWithHash({ win: win, useHashRoute: true });

            history.pushState({ foo: 'bar' }, 't', '/url');
            expect(win.location.hash).toBe('#/url');

            history.pushState({ foo: 'bar' }, 't', '/url?a=b&x=y');
            expect(win.location.hash).toBe('#/url?a=b&x=y');
        });
    });

    describe('replaceState', function () {
        it('useHashRouter=false; has pushState', function () {
            // var history = new HistoryWithHash({win: windowMock.HTML5});
            var win = _.extend(windowMock.HTML5, {
                document: {
                    title: 'current title',
                },
                location: {
                    href: '/currentUrl',
                },
            });
            var history = new HistoryWithHash({ win: win });

            history.replaceState({ foo: 'bar' });
            expect(testResult.replaceState.state).toEqual({ foo: 'bar' });
            expect(testResult.replaceState.title).toBe('current title');
            expect(testResult.replaceState.url).toBe('/currentUrl');

            history.replaceState({ foo: 'bar' }, 't', '/url');
            expect(testResult.replaceState.state).toEqual({ foo: 'bar' });
            expect(testResult.replaceState.title).toBe('t');
            expect(testResult.replaceState.url).toBe('/url');
            expect(windowMock.HTML5.document.title).toBe('t');

            history.replaceState({ foo: 'bar' }, 'tt', '/url?a=b&x=y');
            expect(testResult.replaceState.state).toEqual({ foo: 'bar' });
            expect(testResult.replaceState.title).toBe('tt');
            expect(testResult.replaceState.url).toBe('/url?a=b&x=y');
            expect(windowMock.HTML5.document.title).toBe('tt');
        });
        it('useHashRouter=false; has pushState; Firefox', function () {
            var win = _.extend(windowMock.Firefox, {
                document: {
                    title: 'current title',
                },
                location: {
                    href: '/currentUrl',
                },
            });
            var history = new HistoryWithHash({ win: win });

            history.replaceState({ foo: 'bar' });
            expect(testResult.replaceState.state).toEqual({ foo: 'bar' });
            expect(testResult.replaceState.title).toBe('current title');
            expect(testResult.replaceState.url).toBe('/currentUrl');

            history.replaceState({ foo: 'bar' }, 't', '/url');
            expect(testResult.replaceState.state).toEqual({ foo: 'bar' });
            expect(testResult.replaceState.title).toBe('t');
            expect(testResult.replaceState.url).toBe('/url');
        });
        it('useHashRouter=false; no pushState', function () {
            var win = _.extend({}, windowMock.OLD, {
                location: {
                    pathname: '/path',
                    search: '?foo=bar',
                    replace: function (url) {
                        testResult.locationReplace = { url: url };
                    },
                },
            });
            var history = new HistoryWithHash({
                win: win,
                useHashRoute: false,
            });
            history.replaceState({ foo: 'bar' }, 't', '/url');
            expect(testResult.locationReplace.url).toBe('/url');

            history.replaceState({ foo: 'bar' }, 't', '/url?a=b&x=y');
            expect(testResult.locationReplace.url).toBe('/url?a=b&x=y');

            testResult.locationReplace.url = null;
            history.replaceState({ foo: 'bar' });
            expect(testResult.locationReplace.url).toBeNull();
        });
        it('useHashRouter=true; has pushState', function () {
            var win = _.extend({}, windowMock.HTML5, {
                location: {
                    pathname: '/path',
                    search: '?foo=bar',
                },
            });
            var history = new HistoryWithHash({ win: win, useHashRoute: true });
            history.replaceState({ foo: 'bar' }, 't', '/url');
            expect(testResult.replaceState.state).toEqual({ foo: 'bar' });
            expect(testResult.replaceState.title).toBe('t');
            expect(testResult.replaceState.url).toBe('/path?foo=bar#/url');

            history.replaceState({ foo: 'bar' }, 't', '/url?a=b&x=y');
            expect(testResult.replaceState.state).toEqual({ foo: 'bar' });
            expect(testResult.replaceState.title).toBe('t');
            expect(testResult.replaceState.url).toBe(
                '/path?foo=bar#/url?a=b&x=y',
            );
        });
        it('useHashRouter=true; has pushState; has hashRouteTransformer', function () {
            var win = _.extend({}, windowMock.HTML5, {
                location: {
                    pathname: '/path',
                    search: '?foo=bar',
                },
            });
            var history = new HistoryWithHash({
                win: win,
                useHashRoute: true,
                hashRouteTransformer: {
                    transform: function (hash) {
                        return hash.replace(/\//g, '-').replace(/\?/g, '+');
                    },
                },
            });
            history.replaceState({ foo: 'bar' }, 't', '/url');
            expect(testResult.replaceState.state).toEqual({ foo: 'bar' });
            expect(testResult.replaceState.title).toBe('t');
            expect(testResult.replaceState.url).toBe('/path?foo=bar#-url');

            history.replaceState({ foo: 'bar' }, 't', '/url?a=b&x=y');
            expect(testResult.replaceState.state).toEqual({ foo: 'bar' });
            expect(testResult.replaceState.title).toBe('t');
            expect(testResult.replaceState.url).toBe(
                '/path?foo=bar#-url+a=b&x=y',
            );
        });
        it('useHashRoute=true; no pushState', function () {
            var win = _.extend({}, windowMock.OLD, {
                location: {
                    pathname: '/path',
                    search: '?foo=bar',
                    replace: function (url) {
                        testResult.locationReplace = { url: url };
                    },
                },
            });
            var history = new HistoryWithHash({ win: win, useHashRoute: true });
            history.replaceState({ foo: 'bar' }, 't', '/url');
            expect(testResult.locationReplace.url).toBe('/path?foo=bar#/url');
            history.replaceState({ foo: 'bar' }, 't', '/url?a=b&x=y');
            expect(testResult.locationReplace.url).toBe(
                '/path?foo=bar#/url?a=b&x=y',
            );
            testResult.locationReplace.url = null;
            history.replaceState({ foo: 'bar' });
            expect(testResult.locationReplace.url).toBeNull();
        });
    });
});
