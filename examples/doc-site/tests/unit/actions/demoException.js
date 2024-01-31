/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, beforeEach */
'use strict';
import { expect } from 'chai';
import { createMockActionContext } from 'fluxible/utils';
import demoException from '../../../actions/demoException';

describe('site', () => {
    describe('demo exception', function () {
        let context;

        beforeEach(function () {
            context = createMockActionContext();
        });

        it('should execute the action', function (done) {
            demoException(context, {}, function (err) {
                expect(err).to.eql(new Error('Whoops!'));
                done();
            });
        });
    });
});
