/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { IALObject } from '../@types/al';
import { IWebViewMessage } from '../@types/messages';
import { IVSCodeAPI } from '../@types/system';
import { useParams } from 'react-router-dom';
import { ITranslatePageExtension } from '../@types/translate';
import '../styles/translation.scss';
import { ITranslationSection } from '../@types/components';
import { TranslationView } from '../components/translation.view';

export const TranslatePageExtensionView: React.FC<{ vscode: IVSCodeAPI }> = ({ vscode }) => {
    const [alObject, setAlObject] = React.useState<IALObject>();
    const [translationSections, setTranslationSections] = React.useState<ITranslationSection[]>([]);
    const { id } = useParams<'id'>();


    React.useEffect(() => {
        window.addEventListener('message', (ev: MessageEvent<IWebViewMessage>) => {
            if (ev.data.command === 'al_object_id') {
                setAlObject(ev.data.payload);
            } else if (ev.data.command === 'al_object_translation') {
                const translationObject: ITranslatePageExtension = ev.data.payload;
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
                setTranslationSections(sections);
            }
        });
        return () => {
            window.removeEventListener('message', () => { });
        };
    }, []);

    React.useEffect(() => {
        vscode.postMessage({ command: 'al_object_id', payload: { type: 'pageextension', id: parseInt(id) } });
    }, [id]);

    React.useEffect(() => {
        if (alObject) {
            vscode.postMessage({ command: 'al_object_translation', payload: { type: 'pageextension', name: alObject.name } });
        }
    }, [alObject]);

    if (!alObject) {
        return null;
    }

    return (
        <TranslationView vscode={vscode} alObject={alObject} sections={translationSections} />
    );
};