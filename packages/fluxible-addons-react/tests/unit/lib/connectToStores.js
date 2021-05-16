/* eslint-disable react/prop-types */
import { expect } from 'chai';
import React from 'react';
import TestRenderer from 'react-test-renderer';
import createMockComponentContext from 'fluxible/utils/createMockComponentContext';

import { connectToStores, FluxibleComponent } from '../../../';
import FooStore from '../../fixtures/stores/FooStore';
import BarStore from '../../fixtures/stores/BarStore';

const DumbComponent = ({ foo, bar, onClick }) => (
    <div>
        <span id="foo">{foo}</span>
        <span id="bar">{bar}</span>
        <button id="button" onClick={onClick} />
    </div>
);
DumbComponent.displayName = 'DumbComponent';
DumbComponent.initAction = () => {};

const stores = [FooStore, BarStore];

const getStateFromStores = ({ getStore, executeAction }) => ({
    foo: getStore(FooStore).getFoo(),
    bar: getStore(BarStore).getBar(),
    onClick: () => executeAction((context) => context.dispatch('DOUBLE_UP')),
});

const ConnectedComponent = connectToStores(
    DumbComponent,
    stores,
    getStateFromStores
);

const renderComponent = (Component, ref) => {
    const context = createMockComponentContext({ stores });

    const app = TestRenderer.create(
        <FluxibleComponent context={context}>
            <Component ref={ref} />
        </FluxibleComponent>
    );

    return { app, context };
};

const getComponent = (app) => app.root.findByType(DumbComponent);

describe('fluxible-addons-react', () => {
    describe('connectToStores', () => {
        it('should hoist and set static properties properly', () => {
            expect(ConnectedComponent.displayName).to.equal(
                'storeConnector(DumbComponent)'
            );
            expect(ConnectedComponent.WrappedComponent).to.equal(DumbComponent);
            expect(ConnectedComponent.initAction).to.be.a('function');
            expect(ConnectedComponent.initAction).to.equal(
                DumbComponent.initAction
            );
        });

        it('should register/unregister from stores on mount/unmount', () => {
            const { app, context } = renderComponent(ConnectedComponent);

            const barStore = context.getStore(BarStore);
            const fooStore = context.getStore(FooStore);

            expect(barStore.listeners('change').length).to.equal(1);
            expect(fooStore.listeners('change').length).to.equal(1);

            app.unmount();

            expect(barStore.listeners('change').length).to.equal(0);
            expect(fooStore.listeners('change').length).to.equal(0);
        });

        it('should forward props from getStateFromStores to component', () => {
            const { app } = renderComponent(ConnectedComponent);
            const component = getComponent(app);

            expect(component.props.foo).to.equal('bar');
            expect(component.props.bar).to.equal('baz');
            expect(component.props.onClick).to.be.a('function');
        });

        it('should listen to store changes', () => {
            const { app } = renderComponent(ConnectedComponent);
            const component = getComponent(app);

            component.props.onClick();

            expect(component.props.foo).to.equal('barbar');
            expect(component.props.bar).to.equal('bazbaz');
        });
    });
});
