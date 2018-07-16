'use strict';
import * as vscode from 'vscode';
import { createHoverProvider } from './hoverProvider';
import { createCompletionItemProvider } from './completionItemProvider';
import { createHighlightProvider } from './highlightProvider';
const resx2js  = require('resx/resx2js');

export function activate(context: vscode.ExtensionContext) {

    const config = vscode.workspace.getConfiguration();
    const resxPath = config.get('ngx-translate.lookup.resourcesPath');
    if (!resxPath) {
        console.log('No resources path found in config');
        return;
    }

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
            console.log('Resource dictionary read successfully');
          });
      });

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('html', createCompletionItemProvider(resourceDictionary), '"', '\''));
    context.subscriptions.push(vscode.languages.registerHoverProvider('html', createHoverProvider(resourceDictionary)));
    createHighlightProvider(context, resourceDictionary);
}

export function deactivate() {
}