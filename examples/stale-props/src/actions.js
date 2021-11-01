import generateUUID from 'fluxible/utils/generateUUID';

export function addItem({ dispatch }, { label }) {
    dispatch('addItem', {
        id: generateUUID(),
        label,
    });
}

export function removeItem({ dispatch }, { itemId }) {
    dispatch('removeItem', {
        itemId,
    });
}
