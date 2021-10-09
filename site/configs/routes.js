/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import showHome from '../actions/showHome';
import showDoc from '../actions/showDoc';
import showSearch from '../actions/showSearch';
import demoException from '../actions/demoException';
import Home from '../components/Home';
import Docs from '../components/Docs';
import Status404 from '../components/Status404';
import Status500 from '../components/Status500';

export default {
    home: {
        path: '/',
        method: 'GET',
        handler: Home,
        action: showHome,
        pageTitle:
            'Fluxible | A Pluggable Container for Isomorphic Flux Applications',
        pageDescription:
            'A Pluggable Container for Isomorphic Flux Applications',
    },
    quickStart: {
        path: '/quick-start.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/docs/quick-start.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'Quick Start',
        pageDescription:
            'Get started with Fluxible by using our generator to setup your application.',
    },
    faq: {
        path: '/faq.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/docs/faq.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'FAQ',
        pageDescription: 'Frequently asked questions from the community.',
    },
    search: {
        path: '/search.html',
        method: 'GET',
        handler: Docs,
        action: showSearch,
        pageTitlePrefix: 'Search',
    },
    demo500: {
        path: '/demo-err-500.html',
        method: 'GET',
        handler: Docs,
        action: demoException,
    },

    // API
    actions: {
        path: '/api/actions.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/packages/fluxible/docs/api/Actions.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: Actions',
        pageDescription:
            'Actions (called "action creators" in Flux) in Fluxible are stateless async functions.',
    },
    components: {
        path: '/api/components.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/packages/fluxible/docs/api/Components.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: Components',
        pageDescription:
            'React components able to access the state of the application that is held within stores ' +
            'and also be able to execute actions that the stores can react to.',
    },
    fluxible: {
        path: '/api/fluxible.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/packages/fluxible/docs/api/Fluxible.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: Fluxible',
        pageDescription:
            'Instantiated once for your application, this holds settings and interfaces' +
            ' that are used across all requests.',
    },
    fluxibleContext: {
        path: '/api/fluxible-context.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/packages/fluxible/docs/api/FluxibleContext.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: FluxibleContext',
        pageDescription:
            'Instantiated once per request/session, this container provides isolation of ' +
            'stores, dispatches, and other data so that it is not shared between requests on the server side.',
    },
    plugins: {
        path: '/api/plugins.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/packages/fluxible/docs/api/Plugins.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: Plugins',
        pageDescription:
            'Plugins allow you to extend the interface of each context type.',
    },
    stores: {
        path: '/api/stores.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/packages/fluxible/docs/api/Stores.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: Stores',
        pageDescription:
            "Flux stores are where you keep your application's state and " +
            'handle business logic that reacts to data events. ',
    },

    // Addons
    baseStore: {
        path: '/addons/BaseStore.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/packages/fluxible/docs/api/addons/BaseStore.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: addons/BaseStore',
        pageDescription:
            'A base class that you can extend to reduce boilerplate when creating stores.',
    },
    fluxibleComponent: {
        path: '/addons/FluxibleComponent.html',
        method: 'GET',
        handler: Docs,
        githubPath:
            '/packages/fluxible-addons-react/docs/api/FluxibleComponent.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: addons/FluxibleComponent',
        pageDescription:
            'The FluxibleComponent is a wrapper component that will provide all' +
            " of its children with access to the Fluxible component context via React's" +
            ' childContextTypes and getChildContext.',
    },
    batchedUpdatePlugin: {
        path: '/addons/batchedUpdatePlugin.html',
        method: 'GET',
        handler: Docs,
        githubPath:
            '/packages/fluxible-addons-react/docs/api/batchedUpdatePlugin.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: addons/batchedUpdatePlugin',
        pageDescription: 'Batches React state changes for each dispatch.',
    },
    connectToStores: {
        path: '/addons/connectToStores.html',
        method: 'GET',
        handler: Docs,
        githubPath:
            '/packages/fluxible-addons-react/docs/api/connectToStores.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: addons/connectToStores',
        pageDescription:
            'connectToStores is a higher-order component that provides a convenient way' +
            ' to access state from the stores from within your component',
    },
    createElementWithContext: {
        path: '/addons/createElementWithContext.html',
        method: 'GET',
        handler: Docs,
        githubPath:
            '/packages/fluxible-addons-react/docs/api/createElementWithContext.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: addons/createElementWithContext',
        pageDescription:
            "Convenience method for instantiating the Fluxible app's " +
            'top level React component (if provided in the constructor) with the given ' +
            'props with an additional context key containing a ComponentContext.',
    },
    createStore: {
        path: '/addons/createStore.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/packages/fluxible/docs/api/addons/createStore.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: addons/createStore',
        pageDescription:
            'A helper method similar to React.createClass but for creating stores that' +
            ' extend BaseStore. Also supports mixins.',
    },
    createReducerStore: {
        path: '/addons/createReducerStore.html',
        method: 'GET',
        handler: Docs,
        githubPath:
            '/packages/fluxible-reducer-store/docs/api/createReducerStore.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: addons/createReducerStore',
        pageDescription:
            'A helper method for creating reducer stores for Fluxible.',
    },
    devToolsPlugin: {
        path: '/addons/devToolsPlugin.html',
        method: 'GET',
        handler: Docs,
        githubPath:
            '/packages/fluxible-plugin-devtools/docs/fluxible-plugin-devtools.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: addons/devToolsPlugin',
        pageDescription: 'Provides Dev Tools for debugging your app.',
    },
    provideContext: {
        path: '/addons/provideContext.html',
        method: 'GET',
        handler: Docs,
        githubPath:
            '/packages/fluxible-addons-react/docs/api/provideContext.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: addons/provideContext',
        pageDescription:
            'provideContext wraps the Component with a higher-order component' +
            ' that specifies the child context for you.',
    },
    useFluxible: {
        path: '/addons/useFluxible.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/packages/fluxible-addons-react/docs/api/useFluxible.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: addons/useFluxible',
        pageDescription:
            'useFluxible is a React hook that returns the Fluxible component context.',
    },
    withFluxible: {
        path: '/addons/withFluxible.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/packages/fluxible-addons-react/docs/api/withFluxible.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'API: addons/withFluxible',
        pageDescription:
            'is a higher-order component that injects Fluxible component context into your component through the context props.',
    },

    // Extensions
    dataServices: {
        path: '/extensions/data-services.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/packages/fluxible-plugin-fetchr/README.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'Data Services',
        pageDescription:
            'Services are where you define your CRUD operations for a' +
            ' specific resource. A resource is a unique string that identifies the data.',
    },
    routing: {
        path: '/extensions/routing.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/packages/fluxible-router/README.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'Routing',
        pageDescription: 'Routing in the Flux flow',
    },

    // Blog
    isomorphicFlux: {
        path: '/blog/2014-11-06-bringing-flux-to-the-server.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/docs/blog/2014-11-06-bringing-flux-to-the-server.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'Bringing Flux to the Server',
        pageDescription:
            'An in depth look at how Flux was brought to the server.',
    },

    // Community
    articles: {
        path: '/community/articles.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/docs/community/articles.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'Community Articles',
        pageDescription:
            'Take a look at some of the articles that our community has written.',
    },
    libraries: {
        path: '/community/libraries.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/docs/community/libraries.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'Community Libraries',
        pageDescription:
            'Take a look at some of the libraries that our community has built.',
    },
    presentations: {
        path: '/community/presentations.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/docs/community/presentations.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'Community Presentations',
        pageDescription: 'Presentations we have given to the community.',
    },
    referenceApplications: {
        path: '/community/reference-applications.html',
        method: 'GET',
        handler: Docs,
        githubPath: '/docs/community/reference-applications.md',
        githubRepo: 'yahoo/fluxible',
        action: showDoc,
        pageTitlePrefix: 'Community Reference Applications',
        pageDescription: 'Applications using Fluxible in the wild.',
    },

    // Status pages
    status404: {
        path: '/__http404',
        handler: Status404,
    },
    status500: {
        path: '/__http500',
        handler: Status500,
    },
};
