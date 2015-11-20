/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import cx from 'classnames';
import NavLink from './NavLink.jsx';
import { createI13nNode } from 'react-i13n';
import docsConfig from './../configs/menu';

class Menu extends React.Component {
    render() {
        let self = this;
        let menu = [];

        docsConfig.forEach(function (menuitem) {
            if (menuitem.category) {
                menu.push(<h3 className="Fz(14px) Bdt(1) Pt(20px)" key={menuitem.category}>{menuitem.category}</h3>);
            }

            let submenu = [];

            menuitem.children.forEach(function (link) {
                let classList = cx({
                    'selected': self.props.selected === link.routeName
                });

                let linkNode = (<NavLink className={link.label + ' D(b) Td(n):h Py(5px)'} routeName={link.routeName}>{link.label}</NavLink>);

                // support off site links
                if (link.url) {
                    linkNode = (<NavLink className={link.label + ' D(b) Td(n):h Py(5px)'} href={link.url} follow={true}>{link.label}</NavLink>);
                }

                submenu.push(<li key={link.label} className={classList}>{linkNode}</li>);
            });

            if (submenu.length) {
                menu.push(<ul className="reset" key={menuitem.category + 'sub'}>{submenu}</ul>);
            }
        });

        return (
            <div id="aside" className="D(tbc) Va(t) W(175px)--sm End(0) Pt(20px) Pb(40px) Pstart(10px) Pend(50px)--sm Z(5) End(a)--sm Start(0)" role="aside" onClick={self.handleClick.bind(self)}>
                {menu}
            </div>
        );
    }

    handleClick() {
        this.props.onClickEvent();
    }
}

export default createI13nNode(Menu, {
    i13nModel: {category: 'menu'}
});
