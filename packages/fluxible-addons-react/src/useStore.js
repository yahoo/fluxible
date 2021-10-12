import {useEffect, useState, useLayoutEffect} from 'react';
import useFluxible from './useFluxible'

/**
 * React hook that returns a Fluxible store.
 * TODO: this is a draft for an ongoing discussion in #733
 *
 * Example:
 *
 * const FooComponent = () => {
 *     const foo = useStore('FooStore', getStateFromStore).getFoo();
 *     return <p id={foo} />;
 * };
 *
 * @function usetStore
 * @returns {object} - Fluxible store
 */
const useStore = (storeName,) => {
    const { getStore } = useFluxible();
    const store = getStore(storeName);
    const [state, setState] = useState(store);

    function updateState() {
        setState(store);
    }

    // useLayoutEffect is the closest to componentDidMount
    // (we want to block render until store is subscribed)
    // TODO: NOTE useLayoutEffect is called on server-side during SSR
    useLayoutEffect(() => {
        store.on('change', updateState);
        return () => store.removeListener('change', updateState);
    }, [store, updateState]);

    return state;
}

export default useStore;
