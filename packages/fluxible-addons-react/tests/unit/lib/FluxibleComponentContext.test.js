const React = require('react');
const { useContext } = require('react');
const { renderToString } = require('react-dom/server');
const { FluxibleProvider, FluxibleComponentContext } = require('../../../');

describe('FluxibleComponentContext', () => {
    it('provides access to getStore and executeAction', () => {
        const context = {
            getStore: jest.fn(),
            executeAction: jest.fn(),
        };

        const Component = () => {
            const { getStore, executeAction } = useContext(
                FluxibleComponentContext,
            );
            getStore('SomeStore');
            executeAction('SomeAction');
            return null;
        };

        renderToString(
            <FluxibleProvider context={context}>
                <Component />
            </FluxibleProvider>,
        );

        expect(context.getStore).toHaveBeenCalledTimes(1);
        expect(context.executeAction).toHaveBeenCalledTimes(1);
    });

    it('throws error if executeAction is called and no context is set', () => {
        const Component = () => {
            const { executeAction } = useContext(FluxibleComponentContext);
            executeAction('SomeAction');
            return null;
        };

        expect(() => renderToString(<Component />)).toThrowError(); // eslint-disable-line dot-notation
    });

    it('throws error if getStore is called and no context is set', () => {
        const Component = () => {
            const { getStore } = useContext(FluxibleComponentContext);
            getStore('SomeAction');
            return null;
        };

        expect(() => renderToString(<Component />)).toThrowError(); // eslint-disable-line dot-notation
    });
});
