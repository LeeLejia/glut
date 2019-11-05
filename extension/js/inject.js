console.log('[glut] 注入预置公共脚本！')

// 与content-script 通信，获得系统功能和跨域请求
const msgPrms = {
  // id: promise
}

// 调用远程方法；使用window.postMessage封装成通信组件
const devilSword = (cmd, ...args) => {
  return new Promise(res => {
    const id = '' + new Date().getTime() + Math.random()
    msgPrms[id] = res
    window.postMessage({
      type: 'aircraft-carrier', data: {
        id: id,
        data: {
          name: cmd,
          args
        }
      }
    })
  })
}

window.addEventListener("message", ({ data }) => {
  if (typeof data !== 'object' || data.type !== 'warcraft') {
    return;
  }
  const body = data.data || {}
  const prm = msgPrms[body.id]
  if (prm) {
    prm(body.data)
    delete msgPrms[body.id]
  }
}, false)
// 通过appId初始化App，不存在
window.$glutInitApp = async (appConfig, context) => {
  if (!window.$chromeMiniApps) {
    // 注入公共样式
    await fetch(`${context.extBasePath}style/min-app.css`).then(res => res.text()).then(code => {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = code;
      const header = document.getElementsByTagName('head').item(0);
      header.appendChild(style);
    });

    window.$chromeMiniApps = {
      context,
      common: {
        // 无跨域限制网络接口; 用法同 fetch
        fetch: (...args) => {
          return devilSword('fetch', ...args)
        },
        rmi: devilSword
      }
    }
  }
  const appId = appConfig.id
  // 排除重复
  let appInfo = window.$chromeMiniApps[appId];
  if (appInfo) {
    // 二次调用
    const lifeCycle = appInfo.lifeCycle || {};
    console.log(`[glut] ${appConfig.name} doubleOpen!`);
    (async () => {
      return lifeCycle.doubleOpen && lifeCycle.doubleOpen();
    })();
    appInfo.maxWin && appInfo.maxWin()
    return false;
  } else {
    appInfo = window.$chromeMiniApps[appId] = {
      lifeCycle: {},
      ...appConfig
    }
  }
  const lifeCycle = appInfo.lifeCycle || {};
  // 设置区域为可移动
  function removable(dom, content) {
    let flag = false
    let lastX = 0
    let lastY = 0
    let count = 0
    dom.onmousedown = (e) => {
      if (content.contains(e.target)) {
        return
      }
      flag = true
      const event = e || window.event
      // console.log(dom.style.left, dom.style.top)
      lastX = dom.style.left ? event.clientX - parseInt(dom.style.left, 10) : event.clientX
      lastY = dom.style.top ? event.clientY - parseInt(dom.style.top, 10) : event.clientY
    }
    dom.onmouseup = () => {
      if (flag) {
        flag = false
      }
    }
    dom.onmouseleave = () => {
      if (flag) {
        flag = false
      }
    }
    dom.onmousemove = (e) => {
      if (!flag || count++ % 2 !== 0) return
      const event = e || window.event
      // if (true || event.clientX > lastX && event.clientX < 0 + screen.width - dom.clientWidth + lastX) {
      //   dom.style.left = `${event.clientX - lastX}px`
      // }
      // if (true || event.clientY > lastY && event.clientY < 0 + screen.height - dom.clientHeight + lastY) {
      //   dom.style.top = `${event.clientY - lastY}px`
      dom.style.left = `${event.clientX - lastX}px`
      dom.style.top = `${event.clientY - lastY}px`
    }
  }
  // app
  const app = document.createElement('div')
  app.setAttribute('id', `Glut-App-${appId}`)
  app.setAttribute('class', 'Glut-App')
  // 监听事件
  const listeners = []
  appInfo.close = () => {
    console.log(`[glut] ${appConfig.name} closed!`)
    // 移除监听事件
    listeners.forEach(it => {
      document.body.removeEventListener(it.key, it.event)
    });
    // 触发关闭逻辑
    (async () => {
      return lifeCycle.close && lifeCycle.close();
    })().then(res => {
      app.remove();
      window.$chromeMiniApps[appId] = undefined
    });
  }
  // app 控制区
  const controller = document.createElement('div')
  controller.setAttribute('id', `Glut-App-${appId}-controller`)
  controller.setAttribute('class', `Glut-App-controller`)
  Object.assign(controller.style, {
    background: `url(${context.extBasePath}assets/img/min-app-meun-bg.svg) no-repeat`,
    backgroundSize: 'cover'
  });
  // 设置控制区
  (function () {
    // 菜单
    const menu = document.createElement('div')
    const menuTiggle = () => {
      menu.style.display = menu.style.display === 'none' ? 'unset' : 'none';
    }
    const event = (evn) => {
      if (menu.style.display !== 'none' && !menu.contains(evn.target)) {
        // console.log('none contain')
        menu.style.display = 'none'
      }
    }
    listeners.push({
      key: 'click',
      event
    })
    document.body.addEventListener('click', event, true)
    appInfo.setMenuList = (menuList) => {
      menu.innerHTML = "";
      const list = [...(menuList || []), {
        title: '退出',
        callback: appInfo.close
      }]
      list.forEach((item, idx) => {
        const div = document.createElement('div')
        div.setAttribute('class', `Glut-App-menu-item Glut-App-${appId}-menu-${idx}`)
        div.innerText = item.title
        div.onclick = () => {
          menuTiggle()
          item.callback()
        }
        menu.append(div)
      });
    };
    appInfo.setMenuList()
    menu.setAttribute('id', `Glut-App-${appId}-menu`)
    menu.setAttribute('class', 'Glut-App-menu')
    // 打开菜单按钮
    const menuSwitch = document.createElement('div')
    menuSwitch.setAttribute('id', `Glut-App-${appId}-menuBt`)
    Object.assign(menuSwitch.style, { flex: 1 })
    menuSwitch.onclick = menuTiggle
    // 最小化按钮
    const miniBt = document.createElement('div')
    miniBt.setAttribute('id', `Glut-App-${appId}-minBt`)
    Object.assign(miniBt.style, { flex: 1 })
    appInfo.minWin = miniBt.onclick = () => {
      // 点击最小化按钮
      (async () => {
        return lifeCycle.mini && lifeCycle.mini();
      })();
      (async () => {
        return lifeCycle.resize && lifeCycle.resize();
      })();
      floatBt.style.display = 'block'
      Object.assign(app.style, {
        minWidth: "unset",
        minHeight: "unset",
        width: '60px',
        height: '60px',
        padding: "unset",
        borderRadius: "50%",
        border: "unset"
      })
    }
    controller.append(menuSwitch)
    controller.append(miniBt)
    app.append(menu)
    app.append(controller)
  })();
  // 标题区
  const title = document.createElement('div')
  title.setAttribute('id', `Glut-App-${appId}-title`)
  title.setAttribute('class', `Glut-App-title`)
  title.innerText = appConfig.name

  // 最小化浮动按钮
  const floatBt = document.createElement('div')
  floatBt.setAttribute('id', `Glut-App-${appId}-floatBt`)
  floatBt.setAttribute('class', `Glut-App-floatBt`)
  Object.assign(floatBt.style, {
    // border: `2px solid hsl(${Math.ceil(Math.random() * 361)}, 40%, 50%)`,
    background: `hsl(${Math.ceil(Math.random() * 361)},60%, 70%)`
  })
  if (appConfig.icon) {
    floatBt.style.background = `white url(${appConfig.icon}) no-repeat`
    floatBt.style.backgroundSize = 'cover'
  } else {
    floatBt.innerHTML = (appConfig.name || '+')[0]
  }
  appInfo.maxWin = floatBt.onclick = () => {
    // 点击浮动按钮
    (async () => {
      return lifeCycle.max && lifeCycle.max();
    })();
    (async () => {
      return lifeCycle.resize && lifeCycle.resize();
    })();
    floatBt.style.display = 'none'
    Object.assign(app.style, {
      minWidth: "200px",
      minHeight: "200px",
      width: 'unset',
      height: 'unset',
      borderRadius: "4px",
      border: "1px solid black",
      padding: "40px 10px 10px 10px"
    })
  }

  // app 内容区域
  const content = document.createElement('div')
  content.setAttribute('id', `Glut-App-${appId}-content-outer`)
  content.setAttribute('class', 'Glut-App-content-outer')
  const ctx = document.createElement('div')
  ctx.setAttribute('id', `Glut-App-${appId}-content`)
  content.append(ctx)
  app.append(title)
  app.append(content)
  app.append(floatBt)
  removable(app, content)
  document.body.append(app)
  return true
}