// executeScript全局变量（window）和页面的全局对象不同；但是document相同
import { App } from "../../types";
declare let chrome: any;

const context = {
  extBasePath: chrome.extension && chrome.extension.getURL("")
};

// injectCode和页面环境不同,但是共享document
export default function getInjectCode(app: App, script: string): string {
  return `
  if (!window.$chromeMiniApps) {
    // 构建通信通道
    (()=>{
      const temp = document.createElement('script');
      temp.setAttribute('type', 'text/javascript');
      temp.innerHTML = \`
        window.addEventListener('message', ({data})=>{
          if(typeof data !== 'object' || data.type !== 'glut-inject' || !data.id || !data.script) {
            return;
          }
          Promise.resolve().then(()=>{
            return eval(data.script)
          }).catch(err=>({
            status: -1,
            msg: err
          })).then(res=>({
            status: 0,
            data: res
          })).then(res=>{
            postMessage({
              id: data.id,
              type: 'glut-window',
              data: res
            });
          }).catch(err=>{
            postMessage({
              id: data.id,
              type: 'glut-window',
              data: {
                status: -1,
                msg: '不能传递不能clone的对象'
              }
            });
          });
        })
      \`;
      temp.onload = function () {
        this.parentNode.removeChild(this);
      };
      document.body.appendChild(temp);
    })();
    const url = '${context.extBasePath}js/inject.js';
    fetch(url).then(res=>res.text()).then(code=>{
      eval(code);
      window.$glutInitApp(JSON.parse('${JSON.stringify(
        app
      )}'), JSON.parse('${JSON.stringify(context)}')).then(isRun => {
        if (isRun) {
          ${script};
          const __appConfig = window.$chromeMiniApps && window.$chromeMiniApps['${
            app.id
          }'];
          __appConfig.lifeCycle && __appConfig.lifeCycle.open && __appConfig.lifeCycle.open();
        }
      })
    })
  } else {
    console.warn('[glut]脚本已经存在！')
    window.$glutInitApp(JSON.parse('${JSON.stringify(
      app
    )}'), JSON.parse('${JSON.stringify(context)}')).then(isRun => {
      if (isRun) {
        ${script};
        const __appConfig = window.$chromeMiniApps && window.$chromeMiniApps['${
          app.id
        }'];
        __appConfig.lifeCycle && __appConfig.lifeCycle.open && __appConfig.lifeCycle.open();
      }
    })
  }
  `;
}
