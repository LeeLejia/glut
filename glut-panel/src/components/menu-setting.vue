<template>
  <div class="setting-container">
    <div class="group-id-setting-item setting-item flex-row" v-if="!showModifyBox && groupId">
      <div class="info">
        <div class="name f-medium">{{groupName}}</div>
        <div class="desc f-normal">GroupId: {{groupId}}</div>
      </div>
      <div class="action f-normal action-modify" @click="showModifyBox = true">修改GroupId</div>
    </div>
    <!-- 设置GroupId -->
    <div class="input-box flex-row" v-else>
      <div class="back" v-if="groupId" @click="showModifyBox = false">back↩</div>
      <i-input
        class="groupid-input"
        icon="ios-help-circle-outline"
        v-model="groupId_edit"
        placeholder="请设定GroupId"
        @on-click="question"
        autocomplete
      />
      <i-button type="primary" shape="circle" :loading="handle" @click="confirm">OK</i-button>
    </div>
    <!-- 设置自动更新 -->
    <div class="setting-item flex-row">
      <div class="info">
        <div class="name f-medium">自动更新</div>
        <div class="desc f-normal">打开浏览器时同步服务端设置</div>
      </div>
      <i-switch class="action" v-model="autoUpdate" @on-change="changeAutoUpdate" />
    </div>
    <!-- 同步配置 -->
    <div class="setting-item flex-row sync-config">
      <i-button shape="circle" class="bt clear-bt" type="dashed" @click="clearCache">清除缓存</i-button>

      <i-button
        shape="circle"
        class="bt"
        type="primary"
        :loading="syncHandle"
        @click="syncSetting"
      >同步配置</i-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Input, Button } from "iview";
import { Component, Vue } from "vue-property-decorator";
import { Message, Notice, Switch } from "iview";
import utils from "../utils";

declare let chrome: any;

// Todo delete 测试代码
if (!chrome || !chrome.storage) {
  chrome.storage = {
    sync: {
      get: () => "",
      set: (_: any, callback: Function) => callback && callback()
    }
  };
}

@Component({
  components: { "i-input": Input, "i-button": Button, "i-switch": Switch }
})
export default class extends Vue {
  groupId_edit: string = "";
  groupId: string = "";
  groupName: string = "";
  autoUpdate: boolean = true;
  showModifyBox: boolean = false;
  handle: boolean = false;
  syncHandle: boolean = false;
  created() {
    chrome.storage.sync.get(
      { groupId: "", GroupName: "", AutoUpdate: true },
      (res: { groupId: string; GroupName: string; AutoUpdate: boolean }) => {
        this.groupId = res.groupId;
        this.groupId_edit = res.groupId;
        this.groupName = res.GroupName;
        this.autoUpdate = res.AutoUpdate;
      }
    );
  }
  protected get $message(): any {
    return Message;
  }
  protected get $notice(): any {
    return Notice;
  }
  question(): void {
    this.$notice.open({
      title: "获取GroupId",
      render: (h: any) => {
        return h("span", [
          "选择以下方式 ",
          h(
            "a",
            {
              attrs: {
                href: "https://leelejia.github.io/sites/glut/?page=getId",
                target: "_blank"
              }
            },
            "通过邮箱查询"
          ),
          " 或 ",
          h(
            "a",
            {
              attrs: {
                href: "https://leelejia.github.io/sites/glut/?page=regiest",
                target: "_blank"
              }
            },
            "注册GroupId"
          ),
          " 获取GroupId"
        ]);
      },
      duration: 15000
    });
  }
  syncSetting(): void {
    if (this.syncHandle) {
      return;
    }
    this.syncHandle = true;
    utils.RMI("updateConfig").then((res: any) => {
      this.syncHandle = false;
      if (res.status !== 0) {
        this.$message.error("加载配置失败");
        return;
      }
      this.$message.success("更新成功！");
    });
  }
  clearCache(): void {
    localStorage.clear();
    chrome.storage.sync.clear();
    this.$message.success("已清空缓存!");
  }
  changeAutoUpdate(): void {
    chrome.storage.sync.set({ AutoUpdate: this.autoUpdate });
  }
  // methods
  confirm(): void {
    if (!this.groupId_edit.trim()) {
      this.$message.error("请输入先groupId");
      return;
    }
    if (this.handle) {
      return;
    }
    this.handle = true;
    const msg = this.$message.loading({
      content: "同步配置中...",
      duration: 0
    });
    utils.RMI("updateConfig", this.groupId_edit.trim()).then((res: any) => {
      msg();
      this.handle = false;
      this.showModifyBox = false;
      if (res.status !== 0) {
        this.$message.error(res.result || "请输入有效的GroupId");
        return;
      }
      this.$message.success("设置成功！");
      chrome.storage.sync.get(
        { groupId: "", GroupName: "" },
        (res: { groupId: string; GroupName: string }) => {
          this.groupId = res.groupId;
          this.groupName = res.GroupName || "";
        }
      );
    });
  }
}
</script>

<style lang="scss">
@import "../styles/index.scss";
.setting-container {
  margin: auto;
  padding: 20px;

  .title {
    margin-bottom: 20px;
    text-align: center;
    color: #aaaaaa;
  }

  .input-box {
    width: 90%;
    margin: 35px auto;
    .groupid-input {
      margin-right: 5px;
    }
    input {
      border-radius: 16px;
      text-align: center;
    }
  }

  .setting-item {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    padding: 10px 0;
    border-bottom: 1px solid #147dea; // #dadada;

    .clear-bt {
      margin-right: 20px;
    }

    .info {
      flex: 1;
      .name {
        color: #3a3a3a;
      }
      .desc {
        color: gray;
        font-size: 12px;
        padding-right: 40px;
      }
    }
    .action-modify {
      color: blue;
      cursor: pointer;
      text-decoration: underline;
    }
  }

  .back {
    font-size: 15px;
    margin-right: 4px;
    cursor: pointer;
  }

  .group-id-setting-item {
    margin-bottom: 20px;
    width: 95%;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #b4b4b4;
    box-shadow: 1px 1px 2px 1px #b4b4b4;
  }

  .sync-config {
    justify-content: flex-end;
    border-bottom: unset;
    margin-top: 50px;
  }
}
</style>
