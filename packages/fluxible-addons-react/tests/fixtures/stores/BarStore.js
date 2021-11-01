const createStore = require('fluxible/addons/createStore');

module.exports = createStore({
    storeName: 'BarStore',
    handlers: {
        DOUBLE_UP: function () {
            this.bar += this.bar;
            this.emitChange();
        },
    },
    initialize() {
        this.bar = 'baz';
    },
    getBar() {
        return this.bar;
    },
});
