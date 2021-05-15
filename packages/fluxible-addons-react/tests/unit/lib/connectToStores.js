/* globals describe, it, afterEach, beforeEach, document */
/* eslint react/prop-types:0, react/no-render-return-value:0, react/no-find-dom-node:0 */
import { expect } from 'chai';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { JSDOM } from 'jsdom';
import createMockComponentContext from 'fluxible/utils/createMockComponentContext';

import { connectToStores, provideContext, FluxibleContext } from '../../../';
import FooStore from '../../fixtures/stores/FooStore';
import BarStore from '../../fixtures/stores/BarStore';

describe('fluxible-addons-react', () => {
    describe('connectToStores', () => {
        let appContext;

        beforeEach(() => {
            const jsdom = new JSDOM('<html><body></body></html>');
            global.window = jsdom.window;
            global.document = jsdom.window.document;
            global.navigator = jsdom.window.navigator;

            appContext = createMockComponentContext({
                stores: [FooStore, BarStore]
            });
        });

        afterEach(() => {
            delete global.window;
            delete global.document;
            delete global.navigator;
        });

        it('should get the state from the stores', (done) => {
            class Component extends React.Component {
                constructor() {
                    super();
                    this.onClick = this.onClick.bind(this);
                }

                onClick() {
                    this.context.executeAction((actionContext) => actionContext.dispatch('DOUBLE_UP'));
                }

                render() {
                    return (
                        <div>
                            <span id="foo">{this.props.foo}</span>
                            <span id="bar">{this.props.bar}</span>
                            <button id="button" onClick={this.onClick}/>
                        </div>
                    );
                }
            }
            Component.contextType = FluxibleContext

            const WrappedComponent = provideContext(connectToStores(Component, [FooStore, BarStore], (context) => ({
                foo: context.getStore(FooStore).getFoo(),
                bar: context.getStore(BarStore).getBar()
            })));

            const container = document.createElement('div');
            const component = ReactDOM.render(<WrappedComponent context={appContext} />, container);
            const domNode = ReactDOM.findDOMNode(component);
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

        it('should hoist non-react statics to higher order component', () => {
            class Component extends React.Component {
                static initAction() {}

                render() {
                    return <p>Hello world.</p>;
                }
            }
            Component.displayName = 'Component';

            const WrapperComponent = provideContext(connectToStores(Component, [FooStore, BarStore], {
                displayName: 'WrapperComponent',
                FooStore: (store, props) => ({ foo: store.getFoo() }),
                BarStore: (store, props) => ({ bar: store.getBar() }),
            }));

            expect(WrapperComponent.initAction).to.be.a('function');
            expect(WrapperComponent.displayName).to.not.equal(Component.displayName);
        });
    });
});
