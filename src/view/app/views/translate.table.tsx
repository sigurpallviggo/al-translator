/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { IALObject } from '../@types/al';
import { IWebViewMessage } from '../@types/messages';
import { IVSCodeAPI } from '../@types/system';
import { useParams } from 'react-router-dom';
import { ITranslateTable } from '../@types/translate';
import { TranslationTable } from '../components/translation-table';
import { ALObjectHeader } from '../components/al-object-header';
import '../styles/translation.scss';

export const TranslateTableView: React.FC<{ vscode: IVSCodeAPI }> = ({ vscode }) => {
    const [alObject, setAlObject] = React.useState<IALObject>();
    const [translationObject, setTranslationObject] = React.useState<ITranslateTable>();
    const { id } = useParams<'id'>();
    

    React.useEffect(() => {
        window.addEventListener('message', (ev: MessageEvent<IWebViewMessage>) => {
            if (ev.data.command === 'al_object_id') {
                setAlObject(ev.data.payload);
            } else if (ev.data.command === 'al_object_translation') {
                setTranslationObject(ev.data.payload);
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

    React.useEffect(() => {
        if (translationObject) {
            console.log(translationObject);
        }
    }, [translationObject]);

    return (
        <div className="translate table">
            {(alObject) ? <ALObjectHeader alObject={alObject} /> : null}
            {(translationObject)? <TableTranslations translations={translationObject} vscode={vscode} /> : null}
        </div>
    );
};

const TableTranslations: React.FC<{ translations: ITranslateTable, vscode : IVSCodeAPI }> = ({ translations, vscode }) => {
    return (
        <div className="translations">
            {(translations.xliffId)? <TranslationTable name='Table Caption' translations={[{xliffId: translations.xliffId, name: translations.name, source: translations.source, target: translations.target}]} vscode={vscode} /> : null}
            {(translations.fields.length > 0)? <TranslationTable name='Fields' translations={translations.fields} vscode={vscode} /> : null}
            {(translations.labels.length > 0)? <TranslationTable name='Labels' translations={translations.labels} vscode={vscode} textarea /> : null}
        </div>
    );
};