
import * as vscode from 'vscode';
import { TextEditorDecorationType } from 'vscode';
import { selectApp, selectLanguage } from './al/app-json';
import { parseWorkspace } from './al/object-parser';
import { findXliffFileFromLanguageAndExtensionName } from './al/xliff-file';
import { createWebViewPanel } from './view/webview';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('al-translate.translateExtension', async () => {
		selectApp()
			.then(extension => {
				selectLanguage(extension.content)
					.then(language => {
						findXliffFileFromLanguageAndExtensionName(extension.content.name, language)
							.then(xliffFile => createWebViewPanel(context, xliffFile)).catch(err => showError(err.toString));
					}).catch(err => showError(err.toString()));
			}).catch(err => showError(err.toString()));
	});

	context.subscriptions.push(disposable);
}

const showError = (message: string) => {
	vscode.window.showErrorMessage(message).then(undefined, err => {
		console.error('Show error fail');
	});
};

// this method is called when your extension is deactivated
export function deactivate() { }
