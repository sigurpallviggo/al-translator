export interface IALObject {
    type: IALObjectType;
    id: number;
    name: string;
    percentageTranslated: number;
    extends?: string;
}

export type IALObjectType = 'codeunit'|'table'|'tableextension'|'page'|'pageextension'|'report'|'xmlport'|'enum';