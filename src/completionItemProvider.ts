'use strict';
import * as vscode from 'vscode';
import { ResourceDictionary } from './extension';

export function createCompletionItemProvider(): vscode.CompletionItemProvider {
  return {
    provideCompletionItems: (
      document: vscode.TextDocument,
      position: vscode.Position
    ) => {
      const text = document.lineAt(position).text;
      if (text.includes('translate')) {
        return ResourceDictionary.instance.getResources();
      }

      return undefined;
    }
  };
}
