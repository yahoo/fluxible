import { connectToStores } from 'fluxible-addons-react';
import { removeItem } from './actions';
import ListStore from './ListStore';

const Item = ({ item, remove }) => {
    // To avoid the stale props issue, you must always check if the
    // item retrived from the store exists or not.

    // If you remove the following check, as soon as you delete an
    // item from the initial state, this component will throw an
    // exception since item will be undefined. This happens because
    // the initial items subscribe to the store before the List
    // component since React runs the lifecycle methods from bottomto top.
    if (!item) {
        return null;
    }

    return (
        <li>
            {item.label}
            <button onClick={remove}>delete</button>
        </li>
    );
};

export default connectToStores(
    Item,
    [ListStore],
    ({ getStore, executeAction }, { itemId }) => ({
        item: getStore(ListStore).getItem(itemId),
        remove: () => executeAction(removeItem, { itemId }),
    }),
);
