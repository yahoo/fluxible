/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react');
var PropTypes = require('prop-types');
var { provideContext, FluxibleContext } = require('fluxible-addons-react');
var handleHistory = require('../../dist/lib/handleHistory');
var createReactClass = require('create-react-class');

class MockAppComponent extends React.Component {
    render() {
        if (!this.props.children) {
            return null;
        }
        return React.cloneElement(this.props.children, {
            currentRoute: this.props.currentRoute
        });
    }
}

MockAppComponent.contextType = FluxibleContext;

MockAppComponent.propTypes = {
    children: PropTypes.object,
    currentRoute: PropTypes.object
};

module.exports = provideContext(handleHistory(MockAppComponent, {
    checkRouteOnPageLoad: false,
    enableScroll: true
}));

module.exports.createWrappedMockAppComponent = function createWrappedMockAppComponent(opts) {
    return provideContext(handleHistory(MockAppComponent, opts));
};
