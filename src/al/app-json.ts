import * as vscode from 'vscode';
import * as fs from 'fs';
import { IAppJSON } from '../view/app/@types/app-json';

export const selectApp = async () : Promise<{fsPath : string, content: IAppJSON}>  => {
    const appJsonFiles = await getAppJsonFiles();
    if (appJsonFiles.length === 0) {
        throw new Error('No app.json files found');
    }
    if (appJsonFiles.length === 1) {
        return appJsonFiles[0];
    }
    const result = await vscode.window.showQuickPick(appJsonFiles.map(f => f.content.name), {title: 'Select the extension you wish to translate'});
    if (!result) {
        throw new Error('No extension selected');
    }
    const appJsonFile = appJsonFiles.find(x => x.content.name === result);
    if (!appJsonFile) {
        throw new Error(`Extension: ${result} was not found in the workspace`);
    }
    return appJsonFile;
};

const getAppJsonFiles = async () : Promise<{fsPath : string, content: IAppJSON}[]> => {
    const appJsonFiles = await vscode.workspace.findFiles('**/app.json');
    const returnValue : {fsPath : string, content: IAppJSON}[] = [];
    for(let i = 0; i < appJsonFiles.length; i++) {
        const appJsonFile = appJsonFiles[i];
        const content = fs.readFileSync(appJsonFile.fsPath, {encoding: 'utf8'});
        returnValue.push({
            fsPath: appJsonFile.fsPath,
            content: JSON.parse(content)
        });
    }
    return returnValue;
};

export const selectLanguage = async (appJson : IAppJSON) : Promise<string> => {
    const result = await vscode.window.showQuickPick(appJson.supportedLocales, {title: 'Select the language you wish to translate to'});
    if (!result) {
        throw new Error('No language selected');
    }
    return result;
};
