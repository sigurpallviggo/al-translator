export interface ITranslation {
    xliffId : string;
    name : string;
    source: string;
    target?: string;
}

export interface ITranslationObject {
    xliffId : string;
    id : number;
    type: ITransUnitType;
    name: string;
    source : string;
    target? : string;
    note : string;
}

export type ITransUnitType = 'TableField'|'TableLabel'|'TableCaption'|'PageCaption'|'PageControl'|'PageAction'|'PagePromotedCategories'|'PageLabel';

export interface ITranslateTable {
    xliffId: string;
    id: number;
    name: string;
    source : string;
    target? : string;
    labels: ITranslateLabel[];
    fields: ITranslateTableField[];
}

export interface ITranslateTableExtension {
    id: number;
    name: string;
    labels: ITranslateLabel[];
    fields: ITranslateTableField[];
}


export interface ITranslateCodeunit {
    id: number;
    name: string;
    labels: ITranslateLabel[];
}

export interface ITranslatePageExtension {
    id: number;
    name : string;
    labels: ITranslateLabel[];
    actions: ITranslateTableField[];
    controls: ITranslateTableField[];
    promotedActionCategories? : ITranslatePageActionPromotedCategories;
}

export interface ITranslateLabel {
    xliffId : string;
    id : number;
    name: string;
    source: string;
    target? : string;
}

export interface ITranslateTableField {
    xliffId : string;
    id : number;
    name : string;
    source : string;
    target?: string;
}

export interface ITranslatePage {
    xliffId : string;
    id: number;
    name : string;
    source : string;
    target?: string;
    labels: ITranslateLabel[];
    actions: ITranslateTableField[];
    controls: ITranslateTableField[];
    promotedActionCategories? : ITranslatePageActionPromotedCategories;
}

export interface ITranslatePageActionPromotedCategories {
    xliffId : string;
    sources: string[];
    targets?: string [];
}

export interface ITranslateEnum {
    id: number;
    name : string;
    values: ITranslateTableField[];
}