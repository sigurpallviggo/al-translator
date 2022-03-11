import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IVSCodeAPI } from './@types/system';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from './router';

declare global {
    interface Window {
        acquireVsCodeApi(): IVSCodeAPI;
    }
}

ReactDOM.render(
    <MemoryRouter>
        <AppRouter vscode={window.acquireVsCodeApi()} />
    </MemoryRouter>,
    document.getElementById('root')
);