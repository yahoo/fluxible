const { createReducerStore } = require('../../../');

const reducers = {
    RECEIVE_MESSAGES: (state, messages) => {
        var oldMessages = state.messages;
        var newMessages = { ...oldMessages };
        messages.forEach(function (message) {
            newMessages[message.id] = {
                ...message,
                isRead: false,
            };
        });
        var sortedByDate = (newMessages && Object.keys(newMessages)) || [];
        sortedByDate.sort(function (a, b) {
            if (newMessages[a].date < newMessages[b].date) {
                return -1;
            } else if (newMessages[a].date > newMessages[b].date) {
                return 1;
            }
            return 0;
        });

        return {
            messages: newMessages,
            sortedByDate,
        };
    },
    OPEN_THREAD: (state, payload) => {
        // Mark all read
        var oldMessages = state.messages;
        var newMessages = {
            ...oldMessages,
        };
        Object.keys(state.messages).forEach((key) => {
            var message = state.messages[key];
            if (message.threadID === payload.threadID) {
                newMessages[key] = {
                    ...message,
                    text: message.text + 'foo',
                    isRead: true,
                };
            }
        });
        return {
            ...state,
            messages: newMessages,
        };
    },
};

var getters = {
    getAll: function getAll(state) {
        return state.messages;
    },
    get: function get(state, id) {
        return state.messages[id];
    },
    getAllForThread: function getAllForThread(state, threadID) {
        var threadMessages = [];
        state.sortedByDate.forEach(function (key) {
            var message = state.messages[key];
            if (message.threadID === threadID) {
                threadMessages.push(message);
            }
        });
        return threadMessages;
    },
};

var MessageStore = createReducerStore({
    storeName: 'MessageStore',
    initialState: {
        messages: {},
        sortedByDate: [],
    },
    reducers: reducers,
    getters: getters,
});

module.exports = MessageStore;
