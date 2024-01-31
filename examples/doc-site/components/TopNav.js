/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { NavLink } from 'fluxible-router';
import Search from './Search';

class TopNav extends React.Component {
    static propTypes = {
        currentRoute: PropTypes.object,
        selected: PropTypes.string,
    };

    constructor() {
        super();
    }

    render() {
        const selected = this.props.selected;

        return (
            <ul id="navigation" role="navigation" className="Va(m) reset">
                <li className="D(ib) Va(m) Pos(r) Fw(400) C(#fff) Td(n):h navLink">
                    <Search currentRoute={this.props.currentRoute} />
                </li>
                <li
                    className={cx({
                        selected: selected !== 'home',
                        'D(ib) Va(m) Mstart(20px) Pos(r) Fw(400) navLink': true,
                    })}
                >
                    <NavLink
                        routeName="quickStart"
                        className="D(b) C(#fff) Td(n):h"
                    >
                        Docs
                    </NavLink>
                </li>
                <li className="D(ib) Va(m) Mstart(20px) Pos(r) Fw(400)">
                    <a
                        href="https://github.com/yahoo/fluxible"
                        className="D(b) C(#fff) Td(n):h navLink"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <i className="Va(m) Pos(r) fa fa-github"></i> GitHub
                    </a>
                </li>
            </ul>
        );
    }
}

export default TopNav;
