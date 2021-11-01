const createStore = require('fluxible/addons/createStore');

module.exports = createStore({
    storeName: 'FooStore',
    handlers: {
        DOUBLE_UP: function () {
            this.foo += this.foo;
            this.emitChange();
        },
    },
    initialize() {
        this.foo = 'bar';
    },
    getFoo() {
        return this.foo;
    },
});
