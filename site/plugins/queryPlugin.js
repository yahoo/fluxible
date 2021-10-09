'use strict';

/**
 * Adds query params information to context
 * @returns {Object} queryPlugin
 * @module queryPlugin
 */
export default function queryPlugin() {
    return {
        name: 'QueryPlugin',
        plugContext: function (contextOptions) {
            var req = contextOptions.req;
            var query = req && req.query;

            return {
                plugActionContext: function (actionContext) {
                    actionContext.query = query;
                },
                plugComponentContext: function (componentContext) {
                    componentContext.query = query;
                },
                plugStoreContext: function (storeContext) {
                    storeContext.query = query;
                },
                dehydrate: function () {
                    return {
                        query: query,
                    };
                },
                rehydrate: function (state) {
                    query = state.query;
                },
            };
        },
    };
}
