import {useEffect, useState, useLayoutEffect} from 'react';
import useFluxible from './useFluxible'

/**
 * React hook that returns a state from Fluxible store.
 * TODO: this is a draft for an ongoing discussion in #733
 *
 * Example:
 *
 * const FooComponent = () => {
 *     const foo = useStore('FooStore', store => store.getFoo());
 *     return <p id={foo} />;
 * };
 *
 * @function useStore
 * @returns {object} - a state from Fluxible store
 */
const useStore = (storeName, getStateFromStore) => {
    const { getStore } = useFluxible();
    const store = getStore(storeName);
    const [state, setState] = useState(getStateFromStore(store));

    function updateState() {
        setState(getStateFromStore(store));
    }

    // useLayoutEffect is the closest to componentDidMount
    // (we want to block render until store is subscribed)
    // TODO: NOTE useLayoutEffect is called on server-side during SSR
    useLayoutEffect(() => {
        store.on('change', updateState);
        return () => store.removeListener('change', updateState);
    }, []);

    return state;
}

export default useStore;
