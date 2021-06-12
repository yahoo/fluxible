module.exports = function (actionContext, payload, done) {
    actionContext.dispatch('CHANGE_ROUTE', payload);
    done();
};