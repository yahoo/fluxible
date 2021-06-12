import sinon from 'sinon';
import { expect } from 'chai';
import React, { useContext } from 'react';
import { renderToString } from 'react-dom/server';
import { FluxibleComponent, FluxibleComponentContext } from '../../../';

describe('FluxibleComponentContext', () => {
    it('provides access to getStore and executeAction', () => {
        const context = {
            getStore: sinon.stub(),
            executeAction: sinon.stub(),
        };

        const Component = () => {
            const { getStore, executeAction } = useContext(
                FluxibleComponentContext
            );
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
            const { executeAction } = useContext(FluxibleComponentContext);
            executeAction('SomeAction');
            return null;
        };

        expect(() => renderToString(<Component />)).to.throw(); // eslint-disable-line dot-notation
    });

    it('throws error if getStore is called and no context is set', () => {
        const Component = () => {
            const { getStore } = useContext(FluxibleComponentContext);
            getStore('SomeAction');
            return null;
        };

        expect(() => renderToString(<Component />)).to.throw(); // eslint-disable-line dot-notation
    });
});
