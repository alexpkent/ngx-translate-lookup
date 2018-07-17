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

    try {
        vscode.workspace.openTextDocument(vscode.Uri.file(resxPath as string))
        .then((document) => {
        let text = document.getText();
        resx2js(text, (err: string, resources: any) => {
            for (const key in resources) {
                if (resources.hasOwnProperty(key)) {
                    const item = resources[key];
                    resourceDictionary.push(
                        {
                            label: key, 
                            detail: `ngx-translate: ${item}`,  
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
    } catch (error) {
        console.error('error when reading resx file and configuring, please check your ngx-translate.lookup.resourcesPath setting.');
        console.error(error);
    }
}

export function deactivate() {
}