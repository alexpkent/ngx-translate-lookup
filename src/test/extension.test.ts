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

suite("Extension Tests", function () {

    test('translate directive regex finds the relevant items', function () {
        const matcher = 'translate="([A-Za-z0-9_]+)"';
        runTest(matcher, getDirectiveText(), 2);
    });

    test('translate pipe regex finds the relevant items', function () {
        const matcher = "{{'([A-Za-z0-9_]+)'\s?|\s?translate_}}";
        runTest(matcher, getPipeText(), 2);
    });

    function runTest(matcher: string, text: string, numOfMatches: number) {
        const regex = new RegExp(matcher, "gm");
        let match;
        const matches = [];
        while (match = regex.exec(text)) {
            let key = match[1];
            matches.push(key);
        }

        assert.equal(numOfMatches, matches.length);
    }

    function getDirectiveText() {
        return '<label translate="TEST1"><label translate="TEST_2"><label translate2"NO_MATCH">';
    }

    function getPipeText() {
        return '<label>{{\'TEST\'|translate}}<label><label>{{\'TEST\' | translate }}</label>';
    }
});