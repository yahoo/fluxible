/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import cx from 'classnames';
import NavLink from './NavLink.jsx';
import { I13nAnchor, createI13nNode } from 'react-i13n';
import Search from './Search.jsx';

class TopNav extends React.Component {

    static propTypes = {
        currentRoute: React.PropTypes.object,
        selected: React.PropTypes.string
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
                <li className={cx({'selected': selected !== 'home', 'D(ib) Va(m) Mstart(20px) Pos(r) Fw(400) navLink': true})}>
                    <NavLink routeName="quickStart" className="D(b) C(#fff) Td(n):h">
                        Docs
                    </NavLink>
                </li>
                <li className="D(ib) Va(m) Mstart(20px) Pos(r) Fw(400)">
                    <I13nAnchor href="https://github.com/yahoo/fluxible" className="D(b) C(#fff) Td(n):h navLink" target="_blank">
                        <i className="Va(m) Pos(r) fa fa-github"></i> GitHub
                    </I13nAnchor>
                </li>
            </ul>
        );
    }
}

export default createI13nNode(TopNav, {
    i13nModel: {category: 'top-nav'}
});
