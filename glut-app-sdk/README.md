# glut-app-sdk

通过导入 glut-app-sdk，快速开发 glut 小程序。

## 用法

- 安装

> npm install glut-app-sdk

- 在项目中引入

```javascript
import sdk from "glut-app-sdk";
```

- 挂载到项目根节点

以 vue 为例，react 或 angular 用法类似

```javascript
Vue.prototype.$rootId = sdk.getRootElementId();
// 在根节点处挂载小程序到容器
new Vue({
  render: (h) => h(App)
}).$mount(`#${sdk.getRootElementId()}`);

// vue根节点模版
<template>
  <div :id="$rootId">
  // content
  </div>
</template>
```

## API

<details>
<summary>sdk.fetch</summary>

通过该接口可以在任意页面向任意网站发起跨域请求

```javascript
// sdk.fetch和fetch参数用法一样，可以发起GET, POST, PUT, DELETE, etc.请求
// 但是返回值序列化为字符串。相当于fetch(..).then(res=>res.text())

// 例如：向百度发起请求
sdk.fetch("https://www.baidu.com").then((res) => console.log(res));

// 发起一个post请求
fetch(url, {
  body: JSON.stringify(data),
  cache: "no-cache",
  headers: {
    "user-agent": "Mozilla/4.0 MDN Example",
    "content-type": "application/json"
  },
  method: "POST" // *GET, POST, PUT, DELETE, etc.
}).then((response) => response.json());
```

</details>

<details>
<summary>sdk.rmi</summary>

开发该接口旨在利用**background-script**能力为小程序和页面脚本提供更多的权限能力，例如系统通知、udp 通信。后续版本考虑废弃，不建议使用。

```typescript
  rmi: (cmd: string, ...params: any[]) => Promise<any>;
```

</details>

<details>
<summary>sdk.context</summary>

获取小程序环境信息

```javascript
console.log(sdk.context);
// { extBasePath: "xxxx" }
```

</details>

<details>
<summary>sdk.getAppInfo</summary>

获取小程序信息

```javascript
sdk.getAppInfo();
// result：{ id, name, icon }
```

</details>

<details>
<summary>sdk.getAppId</summary>

获取小程序 Id，每个发布的小程序都有唯一的 appId

```javascript
sdk.getAppId();
// "xxxxxx"
```

</details>

<details>
<summary>sdk.getRootElementId</summary>

获取小程序容器的 Id

小程序项目根节点需要挂载到小程序容器上，需要执行 sdk.getRootElementId()获取容器 Id 之后注入视图到对应节点。

```javascript
new Vue({
  render: (h) => h(App)
}).$mount(`#${sdk.getRootElementId()}`);
```

</details>

<details>
<summary>sdk.setEventListener</summary>

设置监听

监听器类型包括：open、doubleOpen、close、mini、max、resize

open：小程序打开时回调  
doubleOpen：小程序在打开的情况下被再次打开，默认处理是将小程序最大化  
close：小程序关闭前调用。自定义了其它监听事件或者定时器等需要在这里移除。
mini: 小程序最小化  
max：最大化时调用  
resize: 最大化或者最小化时调用

```javascript
sdk.setEventListener("close", () => {
  // 当小程序关闭时调用
});

// 只有b方法会被回调，b替换了a
sdk.setEventListener("xxx", a);
sdk.setEventListener("xxx", b);
```

</details>

<details>
<summary>sdk.close、sdk.maxWin、sdk.minWin</summary>

小程序视图接口

```javascript
// 关闭小程序
sdk.close();

// 最大化窗口
sdk.maxWin();

// 最小化窗口
sdk.minWin();
```

</details>

<details>
<summary>sdk.setMenuList</summary>

添加菜单

```javascript
sdk.setMenuList([
  {
    title: "主页",
    callback: () => console.log("点击了主页")
  },
  {
    title: "菜单1",
    callback: () => console.log("点击了菜单1")
  },
  {
    title: "菜单2",
    callback: () => console.log("点击了菜单2")
  }
]);
```

</details>

<details>
<summary>sdk.runAtPage</summary>

调用页面脚本方法

小程序和页面脚本共享 document 对象，其余环境均被隔离。不能直接在小程序中使用页面脚本对象和方法。

调用页面方法，需要通过该接口进行。

// 页面脚本

```javascript
window.abc = 123;
function one() {
  return 1;
}
```

// 小程序脚本

```javascript
sdk
  .runAtPage(function() {
    return window.abc + one();
  })
  .then((res) => {
    console.log(res); // 124
  });
```

</details>

<details>
<summary>sdk.saveConfig、sdk.readConfig</summary>

存取配置

```javascript
sdk.saveConfig({
  a: 233,
  b: {...}
})
// 读取配置，传入键和缺省值
sdk.readConfig({a: 111, c: 'default value'}).then(res=>{
  console.log(res) // {a: 233, c: 'default value'}
})
```

</details>

<details>
<summary>sdk.Log</summary>

打印日志，区分页面的 log

```javascript
sdk.Log("obj:", { a: 22, b: 44 });
// [glut:__GLUT_APP_ID__] obj: {a: 22, b:44}
```

</details>
