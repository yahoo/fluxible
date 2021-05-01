import sinon from 'sinon';
import { expect } from 'chai';
import React, { useContext } from 'react';
import { renderToString } from 'react-dom/server';

import { FluxibleContext, FluxibleComponent } from '../../../';

describe('FluxibleContext', () => {
    it('provides access to getStore and executeAction', () => {
        const context = {
            getStore: sinon.stub(),
            executeAction: sinon.stub(),
        };

        const Component = () => {
            const { getStore, executeAction } = useContext(FluxibleContext);
            getStore('SomeStore');
            executeAction('SomeAction');
            return null;
        };

        renderToString(
            <FluxibleComponent context={context}>
                <Component />
            </FluxibleComponent>
        );

        sinon.assert.calledOnce(context.getStore);
        sinon.assert.calledOnce(context.executeAction);
    });

    it('throws error if executeAction is called and no context is set', () => {
        const Component = () => {
            const { executeAction } = useContext(FluxibleContext);
            executeAction('SomeAction');
            return null;
        };

        expect(() => renderToString(<Component />)).to.throw(); // eslint-disable-line dot-notation
    });

    it('throws error if getStore is called and no context is set', () => {
        const Component = () => {
            const { getStore } = useContext(FluxibleContext);
            getStore('SomeAction');
            return null;
        };

        expect(() => renderToString(<Component />)).to.throw(); // eslint-disable-line dot-notation
    });
});
