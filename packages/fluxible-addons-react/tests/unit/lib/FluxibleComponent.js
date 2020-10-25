/* globals describe, it, afterEach, beforeEach */
/* eslint react/prop-types:0, react/no-render-return-value:0, react/no-find-dom-node:0 */
import { expect } from 'chai';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { JSDOM } from 'jsdom';
import createMockComponentContext from 'fluxible/utils/createMockComponentContext';
import createReactClass from 'create-react-class';

import { connectToStores, provideContext, FluxibleComponent } from '../../../';
import FooStore from '../../fixtures/stores/FooStore';
import BarStore from '../../fixtures/stores/BarStore';

describe('fluxible-addons-react', () => {
    describe('FluxibleComponent', () => {
        let context;

        beforeEach(() => {
            const jsdom = new JSDOM('<html><body></body></html>');
            global.window = jsdom.window;
            global.document = jsdom.window.document;
            global.navigator = jsdom.window.navigator;

            context = createMockComponentContext({
                stores: [FooStore, BarStore]
            });
        });

        afterEach(() => {
            delete global.window;
            delete global.document;
            delete global.navigator;
        });

        it('will not double render', () => {
            class Component extends React.Component {
                render() {
                    return (
                        <div className="Component">{this.props.children}</div>
                    );
                }
            }

            const element = ReactTestUtils.renderIntoDocument(
                <FluxibleComponent context={context}>
                    <Component>Some child</Component>
                </FluxibleComponent>
            );

            expect(ReactDOM.findDOMNode(element).className).to.equal('Component');
            expect(ReactDOM.findDOMNode(element).textContent).to.equal('Some child');
        });

        it('should pass context prop to child', (done) => {
            class Component extends React.Component {
                render() {
                    expect(this.props.context).to.equal(context);
                    done();
                    return (
                        <div className="Component">{this.props.children}</div>
                    );
                }
            }

            ReactTestUtils.renderIntoDocument(
                <FluxibleComponent context={context}>
                    <Component>Some child</Component>
                </FluxibleComponent>
            );
        });
    });
});
