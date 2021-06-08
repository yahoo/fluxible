import React from 'react';
import { expect } from 'chai';
import TestRenderer from 'react-test-renderer';
import createMockComponentContext from 'fluxible/utils/createMockComponentContext';
import FooStore from '../../fixtures/stores/FooStore';
import { useFluxible, FluxibleProvider } from '../../../';

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
                </FluxibleProvider>
            );

            const component = testRenderer.root.findByType('p');

            expect(component.props.id).to.deep.equal('bar');
        });
    });
});
