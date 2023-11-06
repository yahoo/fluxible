/* globals describe, it, afterEach, beforeEach, document */
/* eslint react/prop-types:0 react/no-render-return-value:0 */
const TestRenderer = require('react-test-renderer');
const React = require('react');
const ReactDOM = require('react-dom');
const Fluxible = require('fluxible');
const {
    batchedUpdatePlugin,
    connectToStores,
    provideContext,
} = require('../../../');
const FooStore = require('../../fixtures/stores/FooStore');
const BarStore = require('../../fixtures/stores/BarStore');

class DumbComponent extends React.Component {
    componentDidUpdate() {
        this.props.spy();
    }
    render() {
        return null;
    }
}

const createContext = (plugins = []) => {
    const app = new Fluxible({ stores: [FooStore, BarStore] });

    plugins.forEach((plugin) => app.plug(plugin));

    return app.createContext();
};

const createComponent = (context) => {
    const WrappedComponent = provideContext(
        connectToStores(DumbComponent, [FooStore, BarStore], (context) => ({
            foo: context.getStore(FooStore).getFoo(),
            bar: context.getStore(BarStore).getBar(),
        })),
    );

    const props = {
        spy: jest.fn(),
        context: context.getComponentContext(),
    };

    const renderer = TestRenderer.create(<WrappedComponent {...props} />);

    const component = renderer.root.findByType(DumbComponent).instance;

    return { component, spy: props.spy };
};

describe('fluxible-addons-react', () => {
    describe('batchedUpdatePlugin', () => {
        let spy;

        beforeEach(() => {
            jest.useFakeTimers();

            spy = jest
                .spyOn(ReactDOM, 'unstable_batchedUpdates')
                .mockImplementation(TestRenderer.unstable_batchedUpdates);
        });

        afterEach(() => {
            jest.clearAllTimers();
            spy.mockRestore();
        });

        it('can mock unstable_batchedUpdates', () => {
            const context = createContext();
            const { component, spy } = createComponent(context);

            component.setState({ foo: 'far', bar: 'baz' });
            component.setState({ foo: 'far', bar: 'baz' });

            expect(spy).toHaveBeenCalledTimes(2);

            spy.mockReset();

            ReactDOM.unstable_batchedUpdates(() => {
                component.setState({ foo: 'far', bar: 'baz' });
                component.setState({ foo: 'far', bar: 'baz' });
            });

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('updates component only once when two stores emit changes', () => {
            const plugins = [batchedUpdatePlugin()];
            const context = createContext(plugins);
            const { component, spy } = createComponent(context);

            context.executeAction((context) => context.dispatch('DOUBLE_UP'));

            jest.runAllTimers();

            expect(component.props.bar).toBe('bazbaz');
            expect(component.props.foo).toBe('barbar');
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('updates component twice if plugin is not used', () => {
            const context = createContext();
            const { component, spy } = createComponent(context);

            context.executeAction((context) => context.dispatch('DOUBLE_UP'));

            jest.runAllTimers();

            expect(component.props.bar).toBe('bazbaz');
            expect(component.props.foo).toBe('barbar');
            expect(spy).toHaveBeenCalledTimes(2);
        });
    });
});
