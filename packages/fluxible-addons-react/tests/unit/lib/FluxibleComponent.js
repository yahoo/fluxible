/*globals describe,it,afterEach,beforeEach*/
/*eslint react/prop-types:0, react/no-render-return-value:0, react/no-find-dom-node:0 */
'use strict';

var expect = require('chai').expect;
var React;
var ReactDOM;
var ReactTestUtils;
var connectToStores;
var provideContext;
var FluxibleComponent;
var createReactClass;
var FooStore = require('../../fixtures/stores/FooStore');
var BarStore = require('../../fixtures/stores/BarStore');
var createMockComponentContext = require('fluxible/utils/createMockComponentContext');
var JSDOM = require('jsdom').JSDOM;

describe('fluxible-addons-react', function () {
    describe('FluxibleComponent', function () {
        var context;

        beforeEach(function () {
            var jsdom = new JSDOM('<html><body></body></html>');
            global.window = jsdom.window;
            global.document = jsdom.window.document;
            global.navigator = jsdom.window.navigator;

            context = createMockComponentContext({
                stores: [FooStore, BarStore]
            });

            React = require('react');
            ReactDOM = require('react-dom');
            createReactClass = require('create-react-class');
            ReactTestUtils = require('react-dom/test-utils');
            connectToStores = require('../../../').connectToStores;
            provideContext = require('../../../').provideContext;
            FluxibleComponent = require('../../../').FluxibleComponent;
        });

        afterEach(function () {
            delete global.window;
            delete global.document;
            delete global.navigator;
        });

        it('will not double render', function () {
            const Component = createReactClass({
                render: function () {
                    return (
                        <div className="Component">{this.props.children}</div>
                    );
                }
            });
            const element = ReactTestUtils.renderIntoDocument(
                <FluxibleComponent context={context}>
                    <Component>Some child</Component>
                </FluxibleComponent>
            );
            expect(ReactDOM.findDOMNode(element).className).to.equal('Component');
            expect(ReactDOM.findDOMNode(element).textContent).to.equal('Some child');
        });

        it('should pass context prop to child', function (done) {
            const Component = createReactClass({
                render: function () {
                    expect(this.props.context).to.equal(context);
                    done();
                    return (
                        <div className="Component">{this.props.children}</div>
                    );
                }
            });
            const element = ReactTestUtils.renderIntoDocument(
                <FluxibleComponent context={context}>
                    <Component>Some child</Component>
                </FluxibleComponent>
            );
        });
    });
});
