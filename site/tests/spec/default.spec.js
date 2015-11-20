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

describe('fluxible', function () {
    it('should have a title', function () {
        browser.get(browser.baseUrl);
        expect(browser.getTitle()).to.eventually.match(/Fluxible/);
    });

    it('follows get started link', function () {
        browser.get(browser.baseUrl);
        expect(browser.getTitle()).to.eventually.match(/Fluxible/);

        $('#splash a').click();

        var h1 = $('#main h1');
        browser.wait(EC.presenceOf(h1), 500);

        expect(h1.getText()).to.eventually.match(/Quick Start/);
        expect(browser.getCurrentUrl()).to.eventually.match(/quick-start.html/);
        expect(browser.getTitle()).to.eventually.match(/Quick Start/);
    });

    it('follows doc links', function () {
        // load quick start page
        browser.get(browser.baseUrl + 'quick-start.html');
        expect(browser.getTitle()).to.eventually.match(/Quick Start/);

        // navigate to Actions page
        $('#aside a.Actions').click();

        var h1 = $('#main h1');

        // without this protractor tests the old dom node
        // but react renders it away and causes stale element error
        browser.wait(EC.stalenessOf(h1), 500);

        // this ensures the node is available
        browser.wait(EC.presenceOf(h1), 500);

        expect(h1.getText()).to.eventually.match(/Actions/);
        expect(browser.getCurrentUrl()).to.eventually.match(/api\/actions.html/);
        expect(browser.getTitle()).to.eventually.match(/Actions/);
    });
});
