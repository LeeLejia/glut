# Glut

一款用于团队内部工具开发共享的工具。

该项目旨在方便的进行 chrome 拓展应用开发和分享。

## 安装

- 从[chromeWebStore](https://chrome.google.com/webstore/detail/glut/baggadcfggenanhadoapjamongmhjpla)安装

- [发邮件](mailto:cjwddz@gmail.com?subject=Glut&subject=groupID申请&body=滴滴滴～)申请 groupId

  > GroupId 申请通道开发中,以后可以直接注册使用

  ![登陆](doc/img/login.png)

## 小应用开发

> glut 应用是一个可以随时在页面打开的小组件，它既可以作为页面的辅助工具或者也可以提供独立的功能。如果你使用过*Tampermonkey*,你会发现 glut 提供了更强大的功能。

glut 应用的开发不限制技术栈，可以在本地开发调试完成后将应用上传。同一个 groupId 的其它人即可同步到更新。

### 开发步骤

- 新建项目

> 配置你的前端项目,并确保最终项目被打包为一个文件。  
> 或者直接使用 [vue 开发模版](https://github.com/LeeLejia/glut-vue-demo),目前仅提供 vue 模版,你可以稍作配置进行 react 或者 angular 项目开发。

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
![应用列表](doc/img/applist.png)
