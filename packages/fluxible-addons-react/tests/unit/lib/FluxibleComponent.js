/*globals describe,it,afterEach,beforeEach*/
'use strict';

var expect = require('chai').expect;
var React;
var ReactDOM;
var ReactTestUtils;
var connectToStores;
var provideContext;
var FluxibleComponent;
var FooStore = require('../../fixtures/stores/FooStore');
var BarStore = require('../../fixtures/stores/BarStore');
var createMockComponentContext = require('fluxible/utils/createMockComponentContext');
var jsdom = require('jsdom');

describe('fluxible-addons-react', function () {
    describe('FluxibleComponent', function () {
        var context;

        beforeEach(function (done) {
            jsdom.env('<html><body></body></html>', [], function (err, window) {
                if (err) {
                    done(err);
                    return;
                }
                global.window = window;
                global.document = window.document;
                global.navigator = window.navigator;

                context = createMockComponentContext({
                    stores: [FooStore, BarStore]
                });

                React = require('react');
                ReactDOM = require('react-dom');
                ReactTestUtils = require('react-addons-test-utils');
                connectToStores = require('../../../').connectToStores;
                provideContext = require('../../../').provideContext;
                FluxibleComponent = require('../../../').FluxibleComponent;

                done();
            });
        });

        afterEach(function () {
            delete global.window;
            delete global.document;
            delete global.navigator;
        });

        it('will not double render', function () {
            const Component = React.createClass({
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
            const Component = React.createClass({
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
