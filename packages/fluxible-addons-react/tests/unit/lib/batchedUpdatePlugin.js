/* globals describe, it, afterEach, beforeEach, document */
/* eslint react/prop-types:0 react/no-render-return-value:0 */
import { expect } from 'chai';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { JSDOM } from 'jsdom';
import Fluxible from 'fluxible';

import { batchedUpdatePlugin, connectToStores, provideContext } from '../../../';
import FooStore from '../../fixtures/stores/FooStore';
import BarStore from '../../fixtures/stores/BarStore';

describe('fluxible-addons-react', () => {
    describe('batchedUpdatePlugin', () => {
        let appContext;

        beforeEach(() => {
            const jsdom = new JSDOM('<html><body></body></html>');
            global.window = jsdom.window;
            global.document = jsdom.window.document;
            global.navigator = jsdom.window.navigator;

            const app = new Fluxible({
                stores: [FooStore, BarStore]
            });
            app.plug(batchedUpdatePlugin());

            appContext = app.createContext();
        });

        afterEach(() => {
            delete global.window;
            delete global.document;
            delete global.navigator;
        });

        it('should only call render once when two stores emit changes', (done) => {
            let i = 0;
            class Component extends React.Component {
                componentDidUpdate() {
                    i++;
                }
                render() {
                    return (
                        <div>
                            <span id="foo">{this.props.foo}</span>
                            <span id="bar">{this.props.bar}</span>
                        </div>
                    );
                }
            }

            const WrappedComponent = provideContext(connectToStores(Component, [FooStore, BarStore], (context) => ({
                foo: context.getStore(FooStore).getFoo(),
                bar: context.getStore(BarStore).getBar()
            })));

            const container = document.createElement('div');
            const context = appContext.getComponentContext();
            const component = ReactDOM.render(<WrappedComponent context={context}/>, container);
            const wrappedElement = component.wrappedElementRef.current.wrappedElementRef.current;

            ReactDOM.unstable_batchedUpdates(() => {
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

            appContext.executeAction((actionContext) => {
                actionContext.dispatch('DOUBLE_UP');
            });

            (function checkForFinalState() {
                const props = wrappedElement.props;
                if (props && props.foo === 'barbar' && props.bar === 'bazbaz') {
                    if (i > 1) {
                        done(new Error(`Update called ${i} times during dispatch`));
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
