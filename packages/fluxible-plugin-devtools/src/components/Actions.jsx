/**
 * Copyright 2016, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import PropTypes from 'prop-types';
import React from 'react';
import ActionTree from './ActionTree';

export default class Actions extends React.Component {
    static contextTypes = {
        devtools: PropTypes.object,
    };

    render() {
        var actions = this.context.devtools
            .getActionHistory()
            .map((action) => (
                <ActionTree
                    {...this.props}
                    action={action}
                    key={action.rootId}
                />
            ));
        return <div>{actions}</div>;
    }
}
