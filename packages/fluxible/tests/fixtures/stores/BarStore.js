var createStore = require('../../../addons/createStore');
module.exports = createStore({
    storeName: 'BarStore',
    handlers: {
        DOUBLE_UP: function () {
            this.bar += this.bar;
            this.emitChange();
        },
    },
    initialize: function () {
        this.bar = 'baz';
    },
    getBar: function () {
        return this.bar;
    },
});
