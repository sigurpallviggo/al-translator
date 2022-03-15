/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import { IVSCodeAPI } from './@types/system';
import { TranslationView } from './views/translation.view';
import { MainView } from './views/main';

export const AppRouter: React.FC<{ vscode: IVSCodeAPI }> = ({ vscode }) => {
    return (
        <Routes>
            <Route path="/" element={<MainView vscode={vscode} />} />
            <Route path="/:objectType/:id" element={<TranslationView vscode={vscode} />} />
        </Routes>
    );
};