/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import debugLib from 'debug';
import fs from 'fs';
import getSearchIndexPath from '../utils/getSearchIndexPath';
import { getDocuments, getLunrIndex } from './docs';
const debug = debugLib('SearchService');

export default {
    name: 'search',
    read: function (req, resource, params, config, callback) {
        debug('Reading index');
        try {
            debug('Index loaded');
            return callback(null, {
                docs: getDocuments(),
                index: getLunrIndex().toJSON(),
            });
        } catch (e) {
            callback(e);
        }
    },
};
