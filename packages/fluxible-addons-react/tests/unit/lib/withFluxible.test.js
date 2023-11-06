/* eslint-disable react/prop-types */
const React = require('react');
const TestRenderer = require('react-test-renderer');
const createMockComponentContext = require('fluxible/utils/createMockComponentContext');
const FooStore = require('../../fixtures/stores/FooStore');
const { withFluxible, FluxibleProvider } = require('../../../');

describe('fluxible-addons-react', () => {
    describe('withFluxible', () => {
        it('forwards fluxible context to wrapped component', () => {
            let FooComponent = ({ context }) => {
                const foo = context.getStore(FooStore).getFoo();
                return <p id={foo} />;
            };

            FooComponent = withFluxible(FooComponent);

            const context = createMockComponentContext({ stores: [FooStore] });

            const testRenderer = TestRenderer.create(
                <FluxibleProvider context={context}>
                    <FooComponent />
                </FluxibleProvider>,
            );

            const component = testRenderer.root.findByType('p');

            expect(component.props.id).toEqual('bar');
        });
    });
});
