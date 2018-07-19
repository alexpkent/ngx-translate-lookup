'use strict';
import * as vscode from 'vscode';
import { ResourceDictionary } from './extension';

export function createHoverProvider (): vscode.HoverProvider {
    const config = vscode.workspace.getConfiguration();
    
    return {
        provideHover(document, position) {
            
            const resourceDictionary = ResourceDictionary.Instance.getResources();
            let key: string;
            let checker = undefined;
            let range;

            const textMatchers = config.get('ngx-translate.lookup.regex') as string[];
            for (const check of textMatchers) {
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

            if (!resource) {
                return null;
            }

            return new vscode.Hover({
                language: 'html',
                value: `${key}\nResource value: '${resource.detail}'`
            });
        }
    };
}