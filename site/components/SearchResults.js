/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'fluxible-router';
import { FluxibleComponentContext } from 'fluxible-addons-react';
import doSearch from '../actions/doSearch';
import SearchStore from '../stores/SearchStore';

class SearchResults extends React.Component {
    static contextType = FluxibleComponentContext;

    static propTypes = {
        currentRoute: PropTypes.object.isRequired,
        results: PropTypes.array,
    };

    componentDidUpdate() {
        // this handles performing a search when deep linking to search page
        const query = this.props.currentRoute.query.q;
        const storeQuery = this.context.getStore(SearchStore).getQuery();
        if (query && query !== storeQuery) {
            this.context.executeAction(doSearch, query);
        }
    }

    showResults() {
        let html = <p>No results found</p>;
        const results = this.props.results.map((result) => {
            return (
                <li key={result.id}>
                    <h3>
                        <NavLink href={result.permalink}>
                            {result.title}
                        </NavLink>
                    </h3>
                    <p className="M(0)">{result.description}</p>
                    <small className="C(#006621)">{result.permalink}</small>
                </li>
            );
        });

        if (results.length) {
            html = <ol className="List(dc)">{results}</ol>;
        }

        return html;
    }

    render() {
        return (
            <div id="main" role="main" className="D(tbc)--sm Px(10px) Pos(r)">
                <h1>Search Results</h1>
                {this.showResults()}
            </div>
        );
    }
}

export default SearchResults;
