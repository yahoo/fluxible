/*globals describe,it*/
'use strict';

var expect = require('chai').expect;
var React = require('react');
var ReactDOM = require('react-dom/server');
var provideContext = require('../../..').provideContext;

describe('fluxible-addons-react', function () {
    describe('provideContext', function () {
        it('should use the childs name', function () {
            var Component = React.createClass({
                render: function () {
                    return null;
                }
            });

            var WrappedComponent = provideContext(Component);
            expect(WrappedComponent.displayName).to.equal('ComponentContextProvider');
        });

        it('should use the childs displayName', function () {
            var Component = React.createClass({
                displayName: 'TestComponent',
                render: function () {
                    return null;
                }
            });

            var WrappedComponent = provideContext(Component);
            expect(WrappedComponent.displayName).to.equal('TestComponentContextProvider');
        });

        it('should provide the context with custom types to children', function () {
            var context = {
                foo: 'bar',
                executeAction: function () {
                },
                getStore: function () {
                }
            };
            var Component = React.createClass({
                contextTypes: {
                    foo: React.PropTypes.string.isRequired,
                    executeAction: React.PropTypes.func.isRequired,
                    getStore: React.PropTypes.func.isRequired
                },
                render: function () {
                    expect(this.context.foo).to.equal(context.foo);
                    expect(this.context.executeAction).to.equal(context.executeAction);
                    expect(this.context.getStore).to.equal(context.getStore);
                    return null;
                }
            });
            var WrappedComponent = provideContext(Component, {
                foo: React.PropTypes.string
            });

            ReactDOM.renderToString(<WrappedComponent context={context}/>);
        });

        it('should hoist non-react statics to higher order component', function () {
            var context = {
                foo: 'bar',
                executeAction: function () {
                },
                getStore: function () {
                }
            };
            var Component = React.createClass({
                displayName: 'Component',
                statics: {
                    initAction: function () {
                    }
                },
                render: function () {
                    expect(this.context.foo).to.equal(context.foo);
                    expect(this.context.executeAction).to.equal(context.executeAction);
                    expect(this.context.getStore).to.equal(context.getStore);
                    return null;
                }
            });
            var WrappedComponent = provideContext(Component, {
                foo: React.PropTypes.string
            });

            expect(WrappedComponent.initAction).to.be.a('function');
            expect(WrappedComponent.displayName).to.not.equal(Component.displayName);
        });

        it('should provide the context with custom types to children using the decorator pattern', function () {
            var context = {
                foo: 'bar',
                executeAction: function () {
                },
                getStore: function () {
                }
            };
            @provideContext({
                foo: React.PropTypes.string
            }) class WrappedComponent extends React.Component {
                static contextTypes = {
                    foo: React.PropTypes.string.isRequired,
                    executeAction: React.PropTypes.func.isRequired,
                    getStore: React.PropTypes.func.isRequired
                };

                render() {
                    expect(this.context.foo).to.equal(context.foo);
                    expect(this.context.executeAction).to.equal(context.executeAction);
                    expect(this.context.getStore).to.equal(context.getStore);
                    return null;
                }
            }

            ReactDOM.renderToString(<WrappedComponent context={context}/>);
        });
    });
});
