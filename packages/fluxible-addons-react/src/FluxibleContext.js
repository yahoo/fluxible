import { Component, createContext, createElement } from 'react';
import { node, object } from 'prop-types';

export const FluxibleContext = createContext({
    executeAction: () => {},
    getStore: () => {},
});

export class FluxibleProvider extends Component {
    constructor(props) {
        super(props);
        this.state = {
            executeAction: this.props.context.executeAction,
            getStore: this.props.context.getStore,
        };
    }

    render() {
        const props =  { value: this.state };
        return createElement(FluxibleContext.Provider, props, this.props.children);
    }
}

FluxibleProvider.propTypes = {
    children: node.isRequired,
    context: object.isRequired,
};
