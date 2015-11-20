/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global browser, describe, it */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var protractor = require('protractor');
var EC = protractor.ExpectedConditions;

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('search', function () {
    it('should perform a search', function () {
        browser.get(browser.baseUrl);
        expect(browser.getTitle()).to.eventually.match(/Fluxible/);

        // click the search icon to show the search
        $('.fa-search').click();

        // enter search term
        var searchInput = $('input[name="q"]');
        searchInput.sendKeys('context');
        searchInput.sendKeys(protractor.Key.ENTER);

        // get the main container to ensure search was performed
        var h1 = $('#main h1');
        browser.wait(EC.presenceOf(h1), 500);

        // grab search results container
        var searchResults = $$('#main ol li');
        browser.wait(EC.presenceOf(searchResults.get(0)), 500);

        // ensure the search page was viewed
        expect(h1.getText()).to.eventually.match(/Search Results/);

        // this ensures there are some search results, without
        // needing to assert what the results are
        expect(searchResults.count()).to.eventually.be.above(1);
    });
});
