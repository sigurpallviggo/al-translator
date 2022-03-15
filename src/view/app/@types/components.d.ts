import * as React from 'react';
import { IVSCodeAPI } from '../@types/system';
import { IALObject, IALObjectType } from './al';
import { ITranslation } from './translate';


export interface ITranslationSection {
    name: string;
    transUnits: ITranslation[];
}

export type ITranslationView = React.FC<{ vscode: IVSCodeAPI }>;