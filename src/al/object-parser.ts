import * as vscode from 'vscode';
import * as fs from 'fs';
import { IALObject, IALObjectType } from '../view/app/@types/al';
import { XLIFFDocument } from '../view/app/@types/xliff-file';
import { getPercentageTranslated } from './xliff-file';

export const parseWorkspace = async (xliffDocument : XLIFFDocument) :Promise<IALObject[]> => {
    const alFiles = await vscode.workspace.findFiles('**/*.al');
    const alObjects : IALObject[] = [];
    for (let i = 0; i < alFiles.length; i++) {
        const alFile = alFiles[i];
        const content = fs.readFileSync(alFile.fsPath, {encoding: 'utf8'});
        const alObject = parseAlObjectText(content, xliffDocument);
        if (alObject) {
            alObjects.push(alObject);
        }
    }
    return alObjects;
};

const parseAlObjectText = (alObjectText : string, xliffDocument : XLIFFDocument) : IALObject | null => {
    alObjectText = alObjectText.trim();
    const pattern = /([a-z]+)\s([0-9]+)\s(.*)/m;
    const match = pattern.exec(alObjectText);
    if (match && match.length > 0) {
        const type = match[1] as IALObjectType;
        const id = parseInt(match[2]);
        let name = match[3].replace(/"/g, '').trim();
        let ext = '';
        if (type === 'pageextension' || type === 'tableextension') {
            const extendsPattern = /(.*) extends (.*)/gi;
            const matches = extendsPattern.exec(name);
            if (matches && matches.length >= 3) {
                name = matches[1];
                ext = matches[2];
            }
        }
        return {
            type,
            id,
            name, 
            percentageTranslated: getPercentageTranslated(type, name, xliffDocument),
            extends: ext
        };
    }
    return null;
};
