import React from 'react';
import { NavLink } from 'fluxible-router';

class Nav extends React.Component {
    render() {
        const selected = this.props.currentRoute;
        const links = this.props.links;

        const linkHTML = Object.keys(links).map((name) => {
            var className = '';
            var link = links[name];

            if (selected && selected.get('name') === name) {
                className = 'pure-menu-selected';
            }

            return (
                <li className={className} key={link.path}>
                    <NavLink routeName={link.page} activeStyle={{backgroundColor: '#eee'}}>{link.title}</NavLink>
                </li>
            );
        });

        return (
            <ul className="pure-menu pure-menu-open pure-menu-horizontal">
                {linkHTML}
            </ul>
        );
    }
}

Nav.defaultProps = {
    selected: null,
    links: {}
};

export default Nav;
