import React, { useState } from 'react';
import { expect } from 'chai';
import TestRenderer from 'react-test-renderer';
import createMockComponentContext from 'fluxible/utils/createMockComponentContext';
import { useStore, FluxibleProvider, useExecuteAction, FluxibleComponent } from '../../../';
import FooStore from '../../fixtures/stores/FooStore';
import BarStore from '../../fixtures/stores/BarStore';

const DumbComponent = () => {

    const foo = useStore(FooStore, store => store.getFoo());
    const bar = useStore(BarStore, store => store.getBar());
    const executeAction = useExecuteAction();
    const onClick = () => executeAction((context) => context.dispatch('DOUBLE_UP'))

    return (
        <div>
            <span id="foo">{foo}</span>
            <span id="bar">{bar}</span>
            <button id="button" onClick={onClick} />
        </div>
    )
};

DumbComponent.displayName = 'DumbComponent';
DumbComponent.initAction = () => {};

const stores = [FooStore, BarStore];

const renderComponent = (Component) => {
    const context = createMockComponentContext({ stores });

    const app = TestRenderer.create(
        <FluxibleComponent context={context}>
            <Component ref={undefined} />
        </FluxibleComponent>
    );

    return { app, context };
};

describe('fluxible-addons-react', () => {
    describe('useStore', () => {
        it('returns fluxible store', () => {
            const FooComponent = () => {
                const foo = useStore('FooStore', store => store.getFoo())
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
        it('should register/unregister from stores on mount/unmount', () => {
            const { app, context } = renderComponent(DumbComponent);

            const barStore = context.getStore(BarStore);
            const fooStore = context.getStore(FooStore);

            expect(barStore.listeners('change').length).to.equal(1);
            expect(fooStore.listeners('change').length).to.equal(1);

            app.unmount();

            expect(barStore.listeners('change').length).to.equal(0);
            expect(fooStore.listeners('change').length).to.equal(0);
        });
        it('should listen to store changes', () => {
            const { app } = renderComponent(DumbComponent);
            const button = app.root.findByProps({ id: 'button' })
            const foo = app.root.findByProps({ id: 'foo' })
            const bar = app.root.findByProps({ id: 'bar' })

            button.props.onClick();
            console.error(foo)

            expect(foo.props.children).to.equal('barbar');
            expect(bar.props.children).to.equal('bazbaz');
        });
    });
});
