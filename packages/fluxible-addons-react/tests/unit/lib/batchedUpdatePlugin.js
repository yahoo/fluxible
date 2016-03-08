/*globals describe,it,afterEach,beforeEach,document*/
'use strict';

var expect = require('chai').expect;
var React;
var ReactDOM;
var ReactTestUtils;
var connectToStores;
var provideContext;
var FooStore = require('../../fixtures/stores/FooStore');
var BarStore = require('../../fixtures/stores/BarStore');
var Fluxible = require('fluxible');
var jsdom = require('jsdom');

describe('fluxible-addons-react', function () {
    describe('connectToStores', function () {
        var appContext;

        beforeEach(function (done) {
            jsdom.env('<html><body></body></html>', [], function (err, window) {
                if (err) {
                    done(err);
                    return;
                }
                global.window = window;
                global.document = window.document;
                global.navigator = window.navigator;

                React = require('react');
                ReactDOM = require('react-dom');
                ReactTestUtils = require('react-addons-test-utils');
                connectToStores = require('../../../').connectToStores;
                provideContext = require('../../../').provideContext;

                var batchedUpdatePlugin = require('../../../batchedUpdatePlugin');
                var app = new Fluxible({
                    stores: [FooStore, BarStore]
                });
                app.plug(batchedUpdatePlugin());

                appContext = app.createContext();

                done();
            });
        });

        afterEach(function () {
            delete global.window;
            delete global.document;
            delete global.navigator;
        });

        it('should only call render once when two stores emit changes', function (done) {
            var i = 0;
            var Component = React.createClass({
                componentDidUpdate: function () {
                    i++;
                },
                render: function () {
                    return (
                        <div>
                            <span id="foo">{this.props.foo}</span>
                            <span id="bar">{this.props.bar}</span>
                        </div>
                    );
                }
            });
            var WrappedComponent = provideContext(connectToStores(Component, [FooStore, BarStore], (context) => ({
                foo: context.getStore(FooStore).getFoo(),
                bar: context.getStore(BarStore).getBar()
            })));

            var container = document.createElement('div');
            var component = ReactDOM.render(<WrappedComponent
                context={appContext.getComponentContext()}/>, container);
            var wrappedElement = component.refs.wrappedElement.refs.wrappedElement;

            ReactDOM.unstable_batchedUpdates(function () {
                wrappedElement.setState({
                    foo: 'far',
                    bar: 'baz'
                });
                wrappedElement.setState({
                    foo: 'far',
                    bar: 'baz'
                });
            });

            expect(i).to.equal(1);
            i = 0;

            appContext.executeAction(function (actionContext) {
                actionContext.dispatch('DOUBLE_UP');
            });
            (function checkForFinalState() {
                var props = wrappedElement.props;
                if (props && props.foo === 'barbar' && props.bar === 'bazbaz') {
                    if (i > 1) {
                        done(new Error('Update called ' + i + ' times during dispatch'));
                        return;
                    }
                    done();
                } else {
                    setTimeout(checkForFinalState, 5);
                }
            })();
        });
    });
});
