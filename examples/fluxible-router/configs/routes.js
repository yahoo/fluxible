import Home from '../components/Home';
import About from '../components/About';
import Page from '../components/Page';

export default {
    home: {
        path: '/',
        method: 'get',
        handler: Home,
        label: 'Home',
        action: (context, payload, done) => {
            context.dispatch('UPDATE_PAGE_TITLE', {
                pageTitle: 'Home | flux-examples | routing',
            });
            done();
        },
    },
    about: {
        path: '/about',
        method: 'get',
        handler: About,
        label: 'About',
        action: (context, payload, done) => {
            context.dispatch('UPDATE_PAGE_TITLE', {
                pageTitle: 'About | flux-examples | routing',
            });
            done();
        },
    },
    internal: {
        path: '/internalPage',
        method: 'get',
        handler: Page,
        label: 'Internal',
        action: (context, payload, done) => {
            context.dispatch('LOAD_PAGE', { id: 'Internal Page' });
            context.dispatch('UPDATE_PAGE_TITLE', {
                pageTitle: 'Internal Page | flux-examples | routing',
            });
            done();
        },
    },
    dynamicpage: {
        path: '/page/:id',
        method: 'get',
        handler: Page,
        action: (context, payload, done) => {
            var pageId = payload.params.id;
            context.dispatch('LOAD_PAGE', { id: pageId });
            context.dispatch('UPDATE_PAGE_TITLE', {
                pageTitle: pageId + ' [Dynamic Page] | flux-examples | routing',
            });
            done();
        },
    },
};
