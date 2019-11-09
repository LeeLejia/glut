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
  postMessage: Function;
  addEventListener: Function;
  removeEventListener: Function;
  innerHeight: number;
  innerWidth: number;
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

// region ==========>>>>>>>>> 页面通信
// 在页面环境跑代码
const msgPrms: Record<string, any> = {
  // id: promise
};
function runAtPage(fun: Function): Promise<any> {
  return new Promise((res) => {
    const id = "" + new Date().getTime() + Math.random();
    msgPrms[id] = res;
    window.postMessage({
      type: "glut-inject",
      id: id,
      script: `(${fun.toString()})();`
    });
  });
}
function onMessage({ data }: any) {
  if (typeof data !== "object" || data.type !== "glut-window" || !data.id) {
    return;
  }
  const body = data.data || {};
  const prm = msgPrms[data.id];
  if (prm) {
    prm(body.data);
    delete msgPrms[body.id];
  }
}

// 保存配置
function saveConfig(obj: { [key: string]: any }): void {
  // @ts-ignore
  if (chrome.storage) {
    // @ts-ignore
    chrome.storage.sync.get({ [APPID]: {} }, function(result) {
      // @ts-ignore
      chrome.storage.sync.set({
        [APPID]: Object.assign({}, result[APPID], obj)
      });
    });
  }
}

// 读取配置
function readConfig(defaultObj: {
  [key: string]: any;
}): Promise<{ [key: string]: any }> {
  return new Promise((res) => {
    // @ts-ignore
    chrome.storage.sync.get({ [APPID]: {} }, function(result) {
      const readResult = result[APPID] || {};
      res(
        Object.keys(defaultObj).reduce((rs: any, it) => {
          rs[it] = readResult.hasOwnProperty(it)
            ? readResult[it]
            : defaultObj[it];
          return rs;
        }, {})
      );
    });
  });
}

// 初始化小程序位置
function initPos() {
  const dom = document.querySelector(`#Glut-App-${APPID}`);
  if (dom) {
    // @ts-ignore
    Object.assign(dom.style, {
      display: "unset"
    });
    readConfig({
      pos_left: Math.round(window.innerWidth / 2 - dom.clientWidth / 2),
      pos_top: Math.round(window.innerHeight / 2 - dom.clientHeight / 2)
    }).then(({ pos_left, pos_top }) => {
      console.log({ pos_left, pos_top });
      // @ts-ignore
      Object.assign(dom.style, {
        left:
          Math.min(pos_left, window.innerWidth - dom.clientWidth - 10) + "px",
        top:
          Math.min(pos_top, window.innerHeight - dom.clientHeight - 10) + "px"
      });
    });
  }
}

window.addEventListener("message", onMessage, false);
// endregion <<<<<<<============= 页面通信
const closeEvent = function() {
  // 保存上一个位置
  const dom = document.querySelector(`#Glut-App-${APPID}`);
  if (dom) {
    // @ts-ignore
    const { offsetTop, offsetLeft } = dom;
    saveConfig({
      pos_left: offsetLeft || 0,
      pos_top: offsetTop || 0
    });
  }
  window.removeEventListener("message", onMessage);
};
const lifeCycle = (<AppInfo>appInfo).lifeCycle;
if (lifeCycle) {
  lifeCycle.close = closeEvent;
  lifeCycle.open = initPos;
}
// 设置监听
function setEventListener(name: keyof LifeCycle, callback: Function) {
  if (lifeCycle) {
    if (name === "close") {
      lifeCycle[name] = function() {
        closeEvent();
        callback();
      };
      return;
    } else if (name === "open") {
      lifeCycle[name] = function() {
        // 初始化位置
        initPos();
        callback();
      };
      return;
    }
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
  Log,
  runAtPage,
  saveConfig,
  readConfig
};
