/*globals describe,it,afterEach,beforeEach*/
'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var React;
var ReactTestUtils;
var connectToStores;
var provideContext;
var FluxibleComponent;
var FooStore = require('../../fixtures/stores/FooStore');
var BarStore = require('../../fixtures/stores/BarStore');
var createMockComponentContext = require('../../../utils/createMockComponentContext');
var jsdom = require('jsdom');

describe('FluxibleComponent', function () {
    var context;

    beforeEach(function (done) {
        jsdom.env('<html><body></body></html>', [], function (err, window) {
            global.window = window;
            global.document = window.document;
            global.navigator = window.navigator;

            context = createMockComponentContext({
                stores: [FooStore, BarStore]
            });

            mockery.enable({
                warnOnReplace: false,
                warnOnUnregistered: false,
                useCleanCache: true
            });
            React = require('react/addons');
            ReactTestUtils = require('react/lib/ReactTestUtils');
            connectToStores = require('../../../addons/connectToStores');
            provideContext = require('../../../addons/provideContext');
            FluxibleComponent = require('../../../addons/FluxibleComponent');

            done();
        });
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
        mockery.disable();
    });

    it('will not double render', function () {
        const Component = React.createClass({
            render: function() {
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
        expect(React.findDOMNode(element).outerHTML).to.equal(
            '<div class="Component" data-reactid=".0">Some child</div>'
        );
    });

    it('should pass context prop to child', function (done) {
        const Component = React.createClass({
            render: function() {
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
