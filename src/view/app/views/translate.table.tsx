/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { IALObject } from '../@types/al';
import { IWebViewMessage } from '../@types/messages';
import { IVSCodeAPI } from '../@types/system';
import { useParams } from 'react-router-dom';
import { ITranslateTable } from '../@types/translate';
import '../styles/translation.scss';
import { ITranslationSection } from '../@types/components';
import { TranslationView } from '../components/translation.view';

export const TranslateTableView: React.FC<{ vscode: IVSCodeAPI }> = ({ vscode }) => {
    const [alObject, setAlObject] = React.useState<IALObject>();
    const [translationSections, setTranslationSections] = React.useState<ITranslationSection[]>([]);
    const { id } = useParams<'id'>();


    React.useEffect(() => {
        window.addEventListener('message', (ev: MessageEvent<IWebViewMessage>) => {
            if (ev.data.command === 'al_object_id') {
                setAlObject(ev.data.payload);
            } else if (ev.data.command === 'al_object_translation') {
                const translationObject: ITranslateTable = ev.data.payload;
                const sections: ITranslationSection[] = [];
                if (translationObject.xliffId) {
                    sections.push({ name: 'Table Caption', transUnits: [{ ...translationObject }] });
                }
                if (translationObject.fields.length > 0) {
                    sections.push({name: 'Fields', transUnits: translationObject.fields});
                }
                if (translationObject.labels.length > 0) {
                    sections.push({name: 'Labels', transUnits: translationObject.labels});
                }
                setTranslationSections(sections);
            }
        });
        return () => {
            window.removeEventListener('message', () => { });
        };
    }, []);

    React.useEffect(() => {
        vscode.postMessage({ command: 'al_object_id', payload: { type: 'table', id: parseInt(id) } });
    }, [id]);

    React.useEffect(() => {
        if (alObject) {
            vscode.postMessage({ command: 'al_object_translation', payload: { type: 'table', name: alObject.name } });
        }
    }, [alObject]);

    if(!alObject) {
        return null;
    }

    return (
        <TranslationView vscode={vscode} alObject={alObject} sections={translationSections} />
    );
};