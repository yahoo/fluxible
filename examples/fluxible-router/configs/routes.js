export default {
    home: {
        path: '/',
        method: 'get',
        handler: require('../components/Home'),
        label: 'Home',
        action: (context, payload, done) => {
            context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'Home | flux-examples | routing' });
            done();
        }
    },
    about: {
        path: '/about',
        method: 'get',
        handler: require('../components/About'),
        label: 'About',
        action: (context, payload, done) => {
            context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'About | flux-examples | routing' });
            done();
        }
    },
    dynamicpage: {
        path: '/page/:id',
        method: 'get',
        handler: require('../components/Page'),
        action: (context, payload, done) => {
            var pageId = payload.get('params').get('id');
            context.dispatch('LOAD_PAGE', { id: pageId });
            context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: pageId + ' [Dynamic Page] | flux-examples | routing' });
            done();
        }
    }
};
