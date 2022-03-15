import * as vscode from 'vscode';
import * as path from 'path';
import { IWebViewMessage } from './app/@types/messages';
import { parseWorkspace } from '../al/object-parser';
import { XLIFFDocument } from './app/@types/xliff-file';
import { IALObject, IALObjectType } from './app/@types/al';
import { getCodeunitTranslations, getEnumTranslations, getPageExtensionTranslations, getPageTranslations, getPercentageTranslated, getTableExtensionTranslations, getTableTranslations } from '../al/xliff-file';
import { saveTranslation } from '../al/translate';

export const createWebViewPanel = (context: vscode.ExtensionContext, xliffFile: { fsPath: string, content: XLIFFDocument }) => {
    const panel = vscode.window.createWebviewPanel('al-translate', 'Translate AL Extension', vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, 'appView'))
        ]
    });
    panel.webview.html = getWebViewTemplate(context);
    panel.webview.onDidReceiveMessage(((message: IWebViewMessage) => handleMessage(panel, message)));

    const handleMessage = async (panel: vscode.WebviewPanel, message: IWebViewMessage) => {
        switch (message.command) {
            case 'al_objects':
                panel.webview.postMessage({ command: message.command, payload: await parseWorkspace(xliffFile.content) });
                break;
            case 'al_object_id':
                if (message.payload.id && message.payload.type) {
                    panel.webview.postMessage({ command: message.command, payload: await getSpecificALObject(message.payload.id, message.payload.type, xliffFile.content) });
                }
                break;
            case 'al_object_translation':
                if (message.payload.name && message.payload.type) {
                    switch (message.payload.type) {
                        case 'table':
                            const tabletranslation = getTableTranslations(xliffFile.content, message.payload.name);
                            panel.webview.postMessage({ command: message.command, payload: tabletranslation });
                            break;
                        case 'page':
                            const pageTranslation = getPageTranslations(xliffFile.content, message.payload.name);
                            panel.webview.postMessage({ command: message.command, payload: pageTranslation });
                            break;
                        case 'codeunit':
                            const codeunitTranslations = getCodeunitTranslations(xliffFile.content, message.payload.name);
                            panel.webview.postMessage({ command: message.command, payload: codeunitTranslations });
                            break;
                        case 'pageextension':
                            const pageExtensionTranslations = getPageExtensionTranslations(xliffFile.content, message.payload.name);
                            panel.webview.postMessage({ command: message.command, payload: pageExtensionTranslations });
                            break;
                        case 'tableextension':
                            const tableExtensionTranslations = getTableExtensionTranslations(xliffFile.content, message.payload.name);
                            panel.webview.postMessage({ command: message.command, payload: tableExtensionTranslations });
                            break;
                        case 'enum':
                            const enumTranslations = getEnumTranslations(xliffFile.content, message.payload.name);
                            panel.webview.postMessage({command: message.command, payload: enumTranslations});
                    }
                }
                break;
            case 'translate_unit':
                if (message.payload.xliffId && message.payload.target !== undefined) {
                    saveTranslation(message.payload.xliffId, message.payload.target, xliffFile.content, xliffFile.fsPath, message.payload.isPromotedActionCategories, message.payload.promotedActionCategoryIndex);
                }
                break;
        }
    };
};

const getWebViewTemplate = (context: vscode.ExtensionContext) => {
    const reactAppPathOnDisk = vscode.Uri.file(
        path.join(context.extensionPath, "appView", "appView.js")
    );
    const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Config View</title>

        <meta http-equiv="Content-Security-Policy"
              content="default-src 'none';
                      img-src https:;
                      script-src 'unsafe-eval' 'unsafe-inline' vscode-resource:;
                      style-src vscode-resource: 'unsafe-inline';">

        <script>
          window.acquireVsCodeApi = acquireVsCodeApi;
        </script>
    </head>
    <body>
        <div id="root"></div>

        <script src="${reactAppUri}"></script>
    </body>
    </html>`;
};




const getSpecificALObject = async (id: number, type: IALObjectType, xliffDocument: XLIFFDocument): Promise<IALObject | undefined> =>
    (await parseWorkspace(xliffDocument)).find(x => x.type === type && x.id === id);


