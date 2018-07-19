'use strict';
import * as vscode from 'vscode';
import { createHoverProvider } from './hoverProvider';
import { createCompletionItemProvider } from './completionItemProvider';
import { createHighlightProvider } from './highlightProvider';
const resx2js = require('resx/resx2js');
const fs = require('fs');

export class ResourceDictionary {
    private constructor() {}

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }

    private _resources: vscode.CompletionItem[] = [];
    private static _instance: ResourceDictionary;

    public setResources(resources: vscode.CompletionItem[]) {
        this._resources = resources;
    }

    public getResources(): vscode.CompletionItem[] {
        return this._resources;
    }
}

export function readResourceConfig() {
    const config = vscode.workspace.getConfiguration();
    const resourcesPath = config.get('ngx-translate.lookup.resourcesPath') as string;
    if (!resourcesPath) {
        console.log('No resources path found in config');
        return;
    }

    const resourcesType = config.get('ngx-translate.lookup.resourcesType') as string;

    console.log(`Resources config type: ${resourcesType} path: ${resourcesPath}`);

    return {
        resourcesPath: resourcesPath,
        resourcesType: resourcesType
    };
}

export function activate(context: vscode.ExtensionContext) {

    const config = readResourceConfig();
    if (!config) {
        console.error('No resources config found.');
        return;
    }

    try {
        loadResources(config.resourcesPath, config.resourcesType)
            .then(dictionary => {
                ResourceDictionary.Instance.setResources(dictionary);

                vscode.window.showInformationMessage(`ngx-translate-lookup resource dictionary loaded from ${config.resourcesPath}`);

                context.subscriptions.push(vscode.languages.registerCompletionItemProvider('html', createCompletionItemProvider(), '"', '\''));
                context.subscriptions.push(vscode.languages.registerHoverProvider('html', createHoverProvider()));
                createHighlightProvider(context);
        });
    } catch (error) {
        console.error('error when reading resx file and configuring, please check your ngx-translate.lookup.resourcesPath setting.');
        console.error(error);
    }

    let reloadCommand = vscode.commands.registerCommand('ngx-translate-lookup.reload', () => {
        const config = readResourceConfig();
        if (!config) {
            console.error('No resources config found.');
            return;
        }

        loadResources(config.resourcesPath, config.resourcesType)
            .then(dictionary => {
                ResourceDictionary.Instance.setResources(dictionary);

                vscode.window.showInformationMessage(`ngx-translate-lookup resource dictionary reloaded from ${config.resourcesPath}`);
        });
    });
    context.subscriptions.push(reloadCommand);
}

export function loadResources(resourcesPath: string, resourcesType: string): Promise<any> {
    let resourceDictionary: vscode.CompletionItem[] = [];

    return new Promise((resolve, reject) => {
        fs.readFile(resourcesPath, function read(err: any, text: string) {
            if (err) {
                reject(err);
            }
    
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
                Object.keys(resources).forEach(function (key) {
                    resourceDictionary.push(
                        {
                            label: `ngx-translate: ${key}`, 
                            detail: resources[key],  
                            insertText: key, 
                            kind: vscode.CompletionItemKind.Text 
                        }
                    );
                  });
            }
    
            resolve(resourceDictionary);
        });   
    });

}

export function deactivate() {
}