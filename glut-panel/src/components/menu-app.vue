<template>
  <div class="apps-container flex-column">
    <div class="app-list">
      <div
        class="item flex-column active-scale"
        @click.capture="onAppClick(item)"
        v-for="item in appList"
        :key="item.id"
      >
        <Tooltip max-width="200" :content="item.desc" :delay="400">
          <div class="icon-container">
            <Spin fix v-if="item.loadding" class="spin"></Spin>
            <img v-if="item.icon" class="app-icon" :src="item.icon" />
            <div
              v-else
              class="app-icon app-no-icon"
              :style="{backgroundColor: `hsl(${Math.ceil(Math.random() * 361)},60%, 70%)`}"
            >{{(item.name || ' ')[0]}}</div>
          </div>
          <div class="name f-ellipsis">{{item.name}}</div>
        </Tooltip>
      </div>
    </div>
    <div class="empty flex-row" v-if="!appList || appList.length === 0"></div>
    <div class="version">{{version}}</div>
  </div>
</template>

<script lang="ts">
import { Input, Button, Spin, Tooltip } from "iview";
import { Component, Vue } from "vue-property-decorator";
import { Message, Notice } from "iview";
import utils from "../utils";
import getInjectCode from "../assets/js/inject";
import { App } from "../types";
import config from "../config";
declare let chrome: any;

// Todo delete 测试代码
if (!chrome || !chrome.storage) {
  chrome.storage = {
    sync: {
      get: () => "",
      set: (_: any, callback: Function) => callback()
    }
  };
}

@Component({
  components: { "i-input": Input, "i-button": Button, Spin, Tooltip }
})
export default class extends Vue {
  groupId: string = "";
  handle: boolean = false;
  appList: App[] = [];
  version: string = config.version;
  created() {
    // 获取app列表
    // 定义在main.ts
    // @ts-ignore
    utils.getAppList.then(appList => {
      this.appList = appList;
    });
    chrome.storage.sync.get({ groupId: "" }, (res: { groupId: string }) => {
      this.groupId = res.groupId;
    });
  }
  protected get $message(): any {
    return Message;
  }
  protected get $notice(): any {
    return Notice;
  }
  onAppClick(app: App & { loadding: boolean }): void {
    if (app.loadding) {
      return;
    }
    // 调用脚本
    utils.getCurrentTab((tab: any) => {
      console.log("tab:", tab);
      if (tab.url.startsWith("chrome") || tab.url.startsWith("file://")) {
        this.$message.warning("不能在该页面加载小程序");
        return;
      }
      const storageKey = `APP#SCRIPT#${app.id}`;
      const script = localStorage.getItem(storageKey);
      if (script) {
        chrome.tabs.executeScript(tab.id, {
          code: getInjectCode(app, script)
        });
        return;
      }
      // 如果不存在则先加载
      console.log(`[APP] ${app.name} 不存在，开始重新加载.${new Date()}`);
      this.$message.warning(`第一次加载「${app.name}」较慢，请耐心等待`);
      app.loadding = true;
      this.appList = [...this.appList];

      utils.RMI("fetch", app.script).then((res: any) => {
        console.log(
          `[APP] 「${app.name}」下载结果：${res.status === 0}.${new Date()}`
        );
        app.loadding = false;
        this.appList = [...this.appList];
        if (res.status !== 0) {
          this.$message.warning(`「${app.name}」加载失败，请稍后重试`);
          return;
        }
        localStorage.setItem(storageKey, <string>res.result);
        const script = res.result;
        if (script) {
          chrome.tabs.executeScript(tab.id, {
            code: getInjectCode(app, script)
          });
        }
      });
    });
  }
}
</script>

<style lang="scss">
@import "../styles/index.scss";
.apps-container {
  width: 80%;
  height: 300px;
  margin: auto;

  .app-list {
    flex: 1;
    width: 100%;
    margin-top: 20px;
    display: grid;
    grid-template-columns: 25% 25% 25% 25%;
    grid-auto-rows: 80px;
    grid-row-gap: 10px;
    overflow-y: scroll;
    .item {
      text-align: center;
      cursor: pointer;

      $size: 50px;

      .icon-container {
        position: relative;
        width: $size;
        height: $size;
        margin: auto;

        .spin {
          z-index: 999;
        }
      }

      .app-icon {
        width: $size;
        height: $size;
        line-height: $size;
        color: hsl(0, 0%, 100%);
        font-size: 30px;
        text-align: center;
        border-radius: 4px;
        margin-bottom: 5px;
      }
      .app-no-icon {
        border-radius: 50%;
        background: gray;
      }
      .name {
        max-width: 100%;
      }
    }
  }
  .empty {
    width: 200px;
    height: 200px;
    margin: auto;

    @include setBg("../assets/img/empty.svg");
  }

  .version {
    color: #cecece;
    text-align: center;
  }
}
</style>
