var showChat = require('../actions/showChat');
var openThread = require('../actions/openThread');

module.exports = {
    home: {
        path: '/',
        method: 'get',
        action: function (context, payload, done) {
            context.executeAction(showChat, {}, done);
        }
    },
    thread: {
        path: '/thread/:id',
        method: 'get',
        action: function (context, payload, done) {
            var threadID = payload.get('params').get('id');
            context.executeAction(showChat, { threadID: threadID }, function() {
                context.executeAction(openThread, { threadID: threadID }, function() {
                    done();
                })
            });
        }
    }
};
