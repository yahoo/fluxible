/* globals describe, it, beforeEach, afterEach, document */
/* eslint react/no-render-return-value:0 */
import { expect } from 'chai';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { JSDOM } from 'jsdom';

import { provideContext, useFluxible } from '../../../';

describe('fluxible-addons-react', () => {
    describe('provideContext', () => {
        beforeEach(() => {
            const jsdom = new JSDOM('<html><body></body></html>');
            global.window = jsdom.window;
            global.document = jsdom.window.document;
            global.navigator = jsdom.window.navigator;
        });

        afterEach(() => {
            delete global.window;
            delete global.document;
            delete global.navigator;
        });

        it('should use the childs name', () => {
            class Component extends React.Component {
                render() {
                    return null;
                }
            }

            const WrappedComponent = provideContext(Component);
            expect(WrappedComponent.displayName).to.equal(
                'contextProvider(Component)'
            );
        });

        it('should use the childs displayName', () => {
            class Component extends React.Component {
                render() {
                    return null;
                }
            }
            Component.displayName = 'TestComponent';

            const WrappedComponent = provideContext(Component);
            expect(WrappedComponent.displayName).to.equal(
                'contextProvider(TestComponent)'
            );
        });

        it('should provide the context with plugins to children', () => {
            const context = {
                foo: 'bar',
                executeAction: function () {},
                getStore: function () {},
            };

            const Component = () => {
                const componentContext = useFluxible();
                expect(componentContext).to.deep.equal(context);
                return null;
            };

            const WrappedComponent = provideContext(Component);

            renderToString(<WrappedComponent context={context} />);
        });

        it('should hoist non-react statics to higher order component', () => {
            class Component extends React.Component {
                static initAction() {}

                render() {
                    return null;
                }
            }
            Component.displayName = 'Component';

            const WrappedComponent = provideContext(Component);

            expect(WrappedComponent.initAction).to.be.a('function');
            expect(WrappedComponent.displayName).to.not.equal(
                Component.displayName
            );
        });
    });
});
