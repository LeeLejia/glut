declare type LifeCycle = {
    open?: Function;
    doubleOpen?: Function;
    close?: Function;
    mini?: Function;
    max?: Function;
    resize?: Function;
};
declare type Context = {
    extBasePath: string;
};
declare function runAtPage(fun: Function): Promise<any>;
declare function saveConfig(obj: {
    [key: string]: any;
}): void;
declare function readConfig(defaultObj: {
    [key: string]: any;
}): Promise<{
    [key: string]: any;
}>;
declare function setEventListener(name: keyof LifeCycle, callback: Function): void;
declare function getAppInfo(): {
    id: string;
    name: string;
    icon: string | undefined;
};
declare const _default: {
    getAppInfo: typeof getAppInfo;
    context: Context;
    getAppId: () => string;
    getRootElementId: () => string;
    setEventListener: typeof setEventListener;
    close: () => void;
    maxWin: () => void;
    minWin: () => void;
    setMenuList: (list: {
        title: string;
        callback: Function;
    }[]) => void;
    Log: (...args: any) => void;
    runAtPage: typeof runAtPage;
    saveConfig: typeof saveConfig;
    readConfig: typeof readConfig;
    fetch: (url: string, params: RequestInit) => Promise<string>;
    rmi: (cmd: string, ...params: any[]) => Promise<any>;
};
export default _default;
