/* eslint-disable react/prop-types */
const React = require('react');
const {
    forwardRef,
    useImperativeHandle,
    Component,
    createRef,
} = require('react');
const TestRenderer = require('react-test-renderer');
const createMockComponentContext = require('fluxible/utils/createMockComponentContext');
const { connectToStores, FluxibleProvider } = require('../../../');
const FooStore = require('../../fixtures/stores/FooStore');
const BarStore = require('../../fixtures/stores/BarStore');

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
    getStateFromStores,
);

const renderComponent = (Component, ref) => {
    const context = createMockComponentContext({ stores });

    const app = TestRenderer.create(
        <FluxibleProvider context={context}>
            <Component ref={ref} />
        </FluxibleProvider>,
    );

    return { app, context };
};

const getComponent = (app, component) => app.root.findByType(component);

const getStoreConnector = (app) =>
    app.root.find((node) => node.type.name === 'StoreConnector');

describe('fluxible-addons-react', () => {
    describe('connectToStores', () => {
        it('should hoist and set static properties properly', () => {
            expect(ConnectedComponent.displayName).toBe(
                'storeConnector(DumbComponent)',
            );
            expect(ConnectedComponent.WrappedComponent).toBe(DumbComponent);
            expect(ConnectedComponent.initAction).toBeInstanceOf(Function);
            expect(ConnectedComponent.initAction).toBe(
                DumbComponent.initAction,
            );
        });

        it('should register/unregister from stores on mount/unmount', () => {
            const { app, context } = renderComponent(ConnectedComponent);

            const barStore = context.getStore(BarStore);
            const fooStore = context.getStore(FooStore);

            expect(barStore.listeners('change').length).toBe(1);
            expect(fooStore.listeners('change').length).toBe(1);

            app.unmount();

            expect(barStore.listeners('change').length).toBe(0);
            expect(fooStore.listeners('change').length).toBe(0);
        });

        it('should forward props from getStateFromStores to component', () => {
            const { app } = renderComponent(ConnectedComponent);
            const component = getComponent(app, DumbComponent);

            expect(component.props.foo).toBe('bar');
            expect(component.props.bar).toBe('baz');
            expect(component.props.onClick).toBeInstanceOf(Function);
        });

        it('should listen to store changes', () => {
            const { app } = renderComponent(ConnectedComponent);
            const component = getComponent(app, DumbComponent);

            component.props.onClick();

            expect(component.props.foo).toBe('barbar');
            expect(component.props.bar).toBe('bazbaz');
        });

        describe('ref support', () => {
            class ClassComponent extends Component {
                constructor() {
                    super();
                    this.number = 42;
                }
                render() {
                    return null;
                }
            }

            const ConnectedClassComponent = connectToStores(
                ClassComponent,
                stores,
                getStateFromStores,
                { forwardRef: true },
            );

            const ForwardComponent = forwardRef((props, ref) => {
                useImperativeHandle(ref, () => ({ number: 24 }));
                return <div {...props} />;
            });
            ForwardComponent.displayName = 'ForwardComponent';

            const ConnectedForwardComponent = connectToStores(
                ForwardComponent,
                stores,
                getStateFromStores,
                { forwardRef: true },
            );

            const WithoutRefComponent = connectToStores(
                DumbComponent,
                stores,
                getStateFromStores,
                { forwardRef: false },
            );

            it('should not forward ref by default', () => {
                const ref = createRef(null);
                renderComponent(ConnectedComponent, ref);
                expect(ref.current).toBeNull();
            });

            it('should not forward ref if options.forwardRef is false', () => {
                const ref = createRef(null);
                renderComponent(WithoutRefComponent, ref);
                expect(ref.current).toBeNull();
            });

            it('should forward ref if options.forwardRef is true', () => {
                const ref1 = createRef(null);
                renderComponent(ConnectedClassComponent, ref1);
                expect(ref1.current.number).toBe(42);

                const ref2 = createRef(null);
                renderComponent(ConnectedForwardComponent, ref2);
                expect(ref2.current.number).toBe(24);
            });

            it('does not pass fluxibleRef to StoreConnector if ref is disabled', () => {
                const ref = createRef(null);
                const { app } = renderComponent(ConnectedComponent, ref);

                const connector = app.root.find(
                    (node) => node.type.name === 'StoreConnector',
                );
                expect(connector.props.fluxibleRef).toBe(undefined);

                const component = getComponent(app, ConnectedComponent);
                expect(component.props.fluxibleRef).toBe(undefined);
            });

            it('does not leak fluxibleRef to inner component', () => {
                const ref = createRef(null);
                const { app } = renderComponent(ConnectedClassComponent, ref);

                const connector = getStoreConnector(app);
                expect(connector.props.fluxibleRef).not.toBe(undefined);

                const component = getComponent(app, ConnectedClassComponent);
                expect(component.props.fluxibleRef).toBe(undefined);
            });
        });
    });
});
