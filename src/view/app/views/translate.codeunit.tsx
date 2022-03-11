import * as React from 'react';
import { IALObject } from '../@types/al';
import { IWebViewMessage } from '../@types/messages';
import { IVSCodeAPI } from '../@types/system';
import { useParams } from 'react-router-dom';
import { ITranslateCodeunit } from '../@types/translate';
import { TranslationTable } from '../components/translation-table';
import { ALObjectHeader } from '../components/al-object-header';
import '../styles/translation.scss';

export const TranslateCodeunitView: React.FC<{ vscode: IVSCodeAPI }> = ({ vscode }) => {
    const [alObject, setAlObject] = React.useState<IALObject>();
    const [translationObject, setTranslationObject] = React.useState<ITranslateCodeunit>();
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
        vscode.postMessage({ command: 'al_object_id', payload: { type: 'codeunit', id: parseInt(id) } });
    }, [id]);

    React.useEffect(() => {
        if (alObject) {
            vscode.postMessage({ command: 'al_object_translation', payload: { type: 'codeunit', name: alObject.name } });
        }
    }, [alObject]);

    return (
        <div className="translate table">
            {(alObject) ? <ALObjectHeader alObject={alObject} /> : null}
            {(translationObject) ? <CodeunitTranslations translations={translationObject} vscode={vscode} /> : null}
        </div>
    );
};

const CodeunitTranslations: React.FC<{ translations: ITranslateCodeunit, vscode: IVSCodeAPI }> = ({ translations, vscode }) => {
    return (
        <div className="translations">
            {(translations.labels.length > 0) ? <TranslationTable name='Labels' translations={translations.labels} vscode={vscode} textarea /> : null}
        </div>
    );
};