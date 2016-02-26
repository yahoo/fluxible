/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach,afterEach,window,document,navigator */
var mockery = require('mockery');
var expect = require('chai').expect;
var jsdom = require('jsdom');
var React;
var ReactDOM;
var mockCreators = {
    wrappedCreator: 'createWrappedMockAppComponent',
    decoratedCreator: 'createDecoratedMockAppComponent'
};
var MockAppComponentLib;
var RouteStore = require('../../../lib/RouteStore');
var createMockComponentContext = require('fluxible/utils/createMockComponentContext');
var ReactTestUtils;

var TestRouteStore = RouteStore.withStaticRoutes({
    foo: { path: '/foo', method: 'get' },
    fooA: { path: '/foo/:a', method: 'get' },
    fooAB: { path: '/foo/:a/:b', method: 'get' },
    pathFromHistory: { path: '/the_path_from_history', method: 'get' },
    unicode: { path: 'föö', method: 'get' }
});

var testResult = {};
var historyMock = function (url, state) {
    return {
        getUrl: function () {
            return url || '/the_path_from_history';
        },
        getState: function () {
            return state;
        },
        on: function (listener) {
            testResult.historyMockOn = listener;
        },
        off: function () {
            testResult.historyMockOn = null;
        },
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
    };
};

var scrollToMock = function (x, y) {
    testResult.scrollTo = {x: x, y: y};
};

describe('handleHistory', function () {
    var mockContext;
    var provideContext;
    var handleHistory;

    beforeEach(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
        global.document = jsdom.jsdom('<html><body></body></html>');
        global.window = global.document.parentWindow;
        global.navigator = global.window.navigator;
        global.window.scrollTo = scrollToMock;
        React = require('react');
        ReactDOM = require('react-dom');
        provideContext = require('fluxible-addons-react/provideContext');
        handleHistory = require('../../../').handleHistory;
        MockAppComponentLib = require('../../mocks/MockAppComponent');
        ReactTestUtils = require('react-addons-test-utils');
        mockContext = createMockComponentContext({
            stores: [TestRouteStore]
        });
        testResult = {};
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
        mockery.disable();
    });

    describe('statics', function () {
        it('should hoist non-react statics to wrapper', function () {
            var App = React.createClass({
                displayName: 'Child',
                statics: {
                    initAction: function () {}
                },
                render: function () {
                    return null;
                }
            });
            var Wrapper = handleHistory(App);
            expect(Wrapper.displayName).to.not.equal(App.displayName);
            expect(Wrapper.initAction).to.be.a('function');
        });
    });

    describe('refs', function () {
        it('should add a ref to class components', function () {
            class Component extends React.Component {
                render() {
                    return <noscript/>;
                }
            }
            var WrappedComponent = provideContext(handleHistory(Component));

            var component = ReactTestUtils.renderIntoDocument(<WrappedComponent context={mockContext}/>);
            expect(component.refs.wrappedElement.refs.wrappedElement.refs.wrappedElement.refs).to.include.keys('wrappedElement');
        });

        it('should not add a ref to pure function components', function () {
            var WrappedComponent = provideContext(handleHistory(() => <noscript/>));

            var component = ReactTestUtils.renderIntoDocument(<WrappedComponent context={mockContext}/>);
            expect(component.refs.wrappedElement.refs.wrappedElement.refs.wrappedElement.refs).to.not.include.keys('wrappedElement');
        });
    });

    Object.keys(mockCreators).forEach(function (testType) {
        describe(testType, function () {
            var mockCreator;

            beforeEach(function () {
                var methodName = mockCreators[testType];
                mockCreator = MockAppComponentLib[methodName];
            });

            describe('render', function () {
                it('should pass the currentRoute as prop to child', function () {
                    var rendered = false;
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var Child = React.createClass({
                        displayName: 'Child',
                        render: function () {
                            rendered = true;
                            expect(this.props.currentRoute).to.be.an('object');
                            expect(this.props.currentRoute.url).to.equal('/foo');
                            return null;
                        }
                    });
                    var MockAppComponent = mockCreator();
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext}>
                            <Child />
                        </MockAppComponent>
                    );
                    expect(rendered).to.equal(true);
                });
            });

            describe('componentDidMount()', function () {
                it('listen to popstate event', function () {
                    var MockAppComponent = mockCreator();
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    window.dispatchEvent({_type: 'popstate', state: {fluxible: true, params: {a: 1}}});
                    expect(mockContext.executeActionCalls.length).to.equal(1);
                    expect(mockContext.executeActionCalls[0].action).to.be.a('function');
                    expect(mockContext.executeActionCalls[0].payload.type).to.equal('popstate');
                    expect(mockContext.executeActionCalls[0].payload.url).to.equal(window.location.pathname);
                    expect(mockContext.executeActionCalls[0].payload.params).to.deep.equal({a: 1});
                });
                it('handle pre-emptive popstate events', function (done) {
                    var MockAppComponent = mockCreator();
                    window.dispatchEvent({_type: 'popstate', state: {fluxible: true, params: {a: 1}}});
                    window.dispatchEvent({_type: 'popstate', state: {fluxible: true, params: {a: 2}}});
                    window.dispatchEvent({_type: 'popstate', state: {fluxible: true, params: {a: 3}}});
                    setTimeout(function () {
                        ReactTestUtils.renderIntoDocument(
                            <MockAppComponent context={mockContext} />
                        );
                        expect(mockContext.executeActionCalls.length).to.equal(1);
                        expect(mockContext.executeActionCalls[0].action).to.be.a('function');
                        expect(mockContext.executeActionCalls[0].payload.type).to.equal('popstate');
                        expect(mockContext.executeActionCalls[0].payload.url).to.equal(window.location.pathname);
                        expect(mockContext.executeActionCalls[0].payload.params).to.deep.equal({a: 3});
                        done();
                    }, 10);
                });
                it('ignores non-fluxible pre-emptive popstate events', function(done) {
                    var MockAppComponent = mockCreator();
                    window.dispatchEvent({_type: 'popstate', state: {params: {a: 1}}});
                    window.dispatchEvent({_type: 'popstate', state: {fluxible: false, params: {a: 2}}});
                    setTimeout(function () {
                        ReactTestUtils.renderIntoDocument(
                            <MockAppComponent context={mockContext} />
                        );
                        expect(mockContext.executeActionCalls.length).to.equal(0);
                        done();
                    }, 10);
                });
                it('replaces state of page on initial page load', function(done) {
                    var MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo', {fluxible: true});
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    window.setTimeout(function () {
                        expect(testResult.replaceState).to.eql({state: {fluxible: true}, title: '', url: '/foo'});
                        done();

                    }, 10);
                });
                it('listen to scroll event', function (done) {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/the_path_from_state', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock();
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    window.dispatchEvent({_type: 'scroll'});
                    window.dispatchEvent({_type: 'scroll'});
                    window.setTimeout(function() {
                        expect(testResult.replaceState).to.eql({state: {scroll: {x: 0, y: 0}}, title: undefined, url: undefined});
                        done();
                    }, 150);
                });
                it('dispatch navigate event for pages that url does not match', function (done) {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/the_path_from_state', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        checkRouteOnPageLoad: true,
                        historyCreator: function () {
                            return historyMock();
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    window.setTimeout(function() {
                        expect(mockContext.executeActionCalls.length).to.equal(1);
                        expect(mockContext.executeActionCalls[0].action).to.be.a('function');
                        expect(mockContext.executeActionCalls[0].payload.type).to.equal('pageload');
                        expect(mockContext.executeActionCalls[0].payload.url).to.equal('/the_path_from_history');
                        done();
                    }, 150);
                });
                it('does not dispatch navigate event for pages with matching url', function (done) {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/the_path_from_history', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo');
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    window.setTimeout(function() {
                        expect(testResult.dispatch).to.equal(undefined, JSON.stringify(testResult.dispatch));
                        done();
                    }, 10);
                });
                describe('window.onbeforeunload', function () {
                    beforeEach(function () {
                        global.window.confirm = function () { return false; };
                        global.window.onbeforeunload = function () {
                            return 'this is a test';
                        };
                    });

                    it('does not dispatch navigate event if there is a window.onbeforeunload method that the user does not confirm', function (done) {
                        var routeStore = mockContext.getStore('RouteStore');
                        routeStore._handleNavigateStart({url: '/the_path_from_history', method: 'GET'});
                        var MockAppComponent = mockCreator({
                            historyCreator: function () {
                                return historyMock('/foo');
                            }
                        });
                        ReactTestUtils.renderIntoDocument(
                            <MockAppComponent context={mockContext} />
                        );
                        window.setTimeout(function() {
                            expect(testResult.dispatch).to.equal(undefined, JSON.stringify(testResult.dispatch));
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
                        }
                    });
                    ReactDOM.render(
                        <MockAppComponent context={mockContext} />
                        , div);
                    ReactDOM.unmountComponentAtNode(div);
                    expect(testResult.historyMockOn).to.equal(null);
                    window.dispatchEvent({_type: 'popstate', state: {params: {a: 1}}});
                    expect(testResult.dispatch).to.equal(undefined);
                });
            });

            describe('componentDidUpdate()', function () {
                it('no-op on same route', function () {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo');
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    expect(testResult.pushState).to.equal(undefined);
                });
                it('do not pushState, navigate.type=popstate', function () {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo');
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/bar', type: 'popstate', method: 'GET'});
                    expect(testResult.pushState).to.equal(undefined);
                });
                it('update with different route, navigate.type=click, reset scroll position', function () {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo');
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/bar', method: 'GET'});
                    expect(testResult.pushState).to.eql({state: {params: {}, scroll: {x: 0, y: 0}}, title: null, url: '/bar'});
                    expect(testResult.scrollTo).to.eql({x: 0, y: 0});
                });
                it('update with unicode route, navigate.type=click, reset scroll position', function () {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo');
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/föö', method: 'GET'});
                    expect(testResult.pushState).to.eql({state: {params: {}, scroll: {x: 0, y: 0}}, title: null, url: '/föö'});
                    expect(testResult.scrollTo).to.eql({x: 0, y: 0});
                });
                it('update with different route, navigate.type=click, enableScroll=false, do not reset scroll position', function () {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        enableScroll: false,
                        historyCreator: function () {
                            return historyMock('/foo');
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/bar', method: 'GET'});
                    expect(testResult.pushState).to.eql({state: {params: {}, scroll: {x: 0, y: 0}}, title: null, url: '/bar'});
                    expect(testResult.scrollTo).to.equal(undefined);
                });
                it('update with different route, navigate.type=replacestate, enableScroll=false, do not reset scroll position', function () {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        enableScroll: false,
                        historyCreator: function () {
                            return historyMock('/foo');
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/bar', method: 'GET', type: 'replacestate'});
                    expect(testResult.replaceState).to.eql({state: {params: {}, scroll: {x: 0, y: 0}}, title: null, url: '/bar'});
                    expect(testResult.scrollTo).to.equal(undefined);
                });
                it('update with different route, navigate.type=default, reset scroll position', function () {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo');
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/bar', method: 'GET'});
                    expect(testResult.pushState).to.eql({state: {params: {}, scroll: {x: 0, y: 0} }, title: null, url: '/bar'});
                    expect(testResult.scrollTo).to.eql({x: 0, y: 0});
                });
                it('update with different route, navigate.type=default, enableScroll=false, do not reset scroll position', function () {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        enableScroll: false,
                        historyCreator: function () {
                            return historyMock('/foo', {scroll: {x: 12, y: 200}});
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/bar', method: 'GET'});
                    expect(testResult.pushState).to.eql({state: {params: {}, scroll: {x: 0, y: 0}}, title: null, url: '/bar'});
                    expect(testResult.scrollTo).to.equal(undefined);
                });
                it('do not pushState, navigate.type=popstate, restore scroll position', function () {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo#hash1', {scroll: {x: 12, y: 200}});
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/foo#hash1', method: 'GET', type: 'popstate'});
                    expect(testResult.pushState).to.equal(undefined);
                    expect(testResult.scrollTo).to.eql({x: 12, y: 200});
                });
                it('do not pushState, navigate.type=popstate, enableScroll=false, restore scroll position', function () {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        enableScroll: false,
                        historyCreator: function () {
                            return historyMock('/foo#hash1', {scroll: {x: 12, y: 200}});
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/bar', method: 'GET', type: 'popstate'});
                    expect(testResult.pushState).to.equal(undefined);
                    expect(testResult.scrollTo).to.eql(undefined);
                });
                it('update with different route, navigate.type=click, with params', function () {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo#hash1');
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/bar', type: 'click', params: {foo: 'bar'}});
                    expect(testResult.pushState).to.eql({state: {params: {foo: 'bar'}, scroll: {x: 0, y: 0}}, title: null, url: '/bar'});
                });
                it('update with same path and different hash, navigate.type=click, with params', function () {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo#hash1', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo#hash1');
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/foo#hash2', type: 'click', params: {foo: 'bar'}});
                    expect(testResult.pushState).to.eql({state: {params: {foo: 'bar'}, scroll: {x: 0, y: 0}}, title: null, url: '/foo#hash2'});
                });
                it('update with different route, navigate.type=replacestate, with params', function () {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo');
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/bar', method: 'GET', type: 'replacestate', params: {foo: 'bar'}});
                    expect(testResult.replaceState).to.eql({state: {params: {foo: 'bar'}, scroll: {x: 0, y: 0}}, title: null, url: '/bar'});
                });
                it('update with different route, navigate.type=replacestate', function () {
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo', {scroll: {x: 42, y: 3}});
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/bar', method: 'GET', type: 'replacestate'});
                    expect(testResult.replaceState).to.eql({state: {params: {}, scroll: {x: 0, y: 0}}, title: null, url: '/bar'});
                });
                it('update with different route, navigate.type=pushstate, preserve scroll state', function () {
                    global.window.scrollX = 42;
                    global.window.scrollY = 3;
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo');
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/bar', method: 'GET', type: 'click', preserveScrollPosition: true});
                    expect(testResult.pushState).to.eql({state: {params: {}, scroll: {x: 42, y: 3}}, title: null, url: '/bar'});
                });
                it('update with different route, navigate.type=replacestate, preserve scroll state', function () {
                    global.window.scrollX = 42;
                    global.window.scrollY = 3;
                    var routeStore = mockContext.getStore('RouteStore');
                    routeStore._handleNavigateStart({url: '/foo', method: 'GET'});
                    var MockAppComponent = mockCreator({
                        historyCreator: function () {
                            return historyMock('/foo');
                        }
                    });
                    ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext} />
                    );
                    routeStore._handleNavigateStart({url: '/bar', method: 'GET', type: 'replacestate', preserveScrollPosition: true});
                    expect(testResult.replaceState).to.eql({state: {params: {}, scroll: {x: 42, y: 3}}, title: null, url: '/bar'});
                });
            });
        });
    });

});
