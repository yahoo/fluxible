import createStore from 'fluxible/addons/createStore';

export default createStore({
    storeName: 'FooStore',
    handlers: {
        DOUBLE_UP: function() {
            this.foo += this.foo;
            this.emitChange();
        }
    },
    initialize() {
        this.foo = 'bar';
    },
    getFoo() {
        return this.foo;
    }
});
