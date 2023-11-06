/* globals describe, it, afterEach, beforeEach */
/* eslint react/prop-types:0, react/no-render-return-value:0, react/no-find-dom-node:0 */
const React = require('react');
const ReactTestUtils = require('react-dom/test-utils');
const { JSDOM } = require('jsdom');
const createMockComponentContext = require('fluxible/utils/createMockComponentContext');
const { FluxibleComponent } = require('../../../');
const FooStore = require('../../fixtures/stores/FooStore');
const BarStore = require('../../fixtures/stores/BarStore');

describe('fluxible-addons-react', () => {
    describe('FluxibleComponent', () => {
        let context;

        beforeEach(() => {
            const jsdom = new JSDOM('<html><body></body></html>');
            global.window = jsdom.window;
            global.document = jsdom.window.document;
            global.navigator = jsdom.window.navigator;

            context = createMockComponentContext({
                stores: [FooStore, BarStore],
            });
        });

        afterEach(() => {
            delete global.window;
            delete global.document;
            delete global.navigator;
        });

        it('will not double render', () => {
            const spy = jest.fn();
            class Component extends React.Component {
                render() {
                    spy();
                    return (
                        <div className="Component">{this.props.children}</div>
                    );
                }
            }

            ReactTestUtils.renderIntoDocument(
                <FluxibleComponent context={context}>
                    <Component>Some child</Component>
                </FluxibleComponent>,
            );

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should pass context prop to child', (done) => {
            class Component extends React.Component {
                render() {
                    expect(this.props.context).toBe(context);
                    done();
                    return (
                        <div className="Component">{this.props.children}</div>
                    );
                }
            }

            ReactTestUtils.renderIntoDocument(
                <FluxibleComponent context={context}>
                    <Component>Some child</Component>
                </FluxibleComponent>,
            );
        });
    });
});
