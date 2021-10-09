/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, beforeEach, afterEach */
'use strict';
import { expect } from 'chai';
import SearchStore from '../../../stores/SearchStore';
import mockIndex from '../../fixtures/index.json';

describe('site', () => {
    describe('doc store', function () {
        let storeInstance;

        beforeEach(function () {
            storeInstance = new SearchStore();
        });

        afterEach(function () {
            storeInstance = undefined;
        });

        it('should instantiate correctly', function () {
            expect(storeInstance).to.be.an('object');
            expect(storeInstance.docs).to.equal(null);
            expect(storeInstance.index).to.equal(null);
            expect(storeInstance.query).to.equal(null);
            expect(storeInstance.results).to.be.an('array');
        });

        it('should receive index', function () {
            storeInstance._receiveIndex(mockIndex);
            expect(Object.keys(storeInstance.docs).length).to.equal(1);
        });

        it('should get the docs', function () {
            storeInstance._receiveIndex(mockIndex);
            expect(storeInstance.getDocs()).to.be.an('object');
            expect(storeInstance.getDocs()).to.eql(mockIndex.docs);
        });

        it('should get the index', function () {
            storeInstance._receiveIndex(mockIndex);
            expect(storeInstance.getIndex()).to.be.an('object');
        });

        it('should get the query', function () {
            const query = 'foo';
            storeInstance._receiveIndex(mockIndex);
            storeInstance._doSearch(query);
            expect(storeInstance.getQuery()).to.equal(query);
        });

        it('should get the store state', function (done) {
            storeInstance._receiveIndex(mockIndex);
            const state = storeInstance.getState();

            expect(state.docs).to.be.an('object');
            expect(state.index).to.be.an('object');
            done();
        });
    });
});
