/* eslint-disable @typescript-eslint/naming-convention */
// Generated by https://quicktype.io

export interface XLIFFDocument {
    xliff: Xliff;
}

export interface Xliff {
    $:    XliffClass;
    file: FileElement[];
}

export interface XliffClass {
    version:              string;
    xmlns:                string;
    "xmlns:xsi":          string;
    "xsi:schemaLocation": string;
}

export interface FileElement {
    $:    File;
    body: Body[];
}

export interface File {
    datatype:          string;
    "source-language": string;
    "target-language": string;
    original:          string;
}

export interface Body {
    group: GroupElement[];
}

export interface GroupElement {
    $:            Group;
    "trans-unit": TransUnitElement[];
}

export interface Group {
    id: string;
}

export interface TransUnitElement {
    $:      TransUnit;
    source: string[];
    target?: Array<TargetClass | string>;
    note:   NoteElement[];
}

export interface TransUnit {
    id:                  string;
    "size-unit":         SizeUnit;
    translate:           Translate;
    "xml:space":         XMLSpace;
    "al-object-target"?: string;
}

export enum SizeUnit {
    Char = "char",
}

export enum Translate {
    Yes = "yes",
}

export enum XMLSpace {
    Preserve = "preserve",
}

export interface NoteElement {
    $:  Note;
    _?: string;
}

export interface Note {
    from:      From;
    annotates: Annotates;
    priority:  string;
}

export enum Annotates {
    General = "general",
}

export enum From {
    Developer = "Developer",
    XliffGenerator = "Xliff Generator",
}

export interface TargetClass {
    $: Target;
}

export interface Target {
    state: State;
}

export enum State {
    NeedsTranslation = "needs-translation",
}