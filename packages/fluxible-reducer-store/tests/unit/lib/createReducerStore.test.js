/*global describe,it,beforeEach */

const MessageStore = require('../../fixtures/stores/MessageStore');
const SingleReducerStore = require('../../fixtures/stores/SingleReducerStore');
const messages = require('../../fixtures/data/messages');
const { createMockActionContext } = require('fluxible/utils');

describe('fluxible-reducer-store', () => {
    let context;

    beforeEach(() => {
        context = createMockActionContext({
            stores: [MessageStore, SingleReducerStore],
        });
    });

    it('should receive messages', () => {
        const messageStore = context.getStore(MessageStore);
        const singleStore = context.getStore(SingleReducerStore);
        expect(messageStore).toBeInstanceOf(MessageStore);
        context.dispatch('RECEIVE_MESSAGES', messages);
        const threadMessages = messageStore.getAllForThread('t_1');
        expect(singleStore.getState().count).toEqual(7);
        expect(threadMessages).toHaveLength(3);
    });

    it('should handle open thread', () => {
        const store = context.getStore(MessageStore);
        const singleStore = context.getStore(SingleReducerStore);
        context.dispatch('RECEIVE_MESSAGES', messages);
        const threadMessages = store.getAllForThread('t_1');
        threadMessages.forEach((message) => {
            expect(message.isRead).toEqual(false);
        });
        context.dispatch('OPEN_THREAD', {
            threadID: 't_1',
        });
        expect(singleStore.getState().count).toEqual(7);
        const newThreadMessages = store.getAllForThread('t_1');
        newThreadMessages.forEach((message) => {
            expect(message.isRead).toEqual(true);
        });
    });

    it('should dehydrate correctly', () => {
        const store = context.getStore(MessageStore);
        context.dispatch('RECEIVE_MESSAGES', messages);
        const data = store.dehydrate();
        expect(data).toEqual(store.getState());
    });

    it('should rehydrate correctly', () => {
        const store = context.getStore(MessageStore);
        context.dispatch('RECEIVE_MESSAGES', messages);
        const data = store.dehydrate();
        const beforeThreadMessages = store.getAllForThread('t_1');
        const newStore = new MessageStore();
        newStore.rehydrate(data);
        const afterThreadMessages = newStore.getAllForThread('t_1');
        expect(afterThreadMessages).toEqual(beforeThreadMessages);
    });
});
