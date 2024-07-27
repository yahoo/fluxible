import useFluxible from './useFluxible'

/**
 * React hook that returns an executeAction handler
 * TODO: this is a draft for an ongoing discussion in #733
 *
 * Example:
 *
 * const FooComponent = () => {
 *     const executeAction = useExecuteAction();
 *     return <p id={foo} onClick={() => excuteAction(...)} />;
 * };
 *
 * @function useExecuteAction
 * @returns {Function} - executeAction handler
 */
const useExecuteAction = () => {
    const { executeAction } = useFluxible();
    return executeAction;
}

export default useExecuteAction;
