import { XLIFFDocument } from "../view/app/@types/xliff-file";
import {Builder} from 'xml2js';
import * as fs from 'fs';

export const saveTranslation = (xliffId : string, target : string, xliffFile : XLIFFDocument, xliffFilePath : string) => {
    const transUnits = xliffFile.xliff.file[0].body[0].group[0]["trans-unit"];
    console.log(xliffId);
    const translationUnit = transUnits.find(x => x.$.id === xliffId);
    if (!translationUnit) {
        return;
    };
    if (translationUnit.target && translationUnit.target[0] !== undefined) {
        translationUnit.target[0] = target;
    } else {
        translationUnit.target = [];
        translationUnit.target.push(target);
    }
    
    const xml = new Builder({}).buildObject(xliffFile);
    console.log(xliffId);
    fs.writeFileSync(xliffFilePath, xml, {encoding: 'utf8'});
};