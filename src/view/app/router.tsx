/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import { IVSCodeAPI } from './@types/system';
import { MainView } from './views/main';
import { TranslateCodeunitView } from './views/translate.codeunit';
import { TranslateEnumView } from './views/translate.enum';
import { TranslatePageView } from './views/translate.page';
import { TranslatePageExtensionView } from './views/translate.pageextension';
import { TranslateTableView } from './views/translate.table';
import { TranslateTableExtensionView } from './views/translate.tableextension';

export const AppRouter: React.FC<{ vscode: IVSCodeAPI }> = ({ vscode }) => {
    return (
        <Routes>
            <Route path="/" element={<MainView vscode={vscode} />} />
            <Route path="/table/:id" element={<TranslateTableView vscode={vscode} />} />
            <Route path="/page/:id" element={<TranslatePageView vscode={vscode} />} />
            <Route path="/codeunit/:id" element={<TranslateCodeunitView vscode={vscode} />} />
            <Route path='/pageextension/:id' element={<TranslatePageExtensionView vscode={vscode} />} />
            <Route path='/tableextension/:id' element={<TranslateTableExtensionView  vscode={vscode} />} />
            <Route path='/enum/:id' element={<TranslateEnumView vscode={vscode} />} />
        </Routes>
    );
};