# Glut

一款用于团队内部工具开发共享的工具。

该项目旨在方便的进行 chrome 拓展应用开发和分享。相当于一套运行在 chrome 上的小程序框架，它提供了比页面脚本更多的 Api。

## 安装

- 从[chromeWebStore](https://chrome.google.com/webstore/detail/glut/baggadcfggenanhadoapjamongmhjpla)安装

- [发邮件](mailto:cjwddz@gmail.com?subject=Glut&subject=groupID申请&body=滴滴滴～)申请 groupId

  > GroupId 申请通道开发中,以后可以直接注册使用

  ![登陆](doc/img/login.png)

- 可以尝试使用下面的 groupId 进行开发调试体验，但发布需要你独立申请一个 groupId
  > GroupId: <span style="color: darkorange">5dc0eeb3d1b85c00086c4a42</span>

> 11 月 5 号，插件还在审核中，估计两天后审核通过才能正常使用。

## 小应用开发

> glut 应用是一个可以随时在页面打开的小组件，它既可以作为页面的辅助工具或者也可以提供独立的功能。如果你使用过*Tampermonkey*,你会发现 glut 提供了更强大的功能。

glut 应用的开发不限制前端框架，在项目中引入 sdk，可以在本地开发调试完成后将应用上传。同一个 groupId 的其它人即可同步到更新。

- glut 应用和页面脚本

![原理](doc/img/theory.png)

- 可以通过 glut 应用实现的功能

![能力](doc/img/ability.png)

### 开发步骤

- 新建项目

> 配置你的前端项目,并确保最终项目被打包为一个文件。  
> 或者直接使用 [vue 开发模版](https://github.com/LeeLejia/glut-vue-demo),目前仅提供 vue 模版,你可以稍作配置进行 react 或者 angular 项目开发。 [vue-typescript 开发模版](https://github.com/LeeLejia/glut-vue-demo/tree/typescript-demo)

- 安装 sdk

[sdk API 文档](glut-app-sdk/README.md)

```bash
npm install glut-app-sdk
```

- 在项目中引入

```javascript
import sdk from "glut-app-sdk";
```

- 调试

在面板中选择调试,输入打包后的 js 链接或者文件。  
在[vue 开发模版](https://github.com/LeeLejia/glut-vue-demo)中，你可以先执行

```bash
npm install
npm run dev
```

然后调试链接设置：http://localhost:5656/build.js  
点击调试运行应用

![调试](doc/img/debug.png)

- 发布

> 调试功能正常之后，选择发布->新建小程序,提供小程序信息和发布密码，点击发布。

![发布](doc/img/publish.png)

> 发布成功后相同 groupId 的成员在下一次打开浏览器时将同步到更新，也可以通过*设置->同步配置*及时获得更新。

![应用列表](doc/img/applist.png)

## demo

- cross-demo

[项目仓库](https://github.com/LeeLejia/glut-vue-demo/tree/dev/cross-example)

> 在 npm 向 bing 和百度发起请求

![demo1](doc/img/demo1.png)

- sheetToCode

[项目仓库](https://github.com/LeeLejia/glut-vue-demo/tree/dev/sheetToCode)

> 复制表格生成代码

![demo1](doc/img/demo2.png)

- 多语言自检工具

[项目仓库](https://github.com/LeeLejia/glut-vue-demo/tree/dev/mtlang)

> 基于跨域接口的，文档链接格式检查应用

![demo1](doc/img/demo3.png)

- 微商小工具

> 一个自动转发店铺商品的小应用

![demo1](doc/img/demo4.png)
