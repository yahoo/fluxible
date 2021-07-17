/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import { Component as ReactComponent, createElement, forwardRef } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import FluxibleComponentContext from './FluxibleComponentContext';

/**
 * @callback getStateFromStores
 * @param {FluxibleContext} context - Fluxible component context.
 * @param {Object} ownProps - The props that the component received.
 * @returns {Object} props - The props that should be passed to the component.
 */

/**
 * HOC that registers change listeners and retrieves state from stores
 * using the `getStateFromStores` method.
 *
 * Example:
 *   connectToStores(Component, [FooStore], (context, props) => ({
 *       foo: context.getStore(FooStore).getFoo(),
 *       onClick: () => context.executeAction(fooAction, props)
 *   })
 *
 * @function connectToStores
 * @param {React.Component} Component - The component to pass state as props to.
 * @param {array} stores - List of stores to listen for changes.
 * @param {getStateFromStores} getStateFromStores - The main function that must map the context into props.
 * @param {Object} [options] - options to tweak the HOC.
 * @param {boolean} options.forwardRef - If true, forwards a ref to the wrapped component.
 * @returns {React.Component} ConnectedComponent - A component connected to the stores.
 */
function connectToStores(Component, stores, getStateFromStores, options) {
    class StoreConnector extends ReactComponent {
        constructor(props, context) {
            super(props, context);
            this._isMounted = false;
            this._onStoreChange = this._onStoreChange.bind(this);
            this.getStateFromStores = this.getStateFromStores.bind(this);
            this.state = this.getStateFromStores();
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
            stores.forEach((Store) =>
                this.context.getStore(Store).on('change', this._onStoreChange)
            );
        }

        componentWillUnmount() {
            this._isMounted = false;
            stores.forEach((Store) =>
                this.context
                    .getStore(Store)
                    .removeListener('change', this._onStoreChange)
            );
        }

        UNSAFE_componentWillReceiveProps(nextProps) {
            this.setState(this.getStateFromStores(nextProps));
        }

        render() {
            return createElement(Component, {
                ref: this.props.fluxibleRef,
                ...this.props,
                ...this.state,
            });
        }
    }

    StoreConnector.contextType = FluxibleComponentContext;

    const forwarded = forwardRef((props, ref) =>
        createElement(StoreConnector, {
            ...props,
            fluxibleRef: options?.forwardRef ? ref : null,
        })
    );
    forwarded.displayName = `storeConnector(${
        Component.displayName || Component.name || 'Component'
    })`;
    forwarded.WrappedComponent = Component;

    return hoistNonReactStatics(forwarded, Component);
}

export default connectToStores;
