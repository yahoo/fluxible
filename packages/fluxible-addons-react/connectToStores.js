/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var PropTypes = require('prop-types');
var inherits = require('inherits');
var hoistNonReactStatics = require('hoist-non-react-statics');

function createComponent(Component, stores, getStateFromStores, customContextTypes) {
    var componentName = Component.displayName || Component.name;
    var componentContextTypes = Object.assign({
        getStore: PropTypes.func.isRequired
    }, customContextTypes);

    function StoreConnector(props, context) {
        React.Component.apply(this, arguments);
        this.state = this.getStateFromStores();
        this._onStoreChange = null;
        this._isMounted = false;
    }

    inherits(StoreConnector, React.Component);

    StoreConnector.displayName = 'storeConnector(' + componentName + ')';
    StoreConnector.contextTypes = componentContextTypes;

    Object.assign(StoreConnector.prototype, {
        componentDidMount: function componentDidMount() {
            this._isMounted = true;
            this._onStoreChange = this.constructor.prototype._onStoreChange.bind(this);
            stores.forEach(function storesEach(Store) {
                this.context.getStore(Store).on('change', this._onStoreChange);
            }, this);
        },
        componentWillUnmount: function componentWillUnmount() {
            this._isMounted = false;
            stores.forEach(function storesEach(Store) {
                this.context.getStore(Store).removeListener('change', this._onStoreChange);
            }, this);
        },
        componentWillReceiveProps: function componentWillReceiveProps(nextProps){
            this.setState(this.getStateFromStores(nextProps));
        },
        getStateFromStores: function (props) {
            props = props || this.props;
            return getStateFromStores(this.context, props);
        },
        _onStoreChange: function onStoreChange() {
            if (this._isMounted) {
                this.setState(this.getStateFromStores());
            }
        },
        render: function render() {
            var props = Component.prototype && Component.prototype.isReactComponent ? {ref: 'wrappedElement'} : null;
            return React.createElement(Component, Object.assign({}, this.props, this.state, props));
        }
    });

    hoistNonReactStatics(StoreConnector, Component);
    StoreConnector.WrappedComponent = Component;

    return StoreConnector;
}

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
 * Also supports the decorator pattern:
 *   @connectToStores([FooStore],  {
 *       FooStore: function (store, props) {
 *           return {
 *               foo: store.getFoo()
 *           }
 *       }
 *   })
 *   class ConnectedComponent extends React.Component {
 *       render() {
 *           return <div/>;
 *       }
 *   }
 *
 * @method connectToStores
 * @param {React.Component} [Component] component to pass state as props to.
 * @param {array} stores List of stores to listen for changes
 * @param {function} getStateFromStores function that receives all stores and should return
 *      the full state object. Receives `stores` hash and component `props` as arguments
 * @param {Object} [customContextTypes] additional `contextTypes` that could be accessed from your `getStateFromStores`
 *      function
 * @returns {React.Component} or {Function} if using decorator pattern
 */
module.exports = function connectToStores(Component, stores, getStateFromStores, customContextTypes) {

    // support decorator pattern
    if (typeof Component !== 'function') {
        var _stores = Component;
        var _getStateFromStores = stores;
        var _customContextTypes = getStateFromStores;
        return function connectToStoresDecorator(ComponentToDecorate) {
            return createComponent(ComponentToDecorate, _stores, _getStateFromStores, _customContextTypes);
        };
    }

    return createComponent.apply(null, arguments);
};
