/** @jsx React.DOM */
/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

var React = require('react/addons'),
    Nav = require('./Nav.jsx'),
    Home = require('./Home.jsx'),
    About = require('./About.jsx'),
    Timestamp = require('./Timestamp.jsx'),
    RouterMixin = require('flux-router-component').RouterMixin,
    FluxibleMixin = require(__dirname + '/../../../../../').FluxibleMixin,
    ApplicationStore = require('../stores/ApplicationStore');

var Application = React.createClass({
    mixins: [RouterMixin, FluxibleMixin],
    statics: {
        listeners: [ApplicationStore]
    },
    getInitialState: function () {
         return this.getStoreState();
    },
    getStoreState: function () {
        return this.getStore(ApplicationStore).getState();
    },
    onUpdate: function () {
        this.setState(this.getStoreState());
    },
    render: function () {
        return (
            <div>
                <Nav selected={this.state.currentPageName} links={this.state.pages}/>
                {'home' === this.state.currentPageName ? <Home/> : <About/>}
                <Timestamp context={this.props.context}/>
            </div>
        );
    }
});

module.exports = Application;
