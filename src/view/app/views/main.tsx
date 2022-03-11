/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { IALObject, IALObjectType } from '../@types/al';
import { IWebViewMessage } from '../@types/messages';
import { IVSCodeAPI } from '../@types/system';
import { Link } from 'react-router-dom';
import '../styles/object-list.scss';

export const MainView: React.FC<{ vscode: IVSCodeAPI }> = (vscode) => {
    const [alObjects, setAlObjects] = React.useState<IALObject[]>([]);
    const [selectedTypeFilter, setSelectedTypeFilter] = React.useState<IALObjectType | 'all'>('all');
    const [filteredAlObjects, setFilteredAlObjects] = React.useState<IALObject[]>([]);
    const [showExtendsField, setShowExtendsField] = React.useState(false);
    const [showObjectType, setShowObjectType] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');


    React.useEffect(() => {
        window.addEventListener('message', (ev: MessageEvent<IWebViewMessage>) => {
            if (ev.data.command === 'al_objects') {
                const payload: IALObject[] = ev.data.payload;
                setAlObjects(payload.sort((a, b) => a.id - b.id));
            }
        });
        vscode.vscode.postMessage({ command: 'al_objects', payload: null });
        return () => {
            window.removeEventListener('message', () => { });
        };
    }, []);

    React.useEffect(() => {
        if (selectedTypeFilter === 'all') {
            setShowObjectType(true);
            setShowExtendsField(true);
            setFilter(alObjects, searchValue);
            return;
        }
        const typeFilteredObjects = alObjects.filter(x => x.type === selectedTypeFilter);

        if (selectedTypeFilter === 'pageextension' || selectedTypeFilter === 'tableextension') {
            setShowExtendsField(true);
        } else {
            setShowObjectType(false);
            setShowExtendsField(false);
        }
        setFilter(typeFilteredObjects, searchValue);
        
    }, [alObjects, searchValue, selectedTypeFilter]);

    const setTypeFilter = (typeFilter: IALObjectType | 'all') => {
        setSelectedTypeFilter(typeFilter);
    };

    const setFilter = React.useCallback((filteredObs : IALObject[], searchString : string) => {
        if (!searchString) {
            setFilteredAlObjects(filteredObs);
        } else {
            setFilteredAlObjects(filteredAlObjects.filter(x => x.name.toUpperCase().startsWith(searchValue.toUpperCase())));
        }

      },[filteredAlObjects]);
    

    return (
        <div className="view main">
            <div className="al-object-list-header">
                <div className="al-object-menu">
                    <ul>
                        <li className={(selectedTypeFilter === 'all') ? 'selected' : null} onClick={() => setTypeFilter('all')}>All</li>
                        <li className={(selectedTypeFilter === 'table') ? 'selected' : null} onClick={() => setTypeFilter('table')} >Tables</li>
                        <li className={(selectedTypeFilter === 'page') ? 'selected' : null} onClick={() => setTypeFilter('page')} >Pages</li>
                        <li className={(selectedTypeFilter === 'codeunit') ? 'selected' : null} onClick={() => setTypeFilter('codeunit')} >Codeunits</li>
                        <li className={(selectedTypeFilter === 'report') ? 'selected' : null} onClick={() => setTypeFilter('report')} >Reports</li>
                        <li className={(selectedTypeFilter === 'tableextension') ? 'selected' : null} onClick={() => setTypeFilter('tableextension')} >Table Extensions</li>
                        <li className={(selectedTypeFilter === 'pageextension') ? 'selected' : null} onClick={() => setTypeFilter('pageextension')} >Page Extensions</li>
                        <li className={(selectedTypeFilter === 'enum') ? 'selected' : null} onClick={() => setTypeFilter('enum')} >Enums</li>
                    </ul>
                </div>
                <div className="search-input">
                    <input type="text" name="object-search" id="object-search" value={searchValue} onChange={(ev) => setSearchValue(ev.target.value)} />
                </div>
            </div>
            <div className="object-list">
                <table>
                        <ObjectListHeader showExtendsField={showExtendsField} showObjectType={showObjectType} />
                    <tbody>
                        {filteredAlObjects.slice().map(ob => <ObjectListItem key={ob.type + ob.id.toString()} showExtendsField={showExtendsField} showObjectType={showObjectType} alObject={ob} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ObjectListHeader: React.FC<{ showExtendsField?: boolean, showObjectType?: boolean }> = ({ showExtendsField, showObjectType }) => {
    return (
        <thead>
            <tr>
                {(showObjectType) ? <th className="object-type">Object Type</th> : null}
                <th className="id">Object Id</th>
                <th className="name">Object Name</th>
                {(showExtendsField) ? <th className="extends">Extends</th> : null}
                <th className="translated">Translated</th>
            </tr>
        </thead>
    );
};

const ObjectListItem: React.FC<{ showExtendsField?: boolean, showObjectType?: boolean, alObject: IALObject }> = ({ alObject, showObjectType, showExtendsField }) => {
    return (
        <tr>
            <td className="object-type">
                <Link to={`/${alObject.type}/${alObject.id}`}>{alObject.type}</Link>
            </td>
            <td className='id'>
                <Link to={`/${alObject.type}/${alObject.id}`}>{alObject.id}</Link>
            </td>
            <td className='name'>
                <Link to={`/${alObject.type}/${alObject.id}`}>{alObject.name}</Link>
            </td>
            {(showExtendsField) ?
                <td className='extends'>
                    <Link to={`/${alObject.type}/${alObject.id}`}>{alObject.extends}</Link>
                </td> : null}
            <td className={`translated ${(alObject.percentageTranslated < 50) ? 'critical' : (alObject.percentageTranslated < 100) ? 'warning' : ''}`}>
                <Link to={`/${alObject.type}/${alObject.id}`}>{alObject.percentageTranslated}%</Link>
            </td>
        </tr>
    );
};