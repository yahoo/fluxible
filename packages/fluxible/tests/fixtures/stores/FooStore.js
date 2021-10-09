var createStore = require('../../../addons/createStore');

module.exports = createStore({
    storeName: 'FooStore',
    handlers: {
        DOUBLE_UP: function () {
            this.foo += this.foo;
            this.emitChange();
        },
    },
    initialize: function () {
        this.foo = 'bar';
    },
    getFoo: function () {
        return this.foo;
    },
});
