// executeScript全局变量（window）和页面的全局对象不同；但是document相同
import { App } from "../../types";
declare let chrome: any;

const context = {
  extBasePath: chrome.extension && chrome.extension.getURL("")
};

export default function getInjectCode(app: App, script: string): string {
  return `
  if (!window.$chromeMiniApps) {
    const url = '${context.extBasePath}js/inject.js';
    fetch(url).then(res=>res.text()).then(code=>{
      eval(code)
      window.$glutInitApp(JSON.parse('${JSON.stringify(
        app
      )}'), JSON.parse('${JSON.stringify(context)}')).then(isRun => {
        ${script}
        const __appConfig = window.$chromeMiniApps && window.$chromeMiniApps['${
          app.id
        }'] && window.$chromeMiniApps['${app.id}'].lifeCycle
        __appConfig.open && __appConfig.open()
      })
    })
  } else {
    console.warn('[glut]脚本已经存在！')
    window.$glutInitApp(JSON.parse('${JSON.stringify(
      app
    )}'), JSON.parse('${JSON.stringify(context)}')).then(isRun => {
      if (isRun) {
        ${script}
        const __appConfig = window.$chromeMiniApps && window.$chromeMiniApps['${
          app.id
        }']
        __appConfig.open && __appConfig.open()
      }
    })
  }
  `;
}
