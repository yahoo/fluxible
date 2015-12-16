/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
module.exports = {
    name: 'test',
    read: function read(req, resource, params, config, callback) {
        callback(null, 'read', {
            headers: {
                'Cache-Control': 'private'
            }
        });
    },
    create: function create(req, resource, params, config, body, callback) {
        callback(null, 'create');
    },
    update: function update(req, resource, params, config, body, callback) {
        callback(null, 'update');
    },
    'delete': function del(req, resource, params, config, callback) {
        callback(null, 'delete');
    }
};
