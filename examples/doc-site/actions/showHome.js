/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

function showHome(context, route, done) {
    let pageTitle = route.pageTitle || route.pageTitlePrefix + ' | Fluxible';
    context.dispatch('UPDATE_PAGE_TITLE', {
        pageTitle: pageTitle,
    });
    done();
}

showHome.displayName = 'showHome';
export default showHome;
