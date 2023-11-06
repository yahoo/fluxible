/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

const React = require('react');
const PropTypes = require('prop-types');
const { provideContext } = require('fluxible-addons-react');
const { handleHistory } = require('../../');

class MockAppComponent extends React.Component {
    render() {
        if (!this.props.children) {
            return null;
        }
        return React.cloneElement(this.props.children, {
            currentRoute: this.props.currentRoute,
        });
    }
}

MockAppComponent.propTypes = {
    children: PropTypes.object,
    currentRoute: PropTypes.object,
};

module.exports.default = provideContext(
    handleHistory(MockAppComponent, {
        checkRouteOnPageLoad: false,
        enableScroll: true,
    }),
);

module.exports.createWrappedMockAppComponent =
    function createWrappedMockAppComponent(opts) {
        return provideContext(handleHistory(MockAppComponent, opts));
    };
