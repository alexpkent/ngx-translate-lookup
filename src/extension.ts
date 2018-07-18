'use strict';
import * as vscode from 'vscode';
import { createHoverProvider } from './hoverProvider';
import { createCompletionItemProvider } from './completionItemProvider';
import { createHighlightProvider } from './highlightProvider';
const resx2js  = require('resx/resx2js');

export function activate(context: vscode.ExtensionContext) {

    const config = vscode.workspace.getConfiguration();
    const resourcesPath = config.get('ngx-translate.lookup.resourcesPath');
    if (!resourcesPath) {
        console.log('No resources path found in config');
        return;
    }

    const resourcesType = config.get('ngx-translate.lookup.resourcesType');

    console.log(`Resources config type: ${resourcesType} path: ${resourcesPath}`);

    let resourceDictionary: vscode.CompletionItem[] = [];

    try {
        vscode.workspace.openTextDocument(vscode.Uri.file(resourcesPath as string))
        .then((document) => {
        let text = document.getText();
        
        if (resourcesType === 'resx') {
            resx2js(text, (err: string, resources: any) => {
                for (const key in resources) {
                    if (resources.hasOwnProperty(key)) {
                        const item = resources[key];
                        resourceDictionary.push(
                            {
                                label: `ngx-translate: ${key}`, 
                                detail: item,  
                                insertText: key, 
                                kind: vscode.CompletionItemKind.Text 
                            }
                        );
                    }
                }
            });
        }

        if (resourcesType === 'json') {
            const resources = JSON.parse(text);
            for (const item of resources) {
                Object.keys(item).forEach(function (key) {
                    resourceDictionary.push(
                        {
                            label: `ngx-translate: ${key}`, 
                            detail: item[key],  
                            insertText: key, 
                            kind: vscode.CompletionItemKind.Text 
                        }
                    );
              });
            }
        }

        console.log('Resource dictionary read successfully');
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