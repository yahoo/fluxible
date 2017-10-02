/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach,afterEach,window,document,navigator */
var expect = require('chai').expect;
var JSDOM = require('jsdom').JSDOM;
var React;
var ReactDOM;
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

describe('handleRoute', function () {
    var provideContext;
    var handleRoute;
    var mockContext;

    beforeEach(function () {
        var jsdom = new JSDOM('<html><body></body></html>');
        global.window = jsdom.window;
        global.document = jsdom.window.document;
        global.navigator = jsdom.window.navigator;

        React = require('react');
        ReactDOM = require('react-dom');
        ReactTestUtils = require('react-dom/test-utils');
        provideContext = require('fluxible-addons-react/provideContext');
        handleRoute = require('../../../').handleRoute;
        mockContext = createMockComponentContext({
            stores: [TestRouteStore]
        });
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
    });

    describe('refs', function () {
        it('should add a ref to class components', function () {
            class Component extends React.Component {
                render() {
                    return <noscript/>;
                }
            }
            var WrappedComponent = provideContext(handleRoute(Component));

            var component = ReactTestUtils.renderIntoDocument(<WrappedComponent context={mockContext}/>);
            expect(component.refs.wrappedElement.refs.wrappedElement.refs).to.include.keys('wrappedElement');
        });

        it('should not add a ref to pure function components', function () {
            var WrappedComponent = provideContext(handleRoute(() => <noscript/>));

            var component = ReactTestUtils.renderIntoDocument(<WrappedComponent context={mockContext}/>);
            expect(component.refs.wrappedElement.refs.wrappedElement.refs).to.not.include.keys('wrappedElement');
        });
    });
});
