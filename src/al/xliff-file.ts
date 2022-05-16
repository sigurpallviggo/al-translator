import * as vscode from 'vscode';
import * as fs from 'fs';
import * as xmlParser from 'xml2js';
import { TransUnit, TransUnitElement, XLIFFDocument } from '../view/app/@types/xliff-file';
import { ITranslateCodeunit, ITranslateEnum, ITranslateLabel, ITranslatePage, ITranslatePageActionPromotedCategories, ITranslatePageExtension, ITranslateTable, ITranslateTableExtension, ITranslateTableField, ITranslation } from '../view/app/@types/translate';
import { IALObjectType } from '../view/app/@types/al';
import { ITranslationSection } from '../view/app/@types/components';

export const getPercentageTranslated = (type: IALObjectType, name: string, xliffDocument: XLIFFDocument): number => {
    const transUnits = xliffDocument.xliff.file[0].body[0].group[0]['trans-unit'];
    const xliffId = getObjectXliffId(type, transUnits, name);
    if (!xliffId) {
        return 100;
    }
    const pattern = new RegExp(`${type} ${xliffId} - .*`, 'i');
    const objectUnits = transUnits.filter(x => pattern.exec(x.$.id));
    if (objectUnits.length === 0) {
        return 100;
    }
    const translated = objectUnits.filter(x => getTargetString(x) !== '');
    return Math.floor(translated.length / objectUnits.length * 100);

};

export const findXliffFileFromLanguageAndExtensionName = async (extensionName: string, language: string): Promise<{ fsPath: string, content: XLIFFDocument }> => {
    const xliffFiles = await vscode.workspace.findFiles('**/*.xlf');
    console.log(language);
    console.log(xliffFiles);
    for (let i = 0; i < xliffFiles.length; i++) {
        const content = fs.readFileSync(xliffFiles[i].fsPath, { encoding: 'utf8' });
        const xlf: XLIFFDocument = await xmlParser.parseStringPromise(content, {});
        if (xlf.xliff.file[0].$['target-language'] === language && xlf.xliff.file[0].$.original.toLocaleLowerCase().replace('.g.xlf', '') === extensionName.toLocaleLowerCase()) {
            console.log(xliffFiles[i].fsPath);
            return { fsPath: xliffFiles[i].fsPath, content: xlf };
        }
    }
    throw new Error(`Translation file for extension: ${extensionName} and language: ${language} was not found`);
};

export const getTableTranslations = (xliff: XLIFFDocument, tableName: string) : ITranslationSection[] => {
    const transUnits = xliff.xliff.file[0].body[0].group[0]['trans-unit'];
    const tableXId = getObjectXliffId('table', transUnits, tableName);
    if (!tableXId) {
        return[];
    }
    const tableTransUnit = getTranslateTableUnit(tableName, tableXId, transUnits);
    const sections: ITranslationSection[] = [];
    if (tableTransUnit.xliffId) {
        sections.push({ name: 'Table Caption', transUnits: [{ ...tableTransUnit }] });
    }
    if (tableTransUnit.fields.length > 0) {
        sections.push({ name: 'Fields', transUnits: tableTransUnit.fields });
    }
    if (tableTransUnit.labels.length > 0) {
        sections.push({ name: 'Labels', transUnits: tableTransUnit.fields });
    }
    return sections;
};

export const getPageTranslations = (xliff: XLIFFDocument, pageName: string) : ITranslationSection[] => {
    const transUnits = xliff.xliff.file[0].body[0].group[0]['trans-unit'];
    const pageId = getObjectXliffId('page', transUnits, pageName);
    if (!pageId) {
        return[];
    }
    const translationObject = getTranslatePageUnit(pageName, pageId, transUnits);
    const sections: ITranslationSection[] = [];
    if (translationObject.xliffId) {
        sections.push({ name: 'Page Caption', transUnits: [{ ...translationObject }] });
    }
    if (translationObject.controls.length > 0) {
        sections.push({ name: 'controls', transUnits: translationObject.controls });
    }
    if (translationObject.actions.length > 0) {
        sections.push({ name: 'Actions', transUnits: translationObject.actions });
    }
    if (translationObject.promotedActionCategories) {
        const promotedCategories = translationObject.promotedActionCategories;
        const transUnits : ITranslation[] = [];

        for (var i = 0; i < promotedCategories.sources.length; i++) {
            transUnits.push({xliffId: promotedCategories.xliffId, name: 'Promoted Action Category', source: promotedCategories.sources[i], target: (promotedCategories.targets)? promotedCategories.targets[i] : undefined, isPromotedActionCategories: true, promotedActionCategoryIndex: i});
        }
        sections.push({ name: 'Promoted Action Categories', transUnits});
    }
    if (translationObject.labels.length > 0) {
        sections.push({ name: 'Labels', transUnits: translationObject.labels });
    }
    return sections;
};

export const getCodeunitTranslations = (xliff: XLIFFDocument, codeunitName: string) : ITranslationSection[] => {
    const transUnits = xliff.xliff.file[0].body[0].group[0]['trans-unit'];
    const codeunitId = getObjectXliffId('codeunit', transUnits, codeunitName);
    if (!codeunitId) {
        return[];
    }
    const translationObject = getTranslateCodeunitUnit(codeunitName, codeunitId, transUnits);
    const sections: ITranslationSection[] = [];
    if (translationObject.labels.length > 0) {
        sections.push({name: 'Labels', transUnits: translationObject.labels});    
    }
    return sections;
};

export const getPageExtensionTranslations = (xliff: XLIFFDocument, pageExtensionName: string) : ITranslationSection[] => {
    const transUnits = xliff.xliff.file[0].body[0].group[0]['trans-unit'];
    const pageExtensionId = getObjectXliffId('pageextension', transUnits, pageExtensionName);
    if (!pageExtensionId) {
        return[];
    }
    const translationObject = getTranslatePageExtensionUnit(pageExtensionName, pageExtensionId, transUnits);
    const sections: ITranslationSection[] = [];
    if (translationObject.controls.length > 0) {
        sections.push({ name: 'Controls', transUnits: translationObject.controls });
    }
    if (translationObject.actions.length > 0) {
        sections.push({ name: 'Actions', transUnits: translationObject.actions });
    }
    if (translationObject.promotedActionCategories) {
        sections.push({ name: 'Promoted Action Categories', transUnits: [] });
    }
    if (translationObject.labels.length > 0) {
        sections.push({ name: 'Labels', transUnits: translationObject.labels });
    }
    if (translationObject.promotedActionCategories) {
        const promotedCategories = translationObject.promotedActionCategories;
        const transUnits : ITranslation[] = [];

        for (var i = 0; i < promotedCategories.sources.length; i++) {
            transUnits.push({xliffId: promotedCategories.xliffId, name: 'Promoted Action Category', source: promotedCategories.sources[i], target: (promotedCategories.targets)? promotedCategories.targets[i] : undefined, isPromotedActionCategories: true, promotedActionCategoryIndex: i});
        }
        sections.push({ name: 'Promoted Action Categories', transUnits});
    }
    return sections;
};

export const getTableExtensionTranslations = (xliff: XLIFFDocument, tableExtensionName: string) : ITranslationSection[] => {
    const transUnits = xliff.xliff.file[0].body[0].group[0]['trans-unit'];
    const tableExtensionId = getObjectXliffId('tableextension', transUnits, tableExtensionName);
    if (!tableExtensionId) {
        return[];
    }
    const translationObject = getTranslateTableExtensionUnit(tableExtensionName, tableExtensionId, transUnits);
    const sections : ITranslationSection[] = [];
    if (translationObject.fields.length > 0) {
        sections.push({name: 'Fields', transUnits: translationObject.fields});
    }
    if (translationObject.labels.length > 0) {
        sections.push({name: 'Labels', transUnits: translationObject.labels});
    }
    return sections;
};

export const getEnumTranslations = (xliff: XLIFFDocument, enumName: string) => {
    const transUnits = xliff.xliff.file[0].body[0].group[0]['trans-unit'];
    const enumId = getObjectXliffId('enum', transUnits, enumName);
    if (!enumId) {
        return[];
    }
    const translationObject = getTranslateEnumUnit(enumName, enumId, transUnits);
    const sections: ITranslationSection[] = [];
    if (translationObject.values.length > 0) {
        sections.push({ name: 'Values', transUnits: translationObject.values });
    }
    return sections;
};

export const getObjectXliffId = (type: IALObjectType, transUnits: TransUnitElement[], objectName: string): number | null => {
    const pattern = new RegExp(`^${type} ${objectName}(?= -)`, 'i');
    const idPattern = new RegExp(`(?<=${type}\\s)\\d+`, 'i');
    for (let i = 0; i < transUnits.length; i++) {
        const transUnit = transUnits[i];
        for (let x = 0; x < transUnit.note.length; x++) {
            const note = transUnit.note[x];
            if (note.$.from === 'Xliff Generator') {
                if (note._) {
                    const match = pattern.exec(note._);
                    if (match) {
                        const idMatch = idPattern.exec(transUnit.$.id);
                        if (idMatch) {
                            return parseInt(idMatch[0]);
                        }
                    }
                }
            }
        }
    }
    return null;
};

const getTranslateTableUnit = (tableName: string, tableId: number, transUnits: TransUnitElement[]) => {
    const pattern = new RegExp(`Table ${tableId}`);
    const tableTransUnits = transUnits.filter(x => pattern.exec(x.$.id));
    return parseTableTransUnits(tableName, tableId, tableTransUnits);
};

const getTranslatePageUnit = (pageName: string, pageId: number, transUnits: TransUnitElement[]) => {
    const pattern = new RegExp(`Page ${pageId}`);
    const pageTransUnits = transUnits.filter(x => pattern.exec(x.$.id));
    return parsePageTransUnits(pageName, pageId, pageTransUnits);
};

const getTranslateCodeunitUnit = (codeunitName: string, codeunitId: number, transUnits: TransUnitElement[]) => {
    const pattern = new RegExp(`Codeunit ${codeunitId}`);
    const codeunitTransUnits = transUnits.filter(x => pattern.exec(x.$.id));
    return parseCodeunitTransUnits(codeunitName, codeunitId, codeunitTransUnits);
};

const getTranslatePageExtensionUnit = (pageExtensionName: string, pageExtensionId: number, transUnits: TransUnitElement[]) => {
    const pattern = new RegExp(`PageExtension ${pageExtensionId}`);
    const pageExtensionTransUnits = transUnits.filter(x => pattern.exec(x.$.id));
    return parsePageExtensionTransUnits(pageExtensionName, pageExtensionId, pageExtensionTransUnits);
};

const getTranslateTableExtensionUnit = (tableExtensionName: string, tableExtensionId: number, transUnits: TransUnitElement[]) => {
    const pattern = new RegExp(`TableExtension ${tableExtensionId}`);
    const tableExtensionTransUnits = transUnits.filter(x => pattern.exec(x.$.id));
    return parseTableExtensionTransUnits(tableExtensionName, tableExtensionId, tableExtensionTransUnits);
};

const getTranslateEnumUnit = (enumName: string, enumId: number, transUnits: TransUnitElement[]) => {
    const pattern = new RegExp(`Enum ${enumId}`);
    const enumTransUnits = transUnits.filter(x => pattern.exec(x.$.id));
    return parseEnumTransUnits(enumName, enumId, enumTransUnits);
};

const parseTableTransUnits = (tableName: string, tableId: number, tableTransUnits: TransUnitElement[]): ITranslateTable => {
    const labels: ITranslateLabel[] = [];
    const fields: ITranslateTableField[] = [];
    const name = tableName;
    const id = tableId;
    let xliffId = '';
    let source = '';
    let target = '';

    for (var i = 0; i < tableTransUnits.length; i++) {
        const transUnit = tableTransUnits[i];
        if (isObjectCaption('Table', tableId, transUnit)) {
            xliffId = transUnit.$.id;
            source = transUnit.source[0];
            target = getTargetString(transUnit);
        } else if (isTableFieldCaption(tableId, transUnit)) {
            const tableFieldInfo = getTableFieldInfo(transUnit);
            if (tableFieldInfo) {
                fields.push({
                    xliffId: transUnit.$.id,
                    id: tableFieldInfo.id,
                    name: tableFieldInfo.name,
                    source: transUnit.source[0],
                    target: getTargetString(transUnit)
                });
            }
        } else if (isLabel('Table', tableId, transUnit)) {
            const labelInfo = getLabelInfo('Table', transUnit);
            if (labelInfo) {
                labels.push({
                    xliffId: transUnit.$.id,
                    id: labelInfo.id,
                    name: labelInfo.name,
                    source: transUnit.source[0],
                    target: getTargetString(transUnit)
                });
            }
        }
    }
    return {
        xliffId,
        id,
        name,
        source,
        target,
        fields,
        labels
    };
};

const parseTableExtensionTransUnits = (tableName: string, tableId: number, tableTransUnits: TransUnitElement[]): ITranslateTableExtension => {
    const labels: ITranslateLabel[] = [];
    const fields: ITranslateTableField[] = [];
    const name = tableName;
    const id = tableId;

    for (var i = 0; i < tableTransUnits.length; i++) {
        const transUnit = tableTransUnits[i];
        if (isTableExtensionFieldCaption(tableId, transUnit)) {
            const tableFieldInfo = getTableFieldInfo(transUnit);
            if (tableFieldInfo) {
                fields.push({
                    xliffId: transUnit.$.id,
                    id: tableFieldInfo.id,
                    name: tableFieldInfo.name,
                    source: transUnit.source[0],
                    target: getTargetString(transUnit)
                });
            }
        } else if (isLabel('TableExtension', tableId, transUnit)) {
            const labelInfo = getLabelInfo('TableExtension', transUnit);
            if (labelInfo) {
                labels.push({
                    xliffId: transUnit.$.id,
                    id: labelInfo.id,
                    name: labelInfo.name,
                    source: transUnit.source[0],
                    target: getTargetString(transUnit)
                });
            }
        }
    }
    return {
        id,
        name,
        fields,
        labels
    };
};

const parsePageTransUnits = (pageName: string, pageId: number, pageTransUnits: TransUnitElement[]): ITranslatePage => {
    const name = pageName;
    const id = pageId;
    const labels: ITranslateLabel[] = [];
    const actions: ITranslateTableField[] = [];
    const controls: ITranslateTableField[] = [];
    let promotedActionCategories: ITranslatePageActionPromotedCategories | null = null;
    let xliffId = '';
    let source = '';
    let target = '';

    for (var i = 0; i < pageTransUnits.length; i++) {
        const transUnit = pageTransUnits[i];
        if (isObjectCaption('Page', pageId, transUnit)) {
            xliffId = transUnit.$.id;
            source = transUnit.source[0];
            target = getTargetString(transUnit);
        } else if (isPageControl(pageId, transUnit)) {
            const pageControlInfo = getPageControlInfo(transUnit);
            if (pageControlInfo) {
                controls.push({
                    xliffId: transUnit.$.id,
                    id: pageControlInfo.id,
                    name: pageControlInfo.name,
                    source: transUnit.source[0],
                    target: getTargetString(transUnit)
                });
            }
        } else if (isLabel('Page', pageId, transUnit)) {
            const labelInfo = getLabelInfo('Page', transUnit);
            if (labelInfo) {
                labels.push({
                    xliffId: transUnit.$.id,
                    id: labelInfo.id,
                    name: labelInfo.name,
                    source: transUnit.source[0],
                    target: getTargetString(transUnit)
                });
            }
        } else if (isPageAction(pageId, transUnit)) {
            const actionInfo = getPageActionInfo(transUnit);
            console.log(transUnit);
            console.log(actionInfo);
            if (actionInfo) {
                actions.push({
                    xliffId: transUnit.$.id,
                    id: actionInfo.id,
                    name: actionInfo.name,
                    source: transUnit.source[0],
                    target: getTargetString(transUnit)
                });
            }
        } else if (isPromotedActionCategories(pageId, transUnit)) {
            const sources = transUnit.source[0].split(',');
            const targets = getTargetString(transUnit).split(',');
            promotedActionCategories = {
                xliffId: transUnit.$.id,
                sources,
                targets
            };
        }
    }
    return {
        xliffId,
        id,
        name,
        source,
        target,
        actions,
        controls,
        labels,
        promotedActionCategories: (promotedActionCategories) ? promotedActionCategories : undefined
    };

};

const parsePageExtensionTransUnits = (pageExtensionName: string, pageExtensionId: number, pageExtensionTransUnits: TransUnitElement[]): ITranslatePageExtension => {
    const name = pageExtensionName;
    const id = pageExtensionId;
    const labels: ITranslateLabel[] = [];
    const actions: ITranslateTableField[] = [];
    const controls: ITranslateTableField[] = [];
    let promotedActionCategories: ITranslatePageActionPromotedCategories | null = null;
    for (var i = 0; i < pageExtensionTransUnits.length; i++) {
        const transUnit = pageExtensionTransUnits[i];
        if (isPageExtensionControl(pageExtensionId, transUnit)) {
            const pageControlInfo = getPageControlInfo(transUnit);
            if (pageControlInfo) {
                controls.push({
                    xliffId: transUnit.$.id,
                    id: pageControlInfo.id,
                    name: pageControlInfo.name,
                    source: transUnit.source[0],
                    target: getTargetString(transUnit)
                });
            }
        } else if (isLabel('PageExtension', pageExtensionId, transUnit)) {
            const labelInfo = getLabelInfo('PageExtension', transUnit);
            if (labelInfo) {
                labels.push({
                    xliffId: transUnit.$.id,
                    id: labelInfo.id,
                    name: labelInfo.name,
                    source: transUnit.source[0],
                    target: getTargetString(transUnit)
                });
            }
        } else if (isPageExtensionAction(pageExtensionId, transUnit)) {
            const actionInfo = getPageExtensionActionInfo(transUnit);
            if (actionInfo) {
                actions.push({
                    xliffId: transUnit.$.id,
                    id: actionInfo.id,
                    name: actionInfo.name,
                    source: transUnit.source[0],
                    target: getTargetString(transUnit)
                });
            }
        } else if (isPromotedActionCategories(pageExtensionId, transUnit)) {
            const sources = transUnit.source[0].split(',');
            const targets = getTargetString(transUnit).split(',');
            promotedActionCategories = {
                xliffId: transUnit.$.id,
                sources,
                targets
            };
        }
    }
    return {
        id,
        name,
        actions,
        controls,
        labels,
        promotedActionCategories: (promotedActionCategories) ? promotedActionCategories : undefined
    };

};

const parseCodeunitTransUnits = (codeunitName: string, codeunitId: number, codeunitTransUnits: TransUnitElement[]): ITranslateCodeunit => {
    const name = codeunitName;
    const id = codeunitId;
    const labels: ITranslateLabel[] = [];
    for (var i = 0; i < codeunitTransUnits.length; i++) {
        const transUnit = codeunitTransUnits[i];
        if (isLabel('Codeunit', codeunitId, transUnit)) {
            const labelInfo = getLabelInfo('Codeunit', transUnit);
            if (labelInfo) {
                labels.push({ id: labelInfo.id, name: labelInfo.name, source: transUnit.source[0], target: getTargetString(transUnit), xliffId: transUnit.$.id });
            }
        }
    }
    return {
        name,
        id,
        labels
    };
};

const parseEnumTransUnits = (enumName: string, enumId: number, enumTransUnits: TransUnitElement[]): ITranslateEnum => {
    const name = enumName;
    const id = enumId;
    const enumValues: ITranslateTableField[] = [];
    for (var i = 0; i < enumTransUnits.length; i++) {
        const transUnit = enumTransUnits[i];
        if (isEnumValue(enumId, transUnit)) {
            const enumValueInfo = getEnumValueInfo(transUnit);
            if (enumValueInfo) {
                enumValues.push({ xliffId: transUnit.$.id, id: enumValueInfo.id, name: enumValueInfo.name, source: transUnit.source[0], target: getTargetString(transUnit) });
            }
        }
    }
    return {
        name,
        id,
        values: enumValues
    }
};

const getTargetString = (transUnit: TransUnitElement): string => {
    if (!transUnit.target) {
        return '';
    }
    if (typeof transUnit.target[0] === 'object') {
        return '';
    }
    return transUnit.target[0];
};

const isObjectCaption = (type: 'Table' | 'Page' | 'Report', id: number, transUnit: TransUnitElement): boolean => {
    const pattern = new RegExp(`${type} ${id} - Property 2879900210`);
    if (pattern.exec(transUnit.$.id)) {
        return true;
    }
    return false;
};

const isTableFieldCaption = (tableId: number, transUnit: TransUnitElement): boolean => {
    const pattern = new RegExp(`Table ${tableId} - Field (\\d+) - Property 2879900210`);
    if (pattern.exec(transUnit.$.id)) {
        return true;
    }
    return false;
};

const isTableExtensionFieldCaption = (tableExtensionId: number, transUnit: TransUnitElement): boolean => {
    const pattern = new RegExp(`TableExtension ${tableExtensionId} - Field (\\d+) - Property 2879900210`);
    if (pattern.exec(transUnit.$.id)) {
        return true;
    }
    return false;
};

const isLabel = (type: 'Table' | 'Page' | 'Report' | 'Codeunit' | 'PageExtension' | 'TableExtension', id: number, transUnit: TransUnitElement): boolean => {
    const pattern = new RegExp(`${type} ${id}.* - NamedType (\\d+)`);
    if (pattern.exec(transUnit.$.id)) {
        return true;
    }
    return false;
};

const isPageControl = (id: number, transUnit: TransUnitElement): boolean => {
    const pattern = new RegExp(`Page ${id} - Control (\\d+) - Property 2879900210`);
    if (pattern.exec(transUnit.$.id)) {
        return true;
    }
    return false;
};

const isPageExtensionControl = (id: number, transUnit: TransUnitElement): boolean => {
    const pattern = new RegExp(`PageExtension ${id} - Control (\\d+) - Property 2879900210`);
    if (pattern.exec(transUnit.$.id)) {
        return true;
    }
    return false;
};

//Page 2617936544 - Action \\d+ - Property 2879900210
const isPageAction = (id: number, transUnit: TransUnitElement): boolean => {
    const pattern = new RegExp(`Page ${id} - Action \\d+ - Property 2879900210`);
    if (pattern.exec(transUnit.$.id)) {
        return true;
    }
    return false;
};

const isPageExtensionAction = (id: number, transUnit: TransUnitElement): boolean => {
    const pattern = new RegExp(`PageExtension ${id} - Action \\d+ - Property 2879900210`);
    if (pattern.exec(transUnit.$.id)) {
        return true;
    }
    return false;
};

const isPromotedActionCategories = (id: number, transUnit: TransUnitElement): boolean => {
    const pattern = new RegExp(`(Page|PageExtension) ${id} - Property 2019332006`);
    if (pattern.exec(transUnit.$.id)) {
        return true;
    }
    return false;
};

const isEnumValue = (id: number, transUnit: TransUnitElement): boolean => {
    const pattern = new RegExp(`Enum ${id} - EnumValue (\\d+) - Property 2879900210`);
    if (pattern.exec(transUnit.$.id)) {
        return true;
    }
    return false;
};

const getTableFieldInfo = (transUnit: TransUnitElement): { id: number, name: string } | null => {
    const idPattern = /(?<=Field )\d+/g;
    const namePattern = /(?<=Field ).*(?= - Property Caption)/g;
    const generatorNote = transUnit.note.find(x => x.$.from === 'Xliff Generator');
    if (!generatorNote || !generatorNote._) {
        return null;
    }
    const idMatches = idPattern.exec(transUnit.$.id);
    const nameMatches = namePattern.exec(generatorNote._);
    if (!idMatches || !nameMatches) {
        return null;
    }
    return {
        id: parseInt(idMatches[0]),
        name: nameMatches[0]
    };
};

const getLabelInfo = (type: 'Table' | 'Page' | 'Report' | 'Codeunit' | 'PageExtension' | 'TableExtension', transUnit: TransUnitElement): { id: number, name: string } | null => {
    const idPattern = /(?<=NamedType )\d+/g;
    const namePattern = /(?<=NamedType ).*/g;
    const generatorNote = transUnit.note.find(x => x.$.from === 'Xliff Generator');
    if (!generatorNote || !generatorNote._) {
        return null;
    }
    const idMatches = idPattern.exec(transUnit.$.id);
    const nameMatches = namePattern.exec(generatorNote._);
    if (!idMatches || !nameMatches) {
        return null;
    }
    return {
        id: parseInt(idMatches[0]),
        name: nameMatches[0]
    };
};

const getPageControlInfo = (transUnit: TransUnitElement): { id: number, name: string } | null => {
    const idPattern = /(?<=Page \d+ - Control )\d+(?= - Property 2879900210)/g;
    const namePattern = /(?<=- Control ).*(?= - Property Caption)/g;
    const generatorNote = transUnit.note.find(x => x.$.from === 'Xliff Generator');
    if (!generatorNote || !generatorNote._) {
        return null;
    };
    const idMatches = idPattern.exec(transUnit.$.id);
    const nameMatches = namePattern.exec(generatorNote._);
    if (!idMatches || !nameMatches) {
        return null;
    }
    return {
        id: parseInt(idMatches[0]),
        name: nameMatches[0]
    };
};

const getPageActionInfo = (transUnit: TransUnitElement): { id: number, name: string } | null => {
    const idPattern = /(?<=Page (\d+) - Action )\d+(?= - Property 2879900210)/g;
    const namePattern = /(?<=- Action ).*(?= - Property Caption)/g;
    const generatorNote = transUnit.note.find(x => x.$.from === 'Xliff Generator');
    if (!generatorNote || !generatorNote._) {
        return null;
    };
    const idMatches = idPattern.exec(transUnit.$.id);
    const nameMatches = namePattern.exec(generatorNote._);
    if (!idMatches || !nameMatches) {
        return null;
    }
    return {
        id: parseInt(idMatches[0]),
        name: nameMatches[0]
    };
};

const getPageExtensionActionInfo = (transUnit: TransUnitElement): { id: number, name: string } | null => {
    const idPattern = /(?<=PageExtension (\d+) - Action )\d+(?= - Property 2879900210)/g;
    const namePattern = /(?<=- Action ).*(?= - Property Caption)/g;
    const generatorNote = transUnit.note.find(x => x.$.from === 'Xliff Generator');
    if (!generatorNote || !generatorNote._) {
        return null;
    };
    const idMatches = idPattern.exec(transUnit.$.id);
    const nameMatches = namePattern.exec(generatorNote._);
    if (!idMatches || !nameMatches) {
        return null;
    }
    return {
        id: parseInt(idMatches[0]),
        name: nameMatches[0]
    };
};

const getEnumValueInfo = (transUnit: TransUnitElement): { id: number, name: string } | null => {
    const idPattern = /(?<=Enum \d+ - EnumValue )\d+(?= - Property 2879900210)/g;
    const namePattern = /(?<=- EnumValue ).*(?= - Property Caption)/g;
    const generatorNote = transUnit.note.find(x => x.$.from === 'Xliff Generator');
    if (!generatorNote || !generatorNote._) {
        return null;
    };
    const idMatches = idPattern.exec(transUnit.$.id);
    const nameMatches = namePattern.exec(generatorNote._);
    if (!idMatches || !nameMatches) {
        return null;
    }
    return {
        id: parseInt(idMatches[0]),
        name: nameMatches[0]
    };
};

