'use strict';
import * as vscode from 'vscode';

export function createHoverProvider (resourceDictionary: vscode.CompletionItem[]): vscode.HoverProvider {
    return {
        provideHover(document, position) {

            let key: string;
            let checker = undefined;
            let range;
            const checkers = [ 'translate="([A-Z_]+)"', "{{'([A-Z_]+)' \| translate }}" ];

            for (const check of checkers) {
                range = document.getWordRangeAtPosition(position, new RegExp(check));
                if (range) {
                    checker = check;
                    break;
                }
            }

            if (checker === undefined) {
                console.log('hover range is not a translate directive');
                return null;
            }

            const text = document.getText(range);

            const val = new RegExp(checker);
            const regexMatch = val.exec(text);
            if (!regexMatch) {
                console.log('hover range cannot match a regex');
                return null;
            }

            key = regexMatch[1];

            const resource = resourceDictionary.find(item => item.insertText === key);

            const message = resource ? 
            `${key}\nResource value: '${resource.detail}'` : 
            `No translation found for '${key}', check the resources!`;

            return new vscode.Hover({
                language: 'html',
                value: message
            });
        }
    };
}