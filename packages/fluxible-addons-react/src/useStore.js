import {useEffect, useState} from 'react';
import useFluxible from './useFluxible'

/**
 * React hook that returns a state from Fluxible store.
 * TODO: this is a draft for an ongoing discussion in #733
 *
 * Example:
 *
 * const FooComponent = () => {
 *     const getStateFromStore = store => store.getFoo();
 *     const foo = useStore('FooStore', getStateFromStore);
 *     return <p id={foo} />;
 * };
 *
 * @function useFluxible
 * @returns {object} - a state from Fluxible store
 */
const useStore = (storeName, getStateFromStore) => {
    const { getStore } = useFluxible();
    const store = getStore(storeName);
    const [state, setState] = useState(getStateFromStore(store));

    function updateState() {
        setState(getStateFromStore(store));
    }

    useEffect(() => {
        store.on('change', updateState);
        return () => store.removeListener('change', updateState);
    }, [store, updateState]);

    return state;
}

export default useStore;
