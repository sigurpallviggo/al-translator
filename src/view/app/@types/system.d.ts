import { IWebViewMessage } from "./messages";

export interface IVSCodeAPI<T = unknown> {
    getState: () => T;
    setState: (data : T) => void;
    postMessage: (msg: IWebViewMessage) => void; 
}