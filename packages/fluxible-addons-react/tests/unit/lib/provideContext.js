/*globals describe,it,beforeEach,afterEach,document*/
'use strict';

var expect = require('chai').expect;
var React = require('react');
var PropTypes = require('prop-types');
var renderToString = require('react-dom/server').renderToString;
var render = require('react-dom').render;
var createReactClass = require('create-react-class');
var provideContext = require('../../..').provideContext;
var JSDOM = require('jsdom').JSDOM;

describe('fluxible-addons-react', function () {
    describe('provideContext', function () {
        beforeEach(function () {
            var jsdom = new JSDOM('<html><body></body></html>');
            global.window = jsdom.window;
            global.document = jsdom.window.document;
            global.navigator = jsdom.window.navigator;
        });

        afterEach(function () {
            delete global.window;
            delete global.document;
            delete global.navigator;
        });

        it('should use the childs name', function () {
            var Component = createReactClass({
                render: function () {
                    return null;
                }
            });

            var WrappedComponent = provideContext(Component);
            expect(WrappedComponent.displayName).to.equal('contextProvider(Component)');
        });

        it('should use the childs displayName', function () {
            var Component = createReactClass({
                displayName: 'TestComponent',
                render: function () {
                    return null;
                }
            });

            var WrappedComponent = provideContext(Component);
            expect(WrappedComponent.displayName).to.equal('contextProvider(TestComponent)');
        });

        it('should provide the context with custom types to children', function () {
            var context = {
                foo: 'bar',
                executeAction: function () {
                },
                getStore: function () {
                }
            };
            var Component = createReactClass({
                contextTypes: {
                    foo: PropTypes.string.isRequired,
                    executeAction: PropTypes.func.isRequired,
                    getStore: PropTypes.func.isRequired
                },
                render: function () {
                    expect(this.context.foo).to.equal(context.foo);
                    expect(this.context.executeAction).to.equal(context.executeAction);
                    expect(this.context.getStore).to.equal(context.getStore);
                    return null;
                }
            });
            var WrappedComponent = provideContext(Component, {
                foo: PropTypes.string
            });

            renderToString(<WrappedComponent context={context}/>);
        });

        it('should hoist non-react statics to higher order component', function () {
            var context = {
                foo: 'bar',
                executeAction: function () {
                },
                getStore: function () {
                }
            };
            var Component = createReactClass({
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
                foo: PropTypes.string
            });

            expect(WrappedComponent.initAction).to.be.a('function');
            expect(WrappedComponent.displayName).to.not.equal(Component.displayName);
        });

        // Decorators do not work with babel 6
        it.skip('should provide the context with custom types to children using the decorator pattern', function () {
            var context = {
                foo: 'bar',
                executeAction: function () {
                },
                getStore: function () {
                }
            };
            @provideContext({
                foo: PropTypes.string
            })
            class WrappedComponent extends React.Component {
                static contextTypes = {
                    foo: PropTypes.string.isRequired,
                    executeAction: PropTypes.func.isRequired,
                    getStore: PropTypes.func.isRequired
                };

                render() {
                    expect(this.context.foo).to.equal(context.foo);
                    expect(this.context.executeAction).to.equal(context.executeAction);
                    expect(this.context.getStore).to.equal(context.getStore);
                    return null;
                }
            }

            renderToString(<WrappedComponent context={context}/>);
        });

        it('should add a ref to class components', function () {
            var context = {
                executeAction: function () {
                },
                getStore: function () {
                }
            };
            class Component extends React.Component {
                render() {
                    return <noscript/>;
                }
            }
            var WrappedComponent = provideContext(Component, [], () => ({}));

            var container = document.createElement('div');
            var component = render(<WrappedComponent context={context}/>, container);
            expect(component.refs).to.include.keys('wrappedElement');
        });

        it('should not add a ref to pure function components', function () {
            var context = {
                executeAction: function () {
                },
                getStore: function () {
                }
            };
            var WrappedComponent = provideContext(() => <noscript/>, [], () => ({}));

            var container = document.createElement('div');
            var component = render(<WrappedComponent context={context}/>, container);
            expect(component.refs).to.not.include.keys('wrappedElement');
        });
    });
});
