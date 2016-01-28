/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import React from 'react';
import {Link} from 'react-router';

class Nav extends React.Component {
    static contextTypes = {
        history: React.PropTypes.object.isRequired,
        location: React.PropTypes.object.isRequired
    };
    render() {
        return (
            <ul className="pure-menu pure-menu-open pure-menu-horizontal">
                <li className={this.context.location.pathname === '/' ? 'pure-menu-selected' : ''}><Link to='/'>Home</Link></li>
                <li className={this.context.history.isActive('/about') ? 'pure-menu-selected' : ''}><Link to='/about'>About</Link></li>
            </ul>
        );
    }
}

export default Nav;
