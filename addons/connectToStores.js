/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var objectAssign = require('object-assign');
var contextTypes = require('../lib/contextTypes');
var hoistNonReactStatics = require('hoist-non-react-statics');

function createComponent(Component, stores, getStateFromStores, customContextTypes) {
    var componentName = Component.displayName || Component.name;
    var componentContextTypes = objectAssign({
        getStore: contextTypes.getStore
    }, customContextTypes);
    var StoreConnector = React.createClass({
        displayName: componentName + 'StoreConnector',
        contextTypes: componentContextTypes,
        getInitialState: function getInitialState() {
            return this.getStateFromStores();
        },
        componentDidMount: function componentDidMount() {
            stores.forEach(function storesEach(Store) {
                this.context.getStore(Store).addChangeListener(this._onStoreChange);
            }, this);
        },
        componentWillUnmount: function componentWillUnmount() {
            stores.forEach(function storesEach(Store) {
                this.context.getStore(Store).removeChangeListener(this._onStoreChange);
            }, this);
        },
        getStateFromStores: function () {
            return getStateFromStores(this.context, this.props);
        },
        _onStoreChange: function onStoreChange() {
            if (this.isMounted()) {
                this.setState(this.getStateFromStores());
            }
        },
        render: function render() {
            return React.createElement(Component, objectAssign({}, this.props, this.state));
        }
    });

    hoistNonReactStatics(StoreConnector, Component);

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
 * @returns {React.Component} or {Function} if using decorator pattern
 */
module.exports = function connectToStores(Component, stores, getStateFromStores) {
    // support decorator pattern
    if (arguments.length === 2) {
        stores = arguments[0];
        getStateFromStores = arguments[1];
        return function connectToStoresDecorator(ComponentToDecorate) {
            return createComponent(ComponentToDecorate, stores, getStateFromStores);
        };
    }

    return createComponent.apply(null, arguments);
};
