/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import debugLib from 'debug';
const debug = debugLib('showSearch');

function showSearch(context, route, done) {
    debug('show search page');
    context.dispatch('DO_SEARCH', route.query.q);
    done();
}

showSearch.displayName = 'showSearch';
export default showSearch;
