/*global window */
'use strict';

// This module implements state ids (created with nextStateId) which
// are used for imposing an ordering on History API states, useful for
// distinguishing "popstate" events as forward or backward events by
// comparing (isBefore) the pre- and post-popstate state ids.
//
// These ids only need to maintain an ordering over ids issued in the
// same browser tab/frame's "session history". sessionStorage is
// perfect for this (as it has wider browser support than the History
// API), EXCEPT if sessinStorage is explicity disabled (such as in
// Safari's private browsing mode). For that situation, we fall back
// to timestamps, which are almost as good, barring DST changes, etc.
//
// A client can have multiple "visits" to our site during one "session
// history": eg, they visit our site, navigate to some external site,
// and then navigate to our site again.

// state ids given out during the same visit are ordered by an
// incrementing "counter" field
var nextStateCounter = (function () {
    var x = 0;
    return function () {
        return x++;
    };
})();

// Separate visits will reset the "nextStateCounter" counters; so we
// combine the counters with a per-visit visitId.
var visitId = (function () {
    var nextId;

    try {
        if (window.sessionStorage.fluxibleRouterStateId) {
            nextId = ++window.sessionStorage.fluxibleRouterStateId;
        } else {
            nextId = window.sessionStorage.fluxibleRouterStateId = 1;
        }
    } catch (e) {
        nextId = Date.now();
    }

    return nextId;
})();

function nextStateId() {
    return {
        visit: visitId,
        counter: nextStateCounter()
    };
}

// compare 2 state ids: return true if a was created before b
//
// An improper stateId object (most likely undefined) is considered to
// always be 'before' the other. If both a and b are undefined,
// isBefore returns false.
function isBefore(a, b) {
    return b && (!a || a.visit < b.visit || (a.visit === b.visit && a.counter < b.counter));
}

module.exports = {
    next: nextStateId,
    isBefore: isBefore
};
