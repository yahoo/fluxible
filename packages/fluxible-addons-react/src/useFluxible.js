import { useContext } from 'react';
import FluxibleComponentContext from './FluxibleComponentContext';

/**
 * React hook that returns Fluxible component context.
 *
 * Example:
 *
 * const MyComponent = () => {
 *     const context = useContext();
 *     const onClick = () => context.executeAction(myAction);
 *     return <button onClick={onClick} />;
 * };
 *
 * @function useFluxible
 * @returns {object} - Fluxible component context
 */
const useFluxible = () => useContext(FluxibleComponentContext);

export default useFluxible;
