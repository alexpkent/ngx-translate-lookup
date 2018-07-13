'use strict';
import * as vscode from 'vscode';
const resx2js  = require('resx/resx2js');

export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "translatelookup" is now active!');

    const config = vscode.workspace.getConfiguration();
    const resxPath = config.get('ngx-translate.lookup.resourcesPath');
    console.log('Resources config path: ' + resxPath);

    let resourceDictionary: vscode.CompletionItem[] = [];

    vscode.workspace.openTextDocument(vscode.Uri.file(resxPath as string))
        .then((document) => {
        let text = document.getText();
        resx2js(text, (err: string, resources: any) => {
            for (const key in resources) {
                if (resources.hasOwnProperty(key)) {
                    const item = resources[key];
                    resourceDictionary.push(
                        {
                            label: `Translate:${key}`, 
                            detail: item,  
                            insertText: key, 
                            kind: vscode.CompletionItemKind.Text 
                        }
                    );
                }
            }
            console.log(resourceDictionary);
          });
      });

    const completionItem = {
        provideCompletionItems: () => resourceDictionary
    };

    const hoverProvider: vscode.HoverProvider = {
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

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('html', completionItem, '"', '\''));
    context.subscriptions.push(vscode.languages.registerHoverProvider('html', hoverProvider));
}

export function deactivate() {
}