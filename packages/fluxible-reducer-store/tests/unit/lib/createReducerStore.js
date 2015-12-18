/*global describe,it,beforeEach */

import {expect} from 'chai';
import MessageStore from '../../fixtures/stores/MessageStore';
import SingleReducerStore from '../../fixtures/stores/SingleReducerStore';
import messages from '../../fixtures/data/messages';
import {createMockActionContext} from 'fluxible/utils';

describe('fluxible-reducer-store', () => {
    var context;
    beforeEach(() => {
        context = createMockActionContext({
            stores: [MessageStore, SingleReducerStore]
        });
    });
    it('should receive messages', () => {
        const messageStore = context.getStore(MessageStore);
        const singleStore = context.getStore(SingleReducerStore);
        expect(messageStore).to.be['instanceof'](MessageStore);
        context.dispatch('RECEIVE_MESSAGES', messages);
        const threadMessages = messageStore.getAllForThread('t_1');
        expect(singleStore.getState().count).to.equal(7);
        expect(threadMessages).to.be.an('array');
        expect(threadMessages.length).to.equal(3);
    });
    it('should handle open thread', () => {
        const store = context.getStore(MessageStore);
        const singleStore = context.getStore(SingleReducerStore);
        context.dispatch('RECEIVE_MESSAGES', messages);
        const threadMessages = store.getAllForThread('t_1');
        threadMessages.forEach((message) => {
            expect(message.isRead).to.equal(false);
        });
        context.dispatch('OPEN_THREAD', {
            threadID: 't_1'
        });
        expect(singleStore.getState().count).to.equal(7);
        const newThreadMessages = store.getAllForThread('t_1');
        newThreadMessages.forEach((message) => {
            expect(message.isRead).to.equal(true);
        });
    });
    it('should dehydrate correctly', () => {
        const store = context.getStore(MessageStore);
        context.dispatch('RECEIVE_MESSAGES', messages);
        const data = store.dehydrate();
        expect(data).to.deep.equal(store.getState());
    });
    it('should rehydrate correctly', () => {
        const store = context.getStore(MessageStore);
        context.dispatch('RECEIVE_MESSAGES', messages);
        const data = store.dehydrate();
        const beforeThreadMessages = store.getAllForThread('t_1');
        const newStore = new MessageStore();
        newStore.rehydrate(data);
        const afterThreadMessages = newStore.getAllForThread('t_1');
        expect(afterThreadMessages).to.deep.equal(beforeThreadMessages);
    });
});
