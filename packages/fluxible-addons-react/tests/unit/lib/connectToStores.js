/*globals describe,it,afterEach,beforeEach,document*/
/*eslint react/prop-types:0, react/no-render-return-value:0, react/no-find-dom-node:0 */
'use strict';

var expect = require('chai').expect;
var React;
var PropTypes;
var ReactDOM;
var ReactTestUtils;
var connectToStores;
var provideContext;
var createReactClass;
var FooStore = require('../../fixtures/stores/FooStore');
var BarStore = require('../../fixtures/stores/BarStore');
var createMockComponentContext = require('fluxible/utils/createMockComponentContext');
var JSDOM = require('jsdom').JSDOM;

describe('fluxible-addons-react', function () {
    describe('connectToStores', function () {
        var appContext;

        beforeEach(function () {
            var jsdom = new JSDOM('<html><body></body></html>');
            global.window = jsdom.window;
            global.document = jsdom.window.document;
            global.navigator = jsdom.window.navigator;

            appContext = createMockComponentContext({
                stores: [FooStore, BarStore]
            });

            React = require('react');
            ReactDOM = require('react-dom');
            PropTypes = require('prop-types');
            createReactClass = require('create-react-class');
            ReactTestUtils = require('react-dom/test-utils');
            connectToStores = require('../../../').connectToStores;
            provideContext = require('../../../').provideContext;
        });

        afterEach(function () {
            delete global.window;
            delete global.document;
            delete global.navigator;
        });

        it('should get the state from the stores', function (done) {
            var Component = createReactClass({
                contextTypes: {
                    executeAction: PropTypes.func.isRequired
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
                            <button id="button" onClick={this.onClick}/>
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
                context={appContext}/>, container);
            var domNode = ReactDOM.findDOMNode(component);
            expect(domNode.querySelector('#foo').textContent).to.equal('bar');
            expect(domNode.querySelector('#bar').textContent).to.equal('baz');

            ReactTestUtils.Simulate.click(domNode.querySelector('#button'));

            expect(domNode.querySelector('#foo').textContent).to.equal('barbar');
            expect(domNode.querySelector('#bar').textContent).to.equal('bazbaz');

            expect(appContext.getStore(BarStore).listeners('change').length).to.equal(1);
            expect(appContext.getStore(FooStore).listeners('change').length).to.equal(1);

            ReactDOM.unmountComponentAtNode(container);

            expect(appContext.getStore(BarStore).listeners('change').length).to.equal(0);
            expect(appContext.getStore(FooStore).listeners('change').length).to.equal(0);
            done();
        });

        it('should get the state from the stores using decorator pattern', function (done) {
            @connectToStores([FooStore, BarStore], (context) => {
                return {
                    foo: context.getStore(FooStore).getFoo(),
                    bar: context.getStore(BarStore).getBar()
                };
            }) class Component extends React.Component {
               static contextTypes = {
                   executeAction: PropTypes.func.isRequired
               };
            
               onClick() {
                   this.context.executeAction(function (actionContext) {
                       actionContext.dispatch('DOUBLE_UP');
                   });
               }
            
               render() {
                   return (
                       <div>
                           <span id="foo">{this.props.foo}</span>
                           <span id="bar">{this.props.bar}</span>
                           <button id="button" onClick={this.onClick.bind(this)}/>
                       </div>
                   );
               }
            }
            
            var WrappedComponent = provideContext(Component);
            
            var container = document.createElement('div');
            var component = ReactDOM.render(<WrappedComponent context={appContext}/>, container);
            var domNode = ReactDOM.findDOMNode(component);
            expect(domNode.querySelector('#foo').textContent).to.equal('bar');
            expect(domNode.querySelector('#bar').textContent).to.equal('baz');
            
            ReactTestUtils.Simulate.click(domNode.querySelector('#button'));
            
            expect(domNode.querySelector('#foo').textContent).to.equal('barbar');
            expect(domNode.querySelector('#bar').textContent).to.equal('bazbaz');
            
            expect(appContext.getStore(BarStore).listeners('change').length).to.equal(1);
            expect(appContext.getStore(FooStore).listeners('change').length).to.equal(1);
            
            ReactDOM.unmountComponentAtNode(container);
            
            expect(appContext.getStore(BarStore).listeners('change').length).to.equal(0);
            expect(appContext.getStore(FooStore).listeners('change').length).to.equal(0);
            done();
        });

        it('should take customContextTypes using decorator pattern', function (done) {
            var customContextTypes = {
                foo: PropTypes.func.isRequired
            };
            @connectToStores([], (context) => {
                return {
                    foo: context.foo()
                };
            }, customContextTypes) class Component extends React.Component {
                render() {
                    return (
                        <div>
                            <span id="foo">{this.props.foo}</span>
                        </div>
                    );
                }
            }

            var WrappedComponent = provideContext(Component, customContextTypes);

            var container = document.createElement('div');
            var context = Object.assign({
                foo() {
                    return 'bar';
                }
            }, appContext);
            var component = ReactDOM.render(<WrappedComponent context={context}/>, container);
            var domNode = ReactDOM.findDOMNode(component);
            expect(domNode.querySelector('#foo').textContent).to.equal('bar');
            done();
        });

        it('should add a ref to class components', function () {
            class Component extends React.Component {
                render() {
                    return <noscript/>;
                }
            }
            var WrappedComponent = provideContext(connectToStores(Component, [], () => ({})));

            var container = document.createElement('div');
            var component = ReactDOM.render(<WrappedComponent
                context={appContext}/>, container);
            expect(component.refs.wrappedElement.refs).to.include.keys('wrappedElement');
        });

        it('should not add a ref to pure function components', function () {
            var WrappedComponent = provideContext(connectToStores(() => <noscript/>, [], () => ({})));

            var container = document.createElement('div');
            var component = ReactDOM.render(<WrappedComponent
                context={appContext}/>, container);
            expect(component.refs.wrappedElement.refs).to.not.include.keys('wrappedElement');
        });

        it('should hoist non-react statics to higher order component', function () {
            var Component = createReactClass({
                displayName: 'Component',
                statics: {
                    initAction: function () {
                    }
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
                    };
                },
                BarStore: function (store, props) {
                    return {
                        bar: store.getBar()
                    };
                }
            }));

            expect(WrapperComponent.initAction).to.be.a('function');
            expect(WrapperComponent.displayName).to.not.equal(Component.displayName);
        });
    });
});
