import createStore from 'fluxible/addons/createStore';

const ListStore = createStore({
    storeName: 'ListStore',

    initialize() {
        this.items = [
            {
                id: 1,
                label: 'init',
            },
            {
                id: 2,
                label: 'init2',
            },
            {
                id: 3,
                label: 'init3',
            },
        ];
    },

    handlers: {
        addItem: 'addItem',
        removeItem: 'removeItem',
    },

    addItem(item) {
        this.items.push(item);
        this.emitChange();
    },

    removeItem({ itemId }) {
        this.items = this.items.filter(({ id }) => id !== itemId);
        this.emitChange();
    },

    getItems() {
        return this.items.map(({ id }) => id);
    },

    getItem(itemId) {
        return this.items.find(({ id }) => id === itemId);
    },
});

export default ListStore;
