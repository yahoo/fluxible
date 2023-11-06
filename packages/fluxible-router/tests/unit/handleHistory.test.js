/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const { JSDOM } = require('jsdom');
const PropTypes = require('prop-types');
const createMockComponentContext = require('fluxible/utils/createMockComponentContext');
const { provideContext } = require('fluxible-addons-react');
const { RouteStore } = require('../../');

var MockAppComponentLib;

var TestRouteStore = RouteStore.withStaticRoutes({
    foo: { path: '/foo', method: 'get' },
    fooA: { path: '/foo/:a', method: 'get' },
    fooAB: { path: '/foo/:a/:b', method: 'get' },
    pathFromHistory: { path: '/the_path_from_history', method: 'get' },
    unicode: { path: 'föö', method: 'get' },
});

var testResult = {};
var historyMock = function (url, state) {
    var states = [state];
    return {
        getUrl: function () {
            return url || '/the_path_from_history';
        },
        getState: function () {
            return states.slice(-1)[0];
        },
        on: function (listener) {
            testResult.historyMockOn = listener;
        },
        off: function () {
            testResult.historyMockOn = null;
        },
        pushState: function (state, title, url) {
            states.push(state);
            testResult.pushState = testResult.pushState || [];
            testResult.pushState.push({
                state: state,
                title: title,
                url: url,
            });
        },
        replaceState: function (state, title, url) {
            states[states.length - 1] = state;
            testResult.replaceState = testResult.replaceState || [];
            testResult.replaceState.push({
                state: state,
                title: title,
                url: url,
            });
        },
    };
};

var scrollToMock = function (x, y) {
    testResult.scrollTo = { x: x, y: y };
};

describe('handleHistory', function () {
    var mockContext;
    var handleHistory;

    beforeEach(function () {
        var jsdom = new JSDOM('<html><body></body></html>');
        global.window = jsdom.window;
        global.document = jsdom.window.document;
        global.navigator = jsdom.window.navigator;
        global.window.scrollTo = scrollToMock;
        global.Event = window.Event;

        jest.resetModules();

        handleHistory = require('../../').handleHistory;
        MockAppComponentLib = require('../mocks/MockAppComponent');
        mockContext = createMockComponentContext({
            stores: [TestRouteStore],
        });
        testResult = {};
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
    });

    describe('statics', function () {
        it('should hoist non-react statics to wrapper', function () {
            class App extends React.Component {
                static displayName = 'Child';
                static initAction() {}

                render() {
                    return null;
                }
            }

            var Wrapper = handleHistory(App);
            expect(Wrapper.displayName).not.toBe(App.displayName);
            expect(Wrapper.initAction).toBeInstanceOf(Function);
        });
    });

    describe('wrappedCreator', function () {
        var mockCreator;

        beforeEach(function () {
            mockCreator =
                require('../mocks/MockAppComponent').createWrappedMockAppComponent;
        });

        describe('render', function () {
            it('should pass the currentRoute as prop to child', function () {
                var rendered = false;
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });

                class Child extends React.Component {
                    render() {
                        rendered = true;
                        expect(this.props.currentRoute).toBeInstanceOf(Object);
                        expect(this.props.currentRoute.url).toBe('/foo');
                        return null;
                    }
                }
                Child.propTypes = { currentRoute: PropTypes.object };

                var MockAppComponent = mockCreator();
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext}>
                        <Child />
                    </MockAppComponent>,
                );
                expect(rendered).toBe(true);
            });
        });

        describe('componentDidMount()', function () {
            it('listen to popstate event', function () {
                var MockAppComponent = mockCreator();
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                window.dispatchEvent(
                    Object.assign(new Event('popstate'), {
                        state: { params: { a: 1 } },
                    }),
                );
                expect(mockContext.executeActionCalls.length).toBe(1);
                expect(mockContext.executeActionCalls[0].action).toBeInstanceOf(
                    Function,
                );
                expect(mockContext.executeActionCalls[0].payload.type).toBe(
                    'popstate',
                );
                expect(mockContext.executeActionCalls[0].payload.url).toBe(
                    window.location.pathname,
                );
                expect(
                    mockContext.executeActionCalls[0].payload.params,
                ).toEqual({ a: 1 });
            });
            it('handle pre-emptive popstate events', function (done) {
                var MockAppComponent = mockCreator();
                window.dispatchEvent(
                    Object.assign(new Event('popstate'), {
                        state: { params: { a: 1 } },
                    }),
                );
                window.dispatchEvent(
                    Object.assign(new Event('popstate'), {
                        state: { params: { a: 2 } },
                    }),
                );
                window.dispatchEvent(
                    Object.assign(new Event('popstate'), {
                        state: { params: { a: 3 } },
                    }),
                );
                setTimeout(function () {
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />,
                    );
                    expect(mockContext.executeActionCalls.length).toBe(1);
                    expect(
                        mockContext.executeActionCalls[0].action,
                    ).toBeInstanceOf(Function);
                    expect(mockContext.executeActionCalls[0].payload.type).toBe(
                        'popstate',
                    );
                    expect(mockContext.executeActionCalls[0].payload.url).toBe(
                        window.location.pathname,
                    );
                    expect(
                        mockContext.executeActionCalls[0].payload.params,
                    ).toEqual({ a: 3 });
                    done();
                }, 10);
            });
            it('listen to scroll event', function (done) {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({
                    url: '/the_path_from_state',
                    method: 'GET',
                });
                var MockAppComponent = mockCreator({
                    historyCreator: function () {
                        return historyMock();
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                window.scrollY = 0;
                window.dispatchEvent(new Event('scroll'));
                window.dispatchEvent(new Event('scroll'));
                window.setTimeout(function () {
                    expect(testResult.replaceState.length).toBe(1); // should just execute replaceState once since the second one doesn't change position
                    expect(testResult.replaceState[0]).toEqual({
                        state: { scroll: { x: 0, y: 0 } },
                        title: undefined,
                        url: undefined,
                    });
                    window.scrollY = 100;
                    window.dispatchEvent(new Event('scroll'));
                    window.setTimeout(function () {
                        expect(testResult.replaceState.length).toBe(2);
                        expect(testResult.replaceState[1]).toEqual({
                            state: { scroll: { x: 0, y: 100 } },
                            title: undefined,
                            url: undefined,
                        });
                        done();
                    }, 150);
                }, 150);
            });
            it('dispatch navigate event for pages that url does not match', function (done) {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({
                    url: '/the_path_from_state',
                    method: 'GET',
                });
                var MockAppComponent = mockCreator({
                    checkRouteOnPageLoad: true,
                    historyCreator: function () {
                        return historyMock();
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                window.setTimeout(function () {
                    expect(mockContext.executeActionCalls.length).toBe(1);
                    expect(
                        mockContext.executeActionCalls[0].action,
                    ).toBeInstanceOf(Function);
                    expect(mockContext.executeActionCalls[0].payload.type).toBe(
                        'pageload',
                    );
                    expect(mockContext.executeActionCalls[0].payload.url).toBe(
                        '/the_path_from_history',
                    );
                    done();
                }, 150);
            });
            it('does not dispatch navigate event for pages with matching url', function (done) {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({
                    url: '/the_path_from_history',
                    method: 'GET',
                });
                var MockAppComponent = mockCreator({
                    historyCreator: function () {
                        return historyMock('/foo');
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                window.setTimeout(function () {
                    expect(testResult.dispatch).toBe(undefined);
                    done();
                }, 10);
            });
            describe('handle popstate event on page load', function () {
                it('execute navigation action when ignorePopstateOnPageLoad is false', function (done) {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({
                        url: '/foo',
                        method: 'GET',
                    });
                    var MockAppComponent = mockCreator({
                        checkRouteOnPageLoad: false,
                        historyCreator: function () {
                            return historyMock('/browserUrl', { a: 1 });
                        },
                        ignorePopstateOnPageLoad: false,
                    });

                    // simulate page load popstate
                    window.dispatchEvent(
                        Object.assign(new Event('popstate'), { state: null }),
                    );

                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />,
                    );

                    setTimeout(function () {
                        expect(mockContext.executeActionCalls.length).toBe(1);
                        expect(
                            mockContext.executeActionCalls[0].action,
                        ).toBeInstanceOf(Function);
                        expect(
                            mockContext.executeActionCalls[0].payload.type,
                        ).toBe('popstate');
                        expect(
                            mockContext.executeActionCalls[0].payload.url,
                        ).toBe('/browserUrl');
                        done();
                    }, 150);
                });
                it('skip navigation action when ignorePopstateOnPageLoad is true', function (done) {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({
                        url: '/foo',
                        method: 'GET',
                    });
                    var MockAppComponent = mockCreator({
                        checkRouteOnPageLoad: false,
                        historyCreator: function () {
                            return historyMock('/browserUrl', { a: 1 });
                        },
                        ignorePopstateOnPageLoad: true,
                    });

                    // simulate page load popstate
                    window.dispatchEvent(
                        Object.assign(new Event('popstate'), { state: null }),
                    );

                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />,
                    );

                    setTimeout(function () {
                        expect(mockContext.executeActionCalls.length).toBe(0);
                        done();
                    }, 150);
                });
                it('ignorePopstateOnPageLoad can be a function that returns false', function (done) {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({
                        url: '/foo',
                        method: 'GET',
                    });
                    var MockAppComponent = mockCreator({
                        checkRouteOnPageLoad: false,
                        historyCreator: function () {
                            return historyMock('/browserUrl', { a: 1 });
                        },
                        ignorePopstateOnPageLoad: function () {
                            return false;
                        },
                    });

                    // simulate page load popstate
                    window.dispatchEvent(
                        Object.assign(new Event('popstate'), { state: null }),
                    );

                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />,
                    );

                    setTimeout(function () {
                        expect(mockContext.executeActionCalls.length).toBe(1);
                        expect(
                            mockContext.executeActionCalls[0].action,
                        ).toBeInstanceOf(Function);
                        expect(
                            mockContext.executeActionCalls[0].payload.type,
                        ).toBe('popstate');
                        expect(
                            mockContext.executeActionCalls[0].payload.url,
                        ).toBe('/browserUrl');
                        done();
                    }, 150);
                });
                it('ignorePopstateOnPageLoad can be a function that returns true', function (done) {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({
                        url: '/foo',
                        method: 'GET',
                    });
                    var MockAppComponent = mockCreator({
                        checkRouteOnPageLoad: false,
                        historyCreator: function () {
                            return historyMock('/browserUrl', { a: 1 });
                        },
                        ignorePopstateOnPageLoad: function () {
                            return true;
                        },
                    });

                    // simulate page load popstate
                    window.dispatchEvent(
                        Object.assign(new Event('popstate'), { state: null }),
                    );

                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />,
                    );

                    setTimeout(function () {
                        expect(mockContext.executeActionCalls.length).toBe(0);
                        done();
                    }, 150);
                });
            });
            describe('window.onbeforeunload', function () {
                var MockAppComponent;
                beforeEach(function () {
                    global.window.dispatchEvent(
                        Object.assign(new Event('popstate'), {}),
                    );
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({
                        url: '/the_path_from_history',
                        method: 'GET',
                    });
                });

                it('does not execute navigate action if there is a window.onbeforeunload method that the user does not confirm', function (done) {
                    global.window.confirm = function () {
                        return false;
                    };
                    global.window.onbeforeunload = function () {
                        return 'this is a test';
                    };
                    MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo');
                        },
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />,
                    );
                    window.setTimeout(function () {
                        expect(testResult.pushState).toHaveLength(1);
                        expect(testResult.pushState[0].url).toBe(
                            '/the_path_from_history',
                        );
                        expect(mockContext.executeActionCalls.length).toBe(0);
                        done();
                    }, 10);
                });

                it('should ignore any error which happens when calling onbeforeunload', function (done) {
                    var loggerWarning;
                    global.console.warn = (...args) => {
                        loggerWarning = args;
                    };
                    global.window.confirm = function () {
                        return false;
                    };
                    global.window.onbeforeunload = function () {
                        throw new Error('Test error');
                    };
                    MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo');
                        },
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />,
                    );
                    window.setTimeout(function () {
                        expect(loggerWarning[0]).toBe(
                            'Warning: Call of window.onbeforeunload failed',
                        );
                        expect(loggerWarning[1].message).toBe('Test error');
                        expect(testResult.pushState).toBeUndefined();
                        expect(mockContext.executeActionCalls.length).toBe(1);
                        done();
                    }, 10);
                });
            });
        });

        describe('componentWillUnmount()', function () {
            it('stop listening to popstate event', function () {
                var div = document.createElement('div');
                var MockAppComponent = mockCreator({
                    historyCreator: function () {
                        return historyMock('/foo');
                    },
                });
                ReactDOM.render(
                    <MockAppComponent context={mockContext} />,
                    div,
                );
                ReactDOM.unmountComponentAtNode(div);
                expect(testResult.historyMockOn).toBeNull();
                window.dispatchEvent(
                    Object.assign(new Event('popstate'), {
                        state: { params: { a: 1 } },
                    }),
                );
                expect(testResult.dispatch).toBeUndefined();
            });
        });

        describe('componentDidUpdate()', function () {
            it('no-op on same route', function () {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    historyCreator: function () {
                        return historyMock('/foo');
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                expect(testResult.pushState).toBeUndefined();
            });
            it('do not pushState, navigate.type=popstate', function () {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    historyCreator: function () {
                        return historyMock('/foo');
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({
                    url: '/bar',
                    type: 'popstate',
                    method: 'GET',
                });
                expect(testResult.pushState).toBeUndefined();
            });
            it('update with different route, navigate.type=click, reset scroll position', function () {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    historyCreator: function () {
                        return historyMock('/foo');
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({ url: '/bar', method: 'GET' });
                expect(testResult.pushState[0]).toEqual({
                    state: { params: {}, query: {}, scroll: { x: 0, y: 0 } },
                    title: null,
                    url: '/bar',
                });
                expect(testResult.scrollTo).toEqual({ x: 0, y: 0 });
            });
            it('update with unicode route, navigate.type=click, reset scroll position', function () {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    historyCreator: function () {
                        return historyMock('/foo');
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({ url: '/föö', method: 'GET' });
                expect(testResult.pushState[0]).toEqual({
                    state: { params: {}, query: {}, scroll: { x: 0, y: 0 } },
                    title: null,
                    url: '/föö',
                });
                expect(testResult.scrollTo).toEqual({ x: 0, y: 0 });
            });
            it('update with different route, navigate.type=click, enableScroll=false, do not reset scroll position', function () {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    enableScroll: false,
                    historyCreator: function () {
                        return historyMock('/foo');
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({ url: '/bar', method: 'GET' });
                expect(testResult.pushState[0]).toEqual({
                    state: { params: {}, query: {}, scroll: { x: 0, y: 0 } },
                    title: null,
                    url: '/bar',
                });
                expect(testResult.scrollTo).toBeUndefined();
            });
            it('update with different route, navigate.type=replacestate, enableScroll=false, do not reset scroll position', function () {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    enableScroll: false,
                    historyCreator: function () {
                        return historyMock('/foo');
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({
                    url: '/bar',
                    method: 'GET',
                    type: 'replacestate',
                });
                expect(testResult.replaceState[0]).toEqual({
                    state: { params: {}, query: {}, scroll: { x: 0, y: 0 } },
                    title: null,
                    url: '/bar',
                });
                expect(testResult.scrollTo).toBeUndefined();
            });
            it('update with different route, navigate.type=default, reset scroll position', function () {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    historyCreator: function () {
                        return historyMock('/foo');
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({ url: '/bar', method: 'GET' });
                expect(testResult.pushState[0]).toEqual({
                    state: { params: {}, query: {}, scroll: { x: 0, y: 0 } },
                    title: null,
                    url: '/bar',
                });
                expect(testResult.scrollTo).toEqual({ x: 0, y: 0 });
            });
            it('update with different route, navigate.type=default, enableScroll=false, do not reset scroll position', function () {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    enableScroll: false,
                    historyCreator: function () {
                        return historyMock('/foo', {
                            scroll: { x: 12, y: 200 },
                        });
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({ url: '/bar', method: 'GET' });
                expect(testResult.pushState[0]).toEqual({
                    state: { params: {}, query: {}, scroll: { x: 0, y: 0 } },
                    title: null,
                    url: '/bar',
                });
                expect(testResult.scrollTo).toBeUndefined();
            });
            it('do not pushState, navigate.type=popstate, restore scroll position', function () {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    historyCreator: function () {
                        return historyMock('/foo#hash1', {
                            scroll: { x: 12, y: 200 },
                        });
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({
                    url: '/foo#hash1',
                    method: 'GET',
                    type: 'popstate',
                });
                expect(testResult.pushState).toBeUndefined();
                expect(testResult.scrollTo).toEqual({ x: 12, y: 200 });
            });
            it('do not pushState, navigate.type=popstate, enableScroll=false, restore scroll position', function () {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    enableScroll: false,
                    historyCreator: function () {
                        return historyMock('/foo#hash1', {
                            scroll: { x: 12, y: 200 },
                        });
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({
                    url: '/bar',
                    method: 'GET',
                    type: 'popstate',
                });
                expect(testResult.pushState).toBeUndefined();
                expect(testResult.scrollTo).toEqual(undefined);
            });
            it('do not save scroll position, saveScrollInState=false', function () {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    saveScrollInState: false,
                    historyCreator: function () {
                        return historyMock('/foo#hash1');
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({
                    url: '/bar',
                    type: 'click',
                    params: { foo: 'bar' },
                });
                expect(testResult.pushState[0].state.scroll).toEqual(undefined);
            });
            it('update with different route, navigate.type=click, with params', function () {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    historyCreator: function () {
                        return historyMock('/foo#hash1');
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({
                    url: '/bar',
                    type: 'click',
                    params: { foo: 'bar' },
                });
                expect(testResult.pushState[0]).toEqual({
                    state: {
                        params: { foo: 'bar' },
                        query: {},
                        scroll: { x: 0, y: 0 },
                    },
                    title: null,
                    url: '/bar',
                });
            });
            it('update with same path and different hash, navigate.type=click, with params', function () {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({
                    url: '/foo#hash1',
                    method: 'GET',
                });
                var MockAppComponent = mockCreator({
                    historyCreator: function () {
                        return historyMock('/foo#hash1');
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({
                    url: '/foo#hash2',
                    type: 'click',
                    params: { foo: 'bar' },
                });
                expect(testResult.pushState[0]).toEqual({
                    state: {
                        params: { foo: 'bar' },
                        query: {},
                        scroll: { x: 0, y: 0 },
                    },
                    title: null,
                    url: '/foo#hash2',
                });
            });
            it('update with different route, navigate.type=replacestate, with params', function () {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    historyCreator: function () {
                        return historyMock('/foo');
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({
                    url: '/bar',
                    method: 'GET',
                    type: 'replacestate',
                    params: { foo: 'bar' },
                });
                expect(testResult.replaceState[0]).toEqual({
                    state: {
                        params: { foo: 'bar' },
                        query: {},
                        scroll: { x: 0, y: 0 },
                    },
                    title: null,
                    url: '/bar',
                });
            });
            it('update with different route, navigate.type=replacestate', function () {
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    historyCreator: function () {
                        return historyMock('/foo', { scroll: { x: 42, y: 3 } });
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({
                    url: '/bar',
                    method: 'GET',
                    type: 'replacestate',
                });
                expect(testResult.replaceState[0]).toEqual({
                    state: { params: {}, query: {}, scroll: { x: 0, y: 0 } },
                    title: null,
                    url: '/bar',
                });
            });
            it('update with different route, navigate.type=pushstate, preserve scroll state', function () {
                global.window.scrollX = 42;
                global.window.scrollY = 3;
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    historyCreator: function () {
                        return historyMock('/foo');
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({
                    url: '/bar',
                    method: 'GET',
                    type: 'click',
                    preserveScrollPosition: true,
                });
                expect(testResult.pushState[0]).toEqual({
                    state: { params: {}, query: {}, scroll: { x: 42, y: 3 } },
                    title: null,
                    url: '/bar',
                });
            });
            it('update with different route, navigate.type=replacestate, preserve scroll state', function () {
                global.window.scrollX = 42;
                global.window.scrollY = 3;
                var routeStore = mockContext.getStore('RouteStore');
                routeStore._handleNavigateStart({ url: '/foo', method: 'GET' });
                var MockAppComponent = mockCreator({
                    historyCreator: function () {
                        return historyMock('/foo');
                    },
                });
                ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext} />,
                );
                routeStore._handleNavigateStart({
                    url: '/bar',
                    method: 'GET',
                    type: 'replacestate',
                    preserveScrollPosition: true,
                });
                expect(testResult.replaceState[0]).toEqual({
                    state: { params: {}, query: {}, scroll: { x: 42, y: 3 } },
                    title: null,
                    url: '/bar',
                });
            });
        });
    });
});
