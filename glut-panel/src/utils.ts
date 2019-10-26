declare let chrome: any;
type App = {
  id: string;
  name: string;
  desc: string;
  icon?: string;
  script?: string;
};
type AppItem = App & {
  lastTime?: Number;
};

// 调用远程方法
const RMI = (name: string, ...args: any) => {
  return new Promise(resolve => {
    // 发送消息给后台
    chrome.runtime.sendMessage(
      {
        type: "invoke",
        name: name,
        args
      },
      resolve
    );
  });
};

// 弹窗提示
function showToast(options: any) {
  RMI("notice", "", {
    type: "basic",
    iconUrl: "assets/img/app-icon.png",
    ...options
  });
}

// 加载App
type LoadAppParam = { key: string; lastTime: Number };
type LoadAppResult = {
  status: Number;
  data?: AppItem;
  msg?: string;
};
const loadApp = (param: LoadAppParam): Promise<LoadAppResult> => {
  console.log("load app:", param.key);
  return RMI("loadApp", param.key)
    .then((res: any) => {
      if (res.status !== 0) {
        showToast({
          title: `下载App失败`,
          message: `key:${param.key || ""}`
        });
        console.log(`load app failed[${param.key}]: status=${res.status}`);
        return {
          status: -1,
          msg: `下载App失败:${param.key}`
        };
      }
      console.log("load app success:", param.key);
      const rawApp = res.result || {};
      console.log("load app: ", rawApp);
      // 在该处可以预加载
      RMI("fetch", rawApp.script).then(({ result: res }: any) => {
        if (res.status === 0) {
          showToast({
            title: `下载App成功`,
            message: `[${(res.result && res.result.name) ||
              ""}] ${(res.result && res.result.desc) || ""}`
          });
          localStorage.setItem("APP#SCRIPT#" + param.key, <string>res.result);
        }
      });
      return {
        status: 0,
        data: {
          id: rawApp.objectId,
          desc: rawApp.desc,
          name: rawApp.name,
          icon: rawApp.icon || "",
          script: rawApp.script,
          lastTime: param.lastTime
        }
      };
    })
    .catch(err => ({
      status: -1,
      msg: err
    }));
};

// 检查更新App
const updateApp = (): Promise<AppItem[]> => {
  let resultPrms: Function;
  const resultPromise = new Promise<AppItem[]>(res => (resultPrms = res));
  const apps: AppItem[] =
    JSON.parse(localStorage.getItem("LIST#APP") || "[]") || [];
  // 获取当下脚本列表
  chrome.storage &&
    chrome.storage.sync.get({ AppList: [] }, function({ AppList }: any) {
      const preList: Array<AppItem & { delete?: boolean }> = apps || [];
      const newListMap = AppList.reduce((res: any, cur: any) => {
        res[cur.key] = cur;
        return res;
      }, {});
      // 检查 更新 删除
      preList.forEach((it: AppItem & { delete?: boolean }) => {
        const exist = newListMap[it.id];
        // 脚本已删除, 或者脚本被更新
        if (!exist || exist.lastTime !== it.lastTime) {
          // 删除旧的
          it.delete = true;
          console.log("remove app:", it.id);
          localStorage.removeItem("APP#SCRIPT#" + it.id);
          return;
        }
        // 不需要更新
        exist.avoidLoad = true;
      });
      // 下载更新的App列表
      const loadAppPrms = Object.values(newListMap)
        .filter((it: any) => !it.avoidLoad)
        .map((it: any) => {
          return loadApp(it);
        });
      Promise.all(loadAppPrms).then((prmsRes: Array<LoadAppResult>) => {
        // @ts-ignore
        const appList: AppItem[] = prmsRes.map(it => it.data);
        const sumList = [...preList.filter(it => !it.delete), ...appList];
        localStorage.setItem("LIST#APP", JSON.stringify(sumList));
        resultPrms && resultPrms(sumList);
      });
    });
  return resultPromise;
};

// 获取当前选项卡ID
function getCurrentTab(callback: (args: Number) => void) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs: any) {
    if (callback) callback(tabs.length ? tabs[0] : null);
  });
}

export default {
  RMI,
  getAppList: updateApp(),
  getCurrentTab,
  loadApp
};
