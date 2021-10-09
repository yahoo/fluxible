import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'fluxible-router';

class Nav extends React.Component {
    render() {
        const selected = this.props.currentRoute;
        const links = this.props.links;

        const linkHTML = Object.keys(links).map((name) => {
            var className = '';
            var link = links[name];

            if (selected && selected.name === name) {
                className = 'pure-menu-selected';
            }

            return (
                <li className={className} key={link.path}>
                    <NavLink
                        routeName={link.page}
                        activeStyle={{ backgroundColor: '#eee' }}
                    >
                        {link.title}
                    </NavLink>
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
    links: {},
};

Nav.propTypes = {
    currentRoute: PropTypes.object,
    links: PropTypes.object,
};

export default Nav;
