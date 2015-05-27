/*globals describe,it,afterEach,beforeEach*/
'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var React;
var ReactTestUtils;
var connectToStores;
var provideContext;
var FooStore = require('../../fixtures/stores/FooStore');
var BarStore = require('../../fixtures/stores/BarStore');
var createMockComponentContext = require('../../../utils/createMockComponentContext');
var jsdom = require('jsdom');

describe('connectToStores', function () {
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

            done();
        });
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
        mockery.disable();
    });

    it('should get the state from the stores', function (done) {
        var Component = React.createClass({
            contextTypes: {
                executeAction: React.PropTypes.func.isRequired
            },
            onClick: function () {
                this.context.executeAction(function (actionContext) {
                    actionContext.dispatch('DOUBLE_UP');
                });
            },
            render: function () {
                return (
                    <div>
                        <span id="foo">{this.props.foo}</span>
                        <span id="bar">{this.props.bar}</span>
                        <button id="button" onClick={this.onClick} />
                    </div>
                );
            }
        });
        var WrappedComponent = provideContext(connectToStores(Component, [FooStore, BarStore], {
            FooStore: function (store, props) {
                return {
                    foo: store.getFoo()
                }
            },
            BarStore: function (store, props) {
                return {
                    bar: store.getBar()
                }
            }
        }));

        var container = document.createElement('div');
        var component = React.render(React.createElement(WrappedComponent, {
            context: context
        }), container);
        var domNode = component.getDOMNode();
        expect(domNode.querySelector('#foo').textContent).to.equal('bar');
        expect(domNode.querySelector('#bar').textContent).to.equal('baz');

        ReactTestUtils.Simulate.click(domNode.querySelector('#button'));

        expect(domNode.querySelector('#foo').textContent).to.equal('barbar');
        expect(domNode.querySelector('#bar').textContent).to.equal('bazbaz');

        expect(context.getStore(BarStore).listeners('change').length).to.equal(1);
        expect(context.getStore(FooStore).listeners('change').length).to.equal(1);

        React.unmountComponentAtNode(container);

        expect(context.getStore(BarStore).listeners('change').length).to.equal(0);
        expect(context.getStore(FooStore).listeners('change').length).to.equal(0);
        done();
    });

    it('should allow using function that receives store hash', function (done) {
        var Component = React.createClass({
            contextTypes: {
                executeAction: React.PropTypes.func.isRequired
            },
            onClick: function () {
                this.context.executeAction(function (actionContext) {
                    actionContext.dispatch('DOUBLE_UP');
                });
            },
            render: function () {
                return (
                    <div>
                        <span id="foobar">{this.props.foobar}</span>
                        <button id="button" onClick={this.onClick} />
                    </div>
                );
            }
        });
        var WrappedComponent = provideContext(connectToStores(Component, [FooStore, BarStore], function (stores, props) {
            var foo = stores.FooStore.getFoo();
            var bar = stores.BarStore.getBar();
            return {
                foobar: foo + bar
            };
        }));

        var container = document.createElement('div');
        var component = React.render(React.createElement(WrappedComponent, {
            context: context
        }), container);
        var domNode = component.getDOMNode();
        expect(domNode.querySelector('#foobar').textContent).to.equal('barbaz');

        ReactTestUtils.Simulate.click(domNode.querySelector('#button'));

        expect(domNode.querySelector('#foobar').textContent).to.equal('barbarbazbaz');

        expect(context.getStore(BarStore).listeners('change').length).to.equal(1);
        expect(context.getStore(FooStore).listeners('change').length).to.equal(1);

        React.unmountComponentAtNode(container);

        expect(context.getStore(BarStore).listeners('change').length).to.equal(0);
        expect(context.getStore(FooStore).listeners('change').length).to.equal(0);
        done();
    });

    it('should hoist non-react statics to higher order component', function () {
        var Component = React.createClass({
            displayName: 'Component',
            statics: {
                initAction: function () {}
            },
            render: function () {
                return (
                    <p>Hello world.</p>
                );
            }
        });
        var WrapperComponent = provideContext(connectToStores(Component, [FooStore, BarStore], {
            displayName: 'WrapperComponent',
            FooStore: function (store, props) {
                return {
                    foo: store.getFoo()
                }
            },
            BarStore: function (store, props) {
                return {
                    bar: store.getBar()
                }
            }
        }));

        expect(WrapperComponent.initAction).to.be.a('function');
        expect(WrapperComponent.displayName).to.not.equal(Component.displayName);
    });
});
