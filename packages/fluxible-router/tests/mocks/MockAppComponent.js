/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react');
var PropTypes = require('prop-types');
var provideContext = require('fluxible-addons-react/provideContext');
var handleHistory = require('../../lib/handleHistory');
var createReactClass = require('create-react-class');

var MockAppComponent = createReactClass({
    contextTypes: {
        getStore: PropTypes.func.isRequired
    },
    render: function () {
        if (!this.props.children) {
            return null;
        }
        return React.cloneElement(this.props.children, {
            currentRoute: this.props.currentRoute
        });
    }
});

var customContextTypes = {
    logger: PropTypes.object
};
module.exports = provideContext(handleHistory(MockAppComponent, {
    checkRouteOnPageLoad: false,
    enableScroll: true
}), customContextTypes);

module.exports.createWrappedMockAppComponent = function createWrappedMockAppComponent(opts) {
    return provideContext(handleHistory(MockAppComponent, opts));
};

module.exports.createDecoratedMockAppComponent = function createDecoratedMockAppComponent(opts) {
    @provideContext
    @handleHistory(opts)
    class DecoratedMockAppComponent extends React.Component {
        static contextTypes = {
            getStore: PropTypes.func.isRequired
        };
        constructor(props, context) {
            super(props, context);
        }
        render() {
            if (!this.props.children) {
                return null;
            }
            return React.cloneElement(this.props.children, {
                currentRoute: this.props.currentRoute
            });
        }
    }

    return DecoratedMockAppComponent;
};
