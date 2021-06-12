/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import React from 'react';
import Nav from './Nav';
import Timestamp from './Timestamp';

class Application extends React.Component {
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
