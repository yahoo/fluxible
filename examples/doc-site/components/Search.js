/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { navigateAction, RouteStore } from 'fluxible-router';
import {
    connectToStores,
    FluxibleComponentContext,
} from 'fluxible-addons-react';
import loadIndex from '../actions/loadIndex';
import SearchStore from '../stores/SearchStore';
const ENTER_KEY_CODE = 13;

class Search extends React.Component {
    static contextType = FluxibleComponentContext;

    static propTypes = {
        currentRoute: PropTypes.object,
    };

    constructor() {
        super();
        this.state = {
            visible: false,
        };
    }

    componentDidMount() {
        this.context.executeAction(loadIndex);

        // if on search page with query, then set state
        const query = this.props.currentRoute.query.q;
        if (query) {
            this.setState({
                visible: true,
            });
        }
    }

    componentDidUpdate() {
        const el = ReactDOM.findDOMNode(this.refs.q);

        // ensure input is focused
        if (this.state.visible) {
            el.focus();
        }

        // set input to query if present
        const query = this.context.getStore(SearchStore).getQuery();
        if (query) {
            el.value = query;
        }
    }

    _toggleSearchVisibility() {
        this.setState({
            visible: !this.state.visible,
        });
    }

    _getPath() {
        return this.context.getStore(RouteStore).makePath('search');
    }

    _onKeyDown(event) {
        if (event.keyCode === ENTER_KEY_CODE) {
            event.preventDefault();
            event.stopPropagation();

            this.context.executeAction(navigateAction, {
                method: 'GET',
                url: this._getPath() + '?q=' + event.target.value,
            });
        }
    }

    render() {
        let classes = cx({
            'D(ib) Mstart(3px) Ov(h) Va(m) Pos(a) End(20px)': true,
            'W(0)': this.state.visible === false,
            'W(200px)': this.state.visible,
        });
        return (
            <div className="D(ib)">
                <form className={classes}>
                    <label htmlFor="q" className="hidden">
                        Search
                    </label>
                    <input
                        ref="q"
                        type="text"
                        name="q"
                        onKeyDown={this._onKeyDown.bind(this)}
                        className="Px(4px) Py(1px) Bdrs(2px) Bd(2) C(#fff) Fw(b)"
                        role="search"
                        id="q"
                    />
                </form>
                <i
                    className="Va(m) Pos(r) fa fa-search Cur(p)"
                    onClick={this._toggleSearchVisibility.bind(this)}
                ></i>
            </div>
        );
    }
}

Search = connectToStores(Search, [SearchStore], (context) => ({
    search: context.getStore(SearchStore).getState(),
}));

export default Search;
