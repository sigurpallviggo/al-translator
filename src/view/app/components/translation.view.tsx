/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { TranslationTable } from '../components/translation-table';
import { ALObjectHeader } from '../components/al-object-header';
import '../styles/translation.scss';
import { ITranslationView } from '../@types/components';

export const TranslationView: ITranslationView = ({ vscode, sections, alObject }) => {
    return (
        <div className="translate table">
            {(alObject) ? <ALObjectHeader alObject={alObject} /> : null}
            <div className="translations">
                {sections.map((section) => <TranslationTable key={section.name} name={section.name} translations={section.transUnits} vscode={vscode} />)}
            </div>
        </div>
    );
};