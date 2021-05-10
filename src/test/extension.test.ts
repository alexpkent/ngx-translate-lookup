//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as vscode from 'vscode';
import { readJson } from '../extension';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

suite('Extension Tests', function () {
  test('translate directive regex finds the relevant items', function () {
    const matcher = 'translate="([A-Za-z0-9_.]+)"';
    runTest(matcher, getDirectiveText(), 3);
  });

  test('translate pipe regex finds the relevant items', function () {
    const matcher = "{{\\s?'([A-Za-z0-9_\\.]+)'\\s?\\|\\s?translate\\s?}}";
    runTest(matcher, getPipeText(), 3);
  });

  test('nested json can be read and used', function () {
    const jsonText =
      '{"STRING1" : "This is the first","STRING2" : "This is the second","foo": {"bar": {"word1": "translated1","word2": "translated2"}}}';

    const resources = JSON.parse(jsonText);
    let resourceDictionary: vscode.CompletionItem[] = [];

    readJson(resourceDictionary, resources);

    assert.equal(resourceDictionary.length, 4);

    assert.equal('STRING1', resourceDictionary[0].insertText);
    assert.equal('This is the first', resourceDictionary[0].detail);

    assert.equal('STRING2', resourceDictionary[1].insertText);
    assert.equal('This is the second', resourceDictionary[1].detail);

    assert.equal('foo.bar.word1', resourceDictionary[2].insertText);
    assert.equal('translated1', resourceDictionary[2].detail);

    assert.equal('foo.bar.word2', resourceDictionary[3].insertText);
    assert.equal('translated2', resourceDictionary[3].detail);
  });

  function runTest(matcher: string, text: string, numOfMatches: number) {
    const regex = new RegExp(matcher, 'gm');
    let match;
    const matches = [];
    while ((match = regex.exec(text))) {
      let key = match[1];
      matches.push(key);
    }

    assert.equal(numOfMatches, matches.length);
  }

  function getDirectiveText() {
    return '<label translate="TEST1"><label translate="TEST_2" translate="foo.bar"><label translate2"NO_MATCH">';
  }

  function getPipeText() {
    return "<label>{{'TEST'|translate}}<label><label>{{ 'TEST' | translate }}{{'foo.bar'|translate}}</label>";
  }
});
