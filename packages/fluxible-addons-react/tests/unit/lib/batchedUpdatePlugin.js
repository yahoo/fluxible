/* globals describe, it, afterEach, beforeEach, document */
/* eslint react/prop-types:0 react/no-render-return-value:0 */
import { expect } from 'chai';
import sinon from 'sinon';
import TestRenderer from 'react-test-renderer';
import React from 'react';
import ReactDOM from 'react-dom';
import Fluxible from 'fluxible';

import {
    batchedUpdatePlugin,
    connectToStores,
    provideContext,
} from '../../../';
import FooStore from '../../fixtures/stores/FooStore';
import BarStore from '../../fixtures/stores/BarStore';

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
        }))
    );

    const props = {
        spy: sinon.stub(),
        context: context.getComponentContext(),
    };

    const renderer = TestRenderer.create(<WrappedComponent {...props} />);

    const component = renderer.root.findByType(DumbComponent).instance;

    return { component, spy: props.spy };
};

describe('fluxible-addons-react', () => {
    describe('batchedUpdatePlugin', () => {
        let clock;

        beforeEach(() => {
            clock = sinon.useFakeTimers();
            sinon
                .stub(ReactDOM, 'unstable_batchedUpdates')
                .callsFake(TestRenderer.unstable_batchedUpdates);
        });

        afterEach(() => {
            clock.restore();
            ReactDOM.unstable_batchedUpdates.restore();
        });

        it('can mock unstable_batchedUpdates', () => {
            const context = createContext();
            const { component, spy } = createComponent(context);

            component.setState({ foo: 'far', bar: 'baz' });
            component.setState({ foo: 'far', bar: 'baz' });

            expect(spy.callCount).to.equal(2);

            spy.reset();

            ReactDOM.unstable_batchedUpdates(() => {
                component.setState({ foo: 'far', bar: 'baz' });
                component.setState({ foo: 'far', bar: 'baz' });
            });

            expect(spy.callCount).to.equal(1);
        });

        it('updates component only once when two stores emit changes', () => {
            const plugins = [batchedUpdatePlugin()];
            const context = createContext(plugins);
            const { component, spy } = createComponent(context);

            context.executeAction((context) => context.dispatch('DOUBLE_UP'));

            clock.tick(1);

            expect(component.props.bar).to.equal('bazbaz');
            expect(component.props.foo).to.equal('barbar');
            expect(spy.callCount).to.equal(1);
        });

        it('updates component twice if plugin is not used', () => {
            const context = createContext();
            const { component, spy } = createComponent(context);

            context.executeAction((context) => context.dispatch('DOUBLE_UP'));

            clock.tick(1);

            expect(component.props.bar).to.equal('bazbaz');
            expect(component.props.foo).to.equal('barbar');
            expect(spy.callCount).to.equal(2);
        });
    });
});
