import { connectToStores } from 'fluxible-addons-react';
import ListStore from './ListStore';
import Item from './Item';

let List = ({ items }) => {
    return (
        <ul>
            {items.map((itemId) => (
                <Item key={itemId} itemId={itemId} />
            ))}
        </ul>
    );
};

export default connectToStores(List, [ListStore], ({ getStore }) => ({
    items: getStore(ListStore).getItems(),
}));
