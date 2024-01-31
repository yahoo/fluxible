/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import debugLib from 'debug';
import Fluxible from 'fluxible';
import fetchrPlugin from 'fluxible-plugin-fetchr';
import devToolsPlugin from 'fluxible-plugin-devtools';
import queryPlugin from './plugins/queryPlugin';
import routes from './configs/routes';
import Application from './components/Application';
import DocStore from './stores/DocStore';
import SearchStore from './stores/SearchStore';
import { RouteStore } from 'fluxible-router';

const debug = debugLib('app.js');
const MyRouteStore = RouteStore.withStaticRoutes(routes);

const app = new Fluxible({
    component: Application,
    componentActionHandler: function (context, payload, done) {
        if (payload.err) {
            if (payload.err.statusCode === 404) {
                debug('component 404 error', payload.err);
            } else {
                debug('component exception', payload.err);
            }

            return;
        }

        done();
    },
});

app.plug(queryPlugin());
app.plug(fetchrPlugin({ xhrPath: '/_api' }));
app.plug(devToolsPlugin());

app.registerStore(DocStore);
app.registerStore(MyRouteStore);
app.registerStore(SearchStore);

export default app;
