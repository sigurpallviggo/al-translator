
import * as vscode from 'vscode';
import * as fs from 'fs';
import { TextEditorDecorationType } from 'vscode';
import { selectApp, selectLanguage } from './al/app-json';
import { parseWorkspace } from './al/object-parser';
import { findXliffFileFromLanguageAndExtensionName } from './al/xliff-file';
import { XLIFFDocument } from './view/app/@types/xliff-file';
import { createWebViewPanel } from './view/webview';
import * as xmlParser from 'xml2js';

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

	let disp = vscode.commands.registerCommand('al-translate.openXlfFile', async (file) => {
		if (!file) {
			return;
		}
		try {
			const xliffFile: vscode.Uri = file;
			const content = fs.readFileSync(xliffFile.fsPath, { encoding: 'utf8' });
			const xlf: XLIFFDocument = await xmlParser.parseStringPromise(content, {});
			createWebViewPanel(context, { fsPath: xliffFile.fsPath, content: xlf });
		} catch (e: any) {
			showError(e.toString());
		}

	});
	context.subscriptions.push(disp);
	context.subscriptions.push(disposable);
}



const showError = (message: string) => {
	vscode.window.showErrorMessage(message).then(undefined, err => {
		console.error('Show error fail');
	});
};

// this method is called when your extension is deactivated
export function deactivate() { }
