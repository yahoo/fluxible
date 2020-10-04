/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react');
var PropTypes = require('prop-types');
var provideContext = require('fluxible-addons-react/provideContext');
var handleHistory = require('../../dist/lib/handleHistory');
var createReactClass = require('create-react-class');

var MockAppComponent = createReactClass({
    contextTypes: {
        getStore: PropTypes.func.isRequired
    },
    propTypes: {
        children: PropTypes.object,
        currentRoute: PropTypes.object
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
    return provideContext(handleHistory(MockAppComponent, opts), customContextTypes);
};
