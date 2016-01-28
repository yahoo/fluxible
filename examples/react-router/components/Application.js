/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import React from 'react';
import Nav from './Nav';
import Timestamp from './Timestamp';
import ApplicationStore from '../stores/ApplicationStore';
import {connectToStores, provideContext} from 'fluxible-addons-react';
import {RouteHandler, Router} from 'react-router';
import routes from './Routes';
import createBrowserHistory from 'history/lib/createBrowserHistory';

class Application extends React.Component {

    static contextTypes = {
        getStore: React.PropTypes.func,
        executeAction: React.PropTypes.func
    };

    constructor(props, context) {
        super(props, context);
    }
    render() {
        return (
            <div>
                <Nav />
                {this.props.children}
                <Timestamp />
            </div>
        );
    }
}

export default Application;
