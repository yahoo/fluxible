/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, beforeEach */
'use strict';
import { expect } from 'chai';
import { createMockActionContext } from 'fluxible/utils';
import doSearch from '../../../actions/doSearch';

describe('site', () => {
    describe('do search', function () {
        let context;

        beforeEach(function () {
            context = createMockActionContext();
        });

        it('should execute the action', function (done) {
            doSearch(context, 'query', function () {
                expect(context.dispatchCalls.length).to.equal(1);
                expect(context.dispatchCalls[0].name).to.equal('DO_SEARCH');
                expect(context.dispatchCalls[0].payload).to.equal('query');
                done();
            });
        });
    });
});
