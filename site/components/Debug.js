import React from 'react';
import { FluxibleComponentContext } from 'fluxible-addons-react';
import { Actions } from 'fluxible-plugin-devtools';

class Debug extends React.Component {
    static contextType = FluxibleComponentContext;

    constructor() {
        super();
        this.state = {
            shouldRender: false,
            relativeWidth: false,
        };
    }

    componentDidMount() {
        if (this.context.query.debug) {
            this.setState({ shouldRender: true });
        }
    }

    handleRelativeWidth(event) {
        this.setState({ relativeWidth: event.target.checked });
    }

    render() {
        if (!this.state.shouldRender) {
            return null;
        }
        var styles = {
            backgroundColor: '#fdfbff',
            borderColor: '#400090',
            borderBottomRightRadius: 4,
            borderStyle: 'solid',
            borderWidth: '0 3px 3px 0',
            boxShadow: '2px 2px 10px #888',
            font: '13px/1.3 "Helvetica Neue", Helvetica, Arial, sans-serif',
            left: 0,
            maxHeight: '80%',
            overflow: 'scroll',
            position: 'fixed',
            top: 0,
            width: '80%',
            zIndex: 100,
        };
        return (
            <div style={styles}>
                <input
                    type="checkbox"
                    id="relative_action_tracing"
                    onClick={this.handleRelativeWidth.bind(this)}
                />
                <label htmlFor="relative_action_tracing">Relative width</label>
                <Actions relativeWidth={this.state.relativeWidth} />
            </div>
        );
    }
}

export default Debug;
