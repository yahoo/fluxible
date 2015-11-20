/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import Menu from './Menu.jsx';
import Doc from './Doc.jsx';
import SearchResults from './SearchResults.jsx';
import cx from 'classnames';
import { handleRoute } from 'fluxible-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import SearchStore from '../stores/SearchStore';

@handleRoute
@connectToStores([ SearchStore ], (context) => ({
    search: context.getStore(SearchStore).getState()
}))
class Docs extends React.Component {

    static propTypes = {
        currentDoc: React.PropTypes.object.isRequired,
        currentRoute: React.PropTypes.object.isRequired
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            isMenuVisible: false
        };
    }

    handleMenuToggle() {
        this.setState({
            isMenuVisible: !this.state.isMenuVisible
        });
    }

    hideMenu() {
        this.setState({
            isMenuVisible: false
        });
    }

    render() {
        let wrapperClasses = cx({
            'menu-on': this.state.isMenuVisible,
            'docs-page innerwrapper D(tb)--sm Tbl(f) Pt(20px) Mb(50px) Mx(a)--sm W(90%)--sm': true
        });
        let page;
        const currentRoute = this.props.currentRoute;

        if ('search' === currentRoute.name) {
            page = (<SearchResults results={this.props.search.results} currentRoute={currentRoute} />);
        } else {
            page = (<Doc currentDoc={this.props.currentDoc} currentRoute={currentRoute} />);
        }

        return (
            <div id="docs" className={wrapperClasses}>
                <button
                    onClick={this.handleMenuToggle.bind(this)}
                    id="toggleMenuButton"
                    className="menu-button D(n)--sm Pos(a) resetButton End(0) Z(7) Mend(10px)"
                    style={{ top: '-12px' }}
                >
                    <i className="fa fa-bars"></i>
                    <b className="hidden">Toggle the menu</b>
                </button>
                <Menu selected={this.props.currentRoute && this.props.currentRoute.name} onClickEvent={this.hideMenu.bind(this)} />
                {page}
                <div id="overlay" className="D(n) Z(3) Pos(f) T(0) Start(0) W(100%) H(100%)"></div>
            </div>
        );
    }
}

export default Docs;
