/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var History = require('../../../lib/History'),
    expect = require('chai').expect,
    _ = require('lodash'),
    windowMock,
    testResult;


describe('History', function () {

    beforeEach(function () {
        testResult = {};
        windowMock = require('../../mocks/mockWindow')(testResult);
    });

    describe('constructor', function () {
        it ('has pushState', function () {
            var history = new History({win: windowMock.HTML5});
            expect(history.win).to.equal(windowMock.HTML5);
            expect(history._hasPushState).to.equal(true);
        });
        it ('no pushState', function () {
            var history = new History({win: windowMock.OLD});
            expect(history.win).to.equal(windowMock.OLD);
            expect(history._hasPushState).to.equal(false);
        });
    });

    describe('on', function () {
        it ('has pushState', function () {
            var history = new History({win: windowMock.HTML5});
            var listener = function () {};
            history.on(listener);
            expect(testResult.addEventListener).to.eql({evt: 'popstate', listener: listener});
        });
        it ('no pushState', function () {
            var history = new History({win: windowMock.OLD});
            var listener = function () {};
            history.on(listener);
            expect(testResult.addEventListener).to.eql(undefined);
        });
    });

    describe('off', function () {
        it ('has pushState', function () {
            var history = new History({win: windowMock.HTML5});
            var listener = function () {};
            history.off(listener);
            expect(testResult.removeEventListener).to.eql({evt: 'popstate', listener: listener});
        });
        it ('no pushState', function () {
            var history = new History({win: windowMock.OLD});
            var listener = function () {};
            history.off(listener);
            expect(testResult.removeEventListener).to.eql(undefined);
        });
    });

    describe('getState', function () {
        it ('has pushState', function () {
            var history = new History({win: _.merge({history: {state: {foo: 'bar'}}}, windowMock.HTML5)});
            expect(history.getState()).to.eql({foo: 'bar'});
        });
        it ('no pushState', function () {
            var history = new History({win: windowMock.OLD});
            expect(history.getState()).to.eql(null);
        });
    });

    describe('getUrl', function () {
        it ('has pushState', function () {
            var win = _.extend(windowMock.HTML5, {
                location: {
                    pathname: '/path/to/page',
                    search: '',
                    hash: '#/path/to/abc'
                }
            });
            var history = new History({win: win});
            var url = history.getUrl();
            expect(url).to.equal('/path/to/page');
        });
        it ('has pushState, should use history.state.origUrl over location', function () {
            var win = _.extend(windowMock.HTML5, {
                history: {
                    state: {
                        origUrl: '/_url'
                    }
                },
                location: {
                    pathname: '/path/to/page',
                    search: '',
                    hash: '#/path/to/abc'
                }
            });
            var history = new History({win: win});
            var url = history.getUrl();
            expect(url).to.equal('/_url');
        });
        it ('has pushState, should remove hostname from history.state.origUrl', function () {
            var win = _.extend(windowMock.HTML5, {
                history: {
                    state: {
                        origUrl: 'https://foo.com:4080/_url'
                    }
                },
                location: {
                    protocol: 'https:',
                    host: 'foo.com:4080',
                    pathname: '/path/to/page',
                    search: '',
                    hash: '#/path/to/abc'
                }
            });
            var history = new History({win: win});
            expect(history.getUrl()).to.equal('/_url');

            win.history.state.origUrl = 'https://foo.com:4080/_something?a=b';
            expect(history.getUrl()).to.equal('/_something?a=b');

            win.history.state.origUrl = 'https://foo.com:4080';
            expect(history.getUrl()).to.equal('/');

            win.history.state.origUrl = 'https://foo.com:4080/';
            expect(history.getUrl()).to.equal('/');
        });
        it ('has pushState with query', function () {
            var win = _.extend(windowMock.HTML5, {
                location: {
                    pathname: '/path/to/page',
                    search: '?foo=bar&x=y'
                }
            });
            var history = new History({win: win});
            var url = history.getUrl();
            expect(url).to.equal('/path/to/page?foo=bar&x=y');
        });
        it ('no pushState', function () {
            var win, history, url;
            win = _.extend(windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: '#/path/to/abc',
                    search: ''
                }
            });
            history = new History({win: win});
            url = history.getUrl();
            expect(url).to.equal('/path/to/page');

            win = _.extend(windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: '#',
                    search: ''
                }
            });
            history = new History({win: win});
            url = history.getUrl();
            expect(url).to.equal('/path/to/page', 'hash=#');

            win = _.extend(windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: '',
                    search: ''
                }
            });
            history = new History({win: win});
            url = history.getUrl();
            expect(url).to.equal('/path/to/page');
        });
        it ('no pushState, with query', function () {
            var win, history, url;
            win = _.extend(windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    search: '?foo=bar&x=y',
                    hash: '#xyz'
                }
            });
            history = new History({win: win});
            url = history.getUrl();
            expect(url).to.equal('/path/to/page?foo=bar&x=y');
        });
    });

    describe('pushState', function () {
        it ('has pushState', function () {
            var win = _.extend(windowMock.HTML5, {
                'document': {
                    title: 'current title'
                },
                location: {
                    href: '/currentUrl'
                }
            });
            var history = new History({win: win});

            history.pushState({foo: 'bar'});
            expect(testResult.pushState.state).to.eql({origUrl: '/currentUrl', foo: 'bar'});
            expect(testResult.pushState.title).to.equal('current title');
            expect(testResult.pushState.url).to.equal('/currentUrl');

            history.pushState({foo: 'bar'}, 't');
            expect(testResult.pushState.state).to.eql({origUrl: '/currentUrl', foo: 'bar'});
            expect(testResult.pushState.title).to.equal('t');
            expect(testResult.pushState.url).to.equal('/currentUrl');

            history.pushState({foo: 'bar'}, 't', '/url');
            expect(testResult.pushState.state).to.eql({origUrl: '/url', foo: 'bar'});
            expect(testResult.pushState.title).to.equal('t');
            expect(testResult.pushState.url).to.equal('/url');
            expect(windowMock.HTML5.document.title).to.equal('t');

            history.pushState({foo: 'bar'}, 'tt', '/url?a=b&x=y');
            expect(testResult.pushState.state).to.eql({origUrl: '/url?a=b&x=y', foo: 'bar'});
            expect(testResult.pushState.title).to.equal('tt');
            expect(testResult.pushState.url).to.equal('/url?a=b&x=y');
            expect(windowMock.HTML5.document.title).to.equal('tt');

            var unicodeUrl = '/post/128097060420/2015-fno-vogue全球購物夜-眾藝人名人共襄盛舉';
            history.pushState({foo: 'bar'}, 'tt', unicodeUrl);
            expect(testResult.pushState.state).to.eql({origUrl: unicodeUrl, foo: 'bar'});
            expect(testResult.pushState.title).to.equal('tt');
            expect(testResult.pushState.url).to.equal(unicodeUrl);
            expect(windowMock.HTML5.document.title).to.equal('tt');
        });
        it ('has pushState, Firefox', function () {
            var win = _.extend(windowMock.Firefox, {
                'document': {
                    title: 'current title'
                },
                location: {
                    href: '/currentUrl'
                }
            });
            var history = new History({win: win});

            history.pushState({foo: 'bar'});
            expect(testResult.pushState.state).to.eql({origUrl: '/currentUrl', foo: 'bar'});
            expect(testResult.pushState.title).to.equal('current title');
            expect(testResult.pushState.url).to.equal('/currentUrl');

            history.pushState({foo: 'bar'}, 't');
            expect(testResult.pushState.state).to.eql({origUrl: '/currentUrl', foo: 'bar'});
            expect(testResult.pushState.title).to.equal('t');
            expect(testResult.pushState.url).to.equal('/currentUrl');

            history.pushState({foo: 'bar'}, 't', '/url');
            expect(testResult.pushState.state).to.eql({origUrl: '/url', foo: 'bar'});
            expect(testResult.pushState.title).to.equal('t');
            expect(testResult.pushState.url).to.equal('/url');
        });
        it ('no pushState', function () {
            var win = _.extend(windowMock.OLD, {
                location: {}
            });
            var history = new History({win: win});

            history.pushState({foo: 'bar'}, 't', '/url');
            expect(win.location.href).to.equal('/url');

            history.pushState({foo: 'bar'}, 't', '/url?a=b&x=y');
            expect(win.location.href).to.equal('/url?a=b&x=y');

            history.pushState({foo: 'bar'});
            expect(win.location.href).to.equal('/url?a=b&x=y');
        });
    });

    describe('replaceState', function () {
        it ('has pushState', function () {
            var win = _.extend(windowMock.HTML5, {
                'document': {
                    title: 'current title'
                },
                location: {
                    href: '/currentUrl'
                }
            });
            var history = new History({win: win});

            history.replaceState({foo: 'bar'});
            expect(testResult.replaceState.state).to.eql({origUrl: '/currentUrl', foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('current title');
            expect(testResult.replaceState.url).to.equal('/currentUrl');

            history.replaceState({foo: 'bar'}, 't');
            expect(testResult.replaceState.state).to.eql({origUrl: '/currentUrl', foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('t');
            expect(testResult.replaceState.url).to.equal('/currentUrl');

            history.replaceState({foo: 'bar'}, 't', '/url');
            expect(testResult.replaceState.state).to.eql({origUrl: '/url', foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('t');
            expect(testResult.replaceState.url).to.equal('/url');
            expect(windowMock.HTML5.document.title).to.equal('t');

            history.replaceState({foo: 'bar'}, 'tt', '/url?a=b&x=y');
            expect(testResult.replaceState.state).to.eql({origUrl: '/url?a=b&x=y', foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('tt');
            expect(testResult.replaceState.url).to.equal('/url?a=b&x=y', 'url has query');
            expect(windowMock.HTML5.document.title).to.equal('tt');
        });
        it ('has pushState, Firefox', function () {
            var win = _.extend(windowMock.Firefox, {
                'document': {
                    title: 'current title'
                },
                location: {
                    href: '/currentUrl'
                }
            });
            var history = new History({win: win});

            history.replaceState({foo: 'bar'});
            expect(testResult.replaceState.state).to.eql({origUrl: '/currentUrl', foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('current title');
            expect(testResult.replaceState.url).to.equal('/currentUrl');

            history.replaceState({foo: 'bar'}, 't');
            expect(testResult.replaceState.state).to.eql({origUrl: '/currentUrl', foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('t');
            expect(testResult.replaceState.url).to.equal('/currentUrl');

            history.replaceState({foo: 'bar'}, 't', '/url');
            expect(testResult.replaceState.state).to.eql({origUrl: '/url', foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('t');
            expect(testResult.replaceState.url).to.equal('/url');
        });
        it ('no pushState', function () {
            var win = _.extend(windowMock.OLD, {
                location: {
                    replace: function(url) {
                        testResult.locationReplace = {url: url};
                    }
                }
            });
            var history = new History({win: win});
            history.replaceState({foo: 'bar'}, 't', '/url');
            expect(testResult.locationReplace.url).to.equal('/url');
            history.replaceState({foo: 'bar'}, 't', '/url?a=b&x=y');
            expect(testResult.locationReplace.url).to.equal('/url?a=b&x=y');
            testResult.locationReplace.url = null;
            history.replaceState({foo: 'bar'});
            expect(testResult.locationReplace.url).to.equal(null);
        });
    });

});
