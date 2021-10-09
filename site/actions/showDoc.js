/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import DocStore from '../stores/DocStore';

function showDoc(context, route, done) {
    if (!route.githubPath) {
        let err404 = new Error('Document not found');
        err404.statusCode = 404;
        return done(err404);
    }

    let pageTitle = route.pageTitle || route.pageTitlePrefix + ' | Fluxible';

    // Load from cache
    let docFromCache = context.getStore(DocStore).get(route.name);

    // is the content already in the store?
    if (docFromCache) {
        context.dispatch('RECEIVE_DOC_SUCCESS', docFromCache);
        context.dispatch('UPDATE_PAGE_TITLE', {
            pageTitle: pageTitle,
        });
        return done();
    }

    context.dispatch('RECEIVE_DOC_START', route);

    // Load from service
    context.service.read('docs', route, {}, function (err, data) {
        if (err) {
            return done(err);
        }

        if (!data) {
            let err404 = new Error('Document not found');
            err404.statusCode = 404;
            return done(err404);
        }

        context.dispatch('RECEIVE_DOC_SUCCESS', data);
        context.dispatch('UPDATE_PAGE_TITLE', {
            pageTitle: pageTitle,
        });
        done();
    });
}
showDoc.displayName = 'showDoc';
export default showDoc;
