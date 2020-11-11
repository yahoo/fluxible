/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import { Component as ReactComponent, createRef, createElement } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { FluxibleContext } from './FluxibleContext';

/**
 * Registers change listeners and retrieves state from stores using the `getStateFromStores`
 * method. Concept provided by Dan Abramov via
 * https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750
 *
 * Example:
 *   connectToStores(Component, [FooStore], {
 *       FooStore: function (store, props) {
 *           return {
 *               foo: store.getFoo()
 *           }
 *       }
 *   })
 *
 * @method connectToStores
 * @param {React.Component} [Component] component to pass state as props to.
 * @param {array} stores List of stores to listen for changes
 * @param {function} getStateFromStores function that receives all stores and should return
 *      the full state object. Receives `stores` hash and component `props` as arguments
 * @returns {React.Component} or {Function} if using decorator pattern
 */
function connectToStores(Component, stores, getStateFromStores) {
    class StoreConnector extends ReactComponent {
        constructor(props, context) {
            super(props, context);
            this._isMounted = false;
            this._onStoreChange = this._onStoreChange.bind(this);
            this.getStateFromStores = this.getStateFromStores.bind(this);
            this.state = this.getStateFromStores();
            this.wrappedElementRef = createRef();
        }

        getStateFromStores(props) {
            props = props || this.props;
            return getStateFromStores(this.context, props);
        }

        _onStoreChange() {
            if (this._isMounted) {
                this.setState(this.getStateFromStores());
            }
        }

        componentDidMount() {
            this._isMounted = true;
            stores.forEach(Store => this.context.getStore(Store).on('change', this._onStoreChange));
        }

        componentWillUnmount() {
            this._isMounted = false;
            stores.forEach(Store => this.context.getStore(Store).removeListener('change', this._onStoreChange));
        }

        UNSAFE_componentWillReceiveProps(nextProps) {
            this.setState(this.getStateFromStores(nextProps));
        }

        render() {
            const props = (Component.prototype && Component.prototype.isReactComponent)
                ? {ref: this.wrappedElementRef}
                : null;
            return createElement(Component, {...this.props, ...this.state, ...props});
        }
    }

    StoreConnector.displayName = `storeConnector(${Component.displayName || Component.name || 'Component'})`;

    StoreConnector.contextType = FluxibleContext;

    StoreConnector.WrappedComponent = Component;

    hoistNonReactStatics(StoreConnector, Component);

    return StoreConnector;
}

export default connectToStores;
