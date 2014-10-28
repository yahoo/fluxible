/** @jsx React.DOM */
/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

var React = require('react/addons');

var About = React.createClass({
    getInitialState: function () {
        return {};
    },
    render: function() {
        return (
            <p>This is a description of the site.</p>
        );
    }
});

module.exports = About;
