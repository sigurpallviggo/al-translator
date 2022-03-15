/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { TranslationTable } from '../components/translation-table';
import { ALObjectHeader } from '../components/al-object-header';
import '../styles/translation.scss';
import { ITranslationView, ITranslationSection } from '../@types/components';
import { IALObject } from '../@types/al';
import { useParams } from 'react-router-dom';
import { IWebViewMessage } from '../@types/messages';

export const TranslationView: ITranslationView = ({ vscode }) => {
    const [sections, setSections] = React.useState<ITranslationSection[]>([]);
    const [alObject, setAlObject] = React.useState<IALObject>();
    const {id, objectType} = useParams<'id'|'objectType'>();

    React.useEffect(() => {
        window.addEventListener('message', (ev: MessageEvent<IWebViewMessage>) => {
            if (ev.data.command === 'al_object_id') {
                setAlObject(ev.data.payload);
            } else if (ev.data.command === 'al_object_translation') {
                setSections(ev.data.payload);
            }
        });
        return () => {
            window.removeEventListener('message', () => { });
        };
    }, []);

    React.useEffect(() => {
        if (id && objectType) {
            vscode.postMessage({ command: 'al_object_id', payload: { type: objectType, id: parseInt(id) } });
        }
    }, [id, objectType]);

    React.useEffect(() => {
        if (alObject) {
            vscode.postMessage({ command: 'al_object_translation', payload: { type: objectType, name: alObject.name } });
        }
    }, [alObject]);


    return (
        <div className="translate table">
            {(alObject) ? <ALObjectHeader alObject={alObject} /> : null}
            <div className="translations">
                {sections.map((section) => <TranslationTable key={section.name} name={section.name} translations={section.transUnits} vscode={vscode} />)}
            </div>
        </div>
    );
};