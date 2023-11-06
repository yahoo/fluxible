const React = require('react');
const TestRenderer = require('react-test-renderer');
const createMockComponentContext = require('fluxible/utils/createMockComponentContext');
const FooStore = require('../../fixtures/stores/FooStore');
const { useFluxible, FluxibleProvider } = require('../../../');

describe('fluxible-addons-react', () => {
    describe('useFluxible', () => {
        it('returns fluxible context', () => {
            const FooComponent = () => {
                const context = useFluxible();
                const foo = context.getStore(FooStore).getFoo();
                return <p id={foo} />;
            };

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
