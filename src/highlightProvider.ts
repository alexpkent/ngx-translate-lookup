import * as vscode from 'vscode';

export function createHighlightProvider(
    context: vscode.ExtensionContext,
    resourceDictionary: vscode.CompletionItem[],
    textMatchers: string[]) {

    const decoration = vscode.window.createTextEditorDecorationType({
		overviewRulerColor: 'red',
		textDecoration: 'underline',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		light: {
			borderColor: 'red'
		},
		dark: {
			borderColor: 'red'
		}
    });
    
    let activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	var timeout: NodeJS.Timer | null = null;
	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(updateDecorations, 500);
	}

	function updateDecorations() {
		if (!activeEditor) {
			return;
        }
        
        const text = activeEditor.document.getText();
		const untrackedStrings: vscode.DecorationOptions[] = [];
        let match: RegExpExecArray | null;

        for (const matcher of textMatchers) {
			const regex = new RegExp(matcher, "gm");

			while ((match = regex.exec(text)) !== null) {
				// This is necessary to avoid infinite loops with zero-width matches
				if (match.index === regex.lastIndex) {
					regex.lastIndex++;
				}
				
				let key = match[1];
				const resource = resourceDictionary.find(item => item.insertText === key);
                if (!resource) {
					console.log('missing: ' + key);
                    const startPos = activeEditor.document.positionAt(match.index);
			        const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			        const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: `Missing resource string: '${key}'`};
                    untrackedStrings.push(decoration);
                }
			}
        }
		
		activeEditor.setDecorations(decoration, untrackedStrings);
	}
}