'use strict';
import * as vscode from 'vscode';

export function createCompletionItemProvider (resourceDictionary: vscode.CompletionItem[]): vscode.CompletionItemProvider {
    return {
        provideCompletionItems: () => resourceDictionary
    };
}