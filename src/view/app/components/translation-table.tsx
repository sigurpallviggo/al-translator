/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { IVSCodeAPI } from '../@types/system';
import { ITranslation } from '../@types/translate';

export const TranslationTable: React.FC<{ name: string, translations: ITranslation[], vscode: IVSCodeAPI, textarea?: boolean }> = ({ name, translations, vscode, textarea }) => {
    return (
        <div className="translation-table">
            <h3 className="name">{name}</h3>
            <table>
                <thead>
                    <tr>
                        <th className='name'>Name</th>
                        <th className='source'>Source</th>
                        <th className='target'>Target</th>
                    </tr>
                </thead>
                <tbody>
                    {translations.map(translation => <TranslationTableRow translation={translation} vscode={vscode} textarea={textarea} />)}
                </tbody>
            </table>
        </div>
    );
};

const TranslationTableRow: React.FC<{ translation: ITranslation, vscode: IVSCodeAPI, textarea?: boolean }> = ({ translation, vscode, textarea }) => {
    const [newTarget, setNewTarget] = React.useState<string>('');

    React.useEffect(() => {
        if (translation.target) {
            setNewTarget(translation.target);
        }
    }, [translation.target]);


    const onInputBlur = React.useCallback(() => {
        if (newTarget !== translation.target) {
            vscode.postMessage({ command: 'translate_unit', payload: { xliffId: translation.xliffId, target: newTarget } });
        }
    }, [newTarget, vscode]);

    return (
        <tr>
            <td className='name'>{translation.name}</td>
            <td className='source'>{translation.source}</td>
            <td className='target'>
                {(textarea) ? 
                    <textarea value={newTarget} onBlur={(ev) => onInputBlur()} onChange={(ev) => setNewTarget(ev.target.value)} name={translation.source} id={translation.xliffId}> </textarea> :
                    <input type="text" value={newTarget} onBlur={(ev) => onInputBlur()} onChange={(ev) => setNewTarget(ev.target.value)} name={translation.source} id={translation.xliffId} />}
            </td>
        </tr>
    );
};