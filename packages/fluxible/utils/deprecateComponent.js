/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

/**
 * Deprecates a component by logging a warning message when used
 * @method deprecateComponent
 * @param {React.Component} Component component to wrap
 * @param {string} warningMessage Custom contextTypes to add
 * @returns {React.Component}
 */
module.exports = function deprecateComponent(Component, warningMessage) {
    var DeprecationComponent = React.createClass({
        displayName: 'DeprecationComponent',

        componentWillMount: function () {
            console.warn(warningMessage);
        },

        render: function () {
            return React.createElement(Component, this.props);
        }
    });

    return DeprecationComponent;
};
