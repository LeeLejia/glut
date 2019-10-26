type LifeCycle = {
  open?: Function;
  doubleOpen?: Function;
  close?: Function;
  mini?: Function;
  max?: Function;
  resize?: Function;
};
type AppInfo = {
  id: string;
  name: string;
  icon?: string;
  lifeCycle: LifeCycle;
  // 关闭小程序
  close: () => void;
  maxWin: () => void;
  minWin: () => void;
  // 设置菜单
  setMenuList: (list: Array<{ title: string; callback: Function }>) => void;
};
type CommonFunction = {
  fetch: (url: string, params: RequestInit) => Promise<string>;
  rmi: (cmd: string, ...params: any[]) => Promise<any>;
};
type Context = {
  extBasePath: string;
};
interface ChromeMiniApps {
  [key: string]: CommonFunction | AppInfo | Context;
}

declare var window: {
  $chromeMiniApps?: ChromeMiniApps;
};

// 初始化App
const APPID = "__GLUT_APP_ID__";
let appInfo: AppInfo | {} = { lifeCycle: {} };
if (!window.$chromeMiniApps) {
  console.warn("[GlutApp] window.$chromeMiniApps 不存在");
  alert("[GlutApp] window.$chromeMiniApps 不存在");
  // @ts-ignore
  window.$chromeMiniApps = {
    readme: "mock obj",
    [APPID]: {}
  };
}
// @ts-ignore
Object.assign(appInfo, window.$chromeMiniApps[APPID]);

const common = <CommonFunction>(
  (window.$chromeMiniApps && window.$chromeMiniApps.common)
);
const context = <Context>(
  (window.$chromeMiniApps && window.$chromeMiniApps.context)
);

// 设置监听
function setEventListener(name: keyof LifeCycle, callback: Function) {
  const lifeCycle = (<AppInfo>appInfo).lifeCycle;
  if (lifeCycle) {
    lifeCycle[name] = callback;
  }
}
// 获取app信息
function getAppInfo() {
  //@ts-ignore
  const { id, name, icon } = <AppInfo>appInfo;
  return { id, name, icon };
}

console.log("[glut:__GLUT_APP_ID__] is running!");
// Log 添加前缀
const Log = (...args: any) => {
  console.log("[glut:__GLUT_APP_ID__]", ...args);
};

export default {
  ...common,
  getAppInfo,
  context,
  getAppId: () => APPID,
  getRootElementId: () => `Glut-App-${APPID}-content`,
  setEventListener,
  // 控制小程序方法
  close: (<AppInfo>appInfo).close,
  maxWin: (<AppInfo>appInfo).maxWin,
  minWin: (<AppInfo>appInfo).minWin,
  setMenuList: (<AppInfo>appInfo).setMenuList,
  Log
};
