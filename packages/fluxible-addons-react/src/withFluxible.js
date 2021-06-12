import { createElement } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import useFluxible from './useFluxible';

/**
 * Higher-order component that injects the fluxible context as context
 * prop.
 *
 * const MyComponent = ({ context }) => {
 *     const onClick = () => context.executeAction(myAction);
 *     return <button onClick={onClick} />;
 * };
 *
 * export default withFluxible(MyComponent);
 *
 * @function withFluxible
 * @param {WrappedComponent} - Component to be wrapped with fluxible context
 * @returns {React.Component}
 */
const withFluxible = (WrappedComponent) => {
    const WithFluxible = (props) => {
        const context = useFluxible();
        return createElement(WrappedComponent, { ...props, context });
    };

    WithFluxible.displayName = `withFluxible(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

    return hoistNonReactStatics(WithFluxible, WrappedComponent);
};

export default withFluxible;
