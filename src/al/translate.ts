import { XLIFFDocument } from "../view/app/@types/xliff-file";
import { Builder } from 'xml2js';
import * as fs from 'fs';

export const saveTranslation = (xliffId: string, target: string, xliffFile: XLIFFDocument, xliffFilePath: string, isPromotedActionCategories?: boolean, promotedActionCategoryIndex?: number) => {
    const transUnits = xliffFile.xliff.file[0].body[0].group[0]["trans-unit"];
    const translationUnit = transUnits.find(x => x.$.id === xliffId);
    if (!translationUnit) {
        return;
    };
    if (translationUnit.target && translationUnit.target[0] !== undefined) {
        if (isPromotedActionCategories === true && promotedActionCategoryIndex !== undefined) {
            if (translationUnit.target[0].toString() === '') {
                const sourceSplit = translationUnit.source[0].split(',');
                const newTarget = sourceSplit.map((cat) => '');
                console.log(newTarget);
                newTarget[promotedActionCategoryIndex] = target;
                console.log(newTarget);
                translationUnit.target = [];
                translationUnit.target.push(newTarget.join(','));
            } else {
                const targetSplit = translationUnit.target[0].toString().split(',');
                targetSplit[promotedActionCategoryIndex] = target;
                translationUnit.target[0] = targetSplit.join(',');
            }
        } else {
            translationUnit.target[0] = target;
        }
    } else {
        if (isPromotedActionCategories === true && promotedActionCategoryIndex !== undefined) {
            const sourceSplit = translationUnit.source[0].split(',');
            const newTarget = sourceSplit.map((cat) => '');
            console.log(newTarget);
            newTarget[promotedActionCategoryIndex] = target;
            console.log(newTarget);
            translationUnit.target = [];
            translationUnit.target.push(newTarget.join(','));
        } else {
            translationUnit.target = [];
            translationUnit.target.push(target);
        }

    }
    const xml = new Builder({}).buildObject(xliffFile);
    fs.writeFileSync(xliffFilePath, xml, { encoding: 'utf8' });
};