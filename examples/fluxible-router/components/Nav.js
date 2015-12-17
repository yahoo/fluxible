/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import React from 'react';
import {NavLink} from 'fluxible-router';

function Nav () {
    return (
        <ul className="pure-menu pure-menu-open pure-menu-horizontal">
            <li><NavLink routeName="home" activeStyle={{backgroundColor: '#ccc'}}>Home</NavLink></li>
            <li><NavLink routeName="about" activeStyle={{backgroundColor: '#ccc'}}>About</NavLink></li>
        </ul>
    );
}

export default Nav;
