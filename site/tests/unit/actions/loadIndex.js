/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, beforeEach */
'use strict';
import { expect } from 'chai';
import { createMockActionContext } from 'fluxible/utils';
import MockService from 'fluxible-plugin-fetchr/utils/MockServiceManager';
import SearchStore from '../../../stores/SearchStore';
import loadIndex from '../../../actions/loadIndex';
import mockIndex from '../../fixtures/index.json';

describe('site', () => {
    describe('load index', function () {
        let context;

        beforeEach(function () {
            context = createMockActionContext({
                stores: [SearchStore],
            });
            context.service = new MockService();
            context.service.setService(
                'search',
                function (method, params, config, callback) {
                    callback(null, mockIndex);
                },
            );
        });

        it('should load index from the service', function (done) {
            context.executeAction(loadIndex, {}, function () {
                expect(context.dispatchCalls.length).to.equal(1);
                expect(context.dispatchCalls[0].name).to.equal('RECEIVE_INDEX');
                expect(context.dispatchCalls[0].payload).to.eql(mockIndex);
                done();
            });
        });
    });
});
