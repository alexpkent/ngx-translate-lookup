//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {

    test('translate regex finds the relevant items', function() {
        const matcher = 'translate="([A-Z_]+)';
        const regex = new RegExp(matcher);
        let match;
        const matches = [];
        while (match = regex.exec(getText())) {
            let key = match[1];
            matches.push(key);
        }

        assert.equal(2, matches.length);
    });

    function getText() {
        return '<label translate="TEST1"><label translate="TEST_2"><label translate2"NO_MATCH">';
    }
});