import { Component, createContext, createElement } from 'react';
import { arrayOf, node, object, string } from 'prop-types';

const throwError = () => {
    throw new Error(
        'Fluxible context not found. Wrap your component with Fluxible component or provideContext.'
    );
};

export const FluxibleContext = createContext({
    executeAction: throwError,
    getStore: throwError,
});

export class FluxibleProvider extends Component {
    constructor(props) {
        super(props);

        const state = {
            executeAction: this.props.context.executeAction,
            getStore: this.props.context.getStore,
        };

        this.props.plugins.forEach((plugin) => {
            state[plugin] = this.props.context[plugin];
        });

        this.state = state;
    }

    render() {
        const props = { value: this.state };
        return createElement(
            FluxibleContext.Provider,
            props,
            this.props.children
        );
    }
}

FluxibleProvider.propTypes = {
    children: node.isRequired,
    context: object.isRequired,
    plugins: arrayOf(string),
};

FluxibleProvider.defaultProps = {
    plugins: [],
};
