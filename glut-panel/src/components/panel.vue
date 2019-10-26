<template>
  <div class="panel-container flex-column">
    <div class="group-name f-normal" v-if="groupName">Group: {{groupName}}</div>
    <Menu
      mode="horizontal"
      theme="light"
      :active-name="selectTab"
      @on-select="(name)=>(selectTab = name)"
    >
      <MenuItem name="apps">
        <Icon type="ios-apps" />应用
      </MenuItem>
      <MenuItem name="script-manage">
        <Icon type="logo-javascript" />开发管理
      </MenuItem>
      <MenuItem name="setting">
        <Icon type="md-hammer" />设置
      </MenuItem>
    </Menu>
    <div class="content">
      <keep-alive>
        <menuApp v-if="selectTab === 'apps'" key="apps"></menuApp>
        <menuDev v-else-if="selectTab === 'script-manage'" key="script-manage"></menuDev>
        <menuSetting v-else-if="selectTab === 'setting'" key="setting"></menuSetting>
      </keep-alive>
    </div>
  </div>
</template>

<script lang="ts">
import { Menu, MenuItem, Icon } from "iview";
import { Component, Vue } from "vue-property-decorator";
import { Message, Notice } from "iview";
import menuApp from "./menu-app.vue";
import menuDev from "./menu-dev.vue";
import menuSetting from "./menu-setting.vue";

// import utils from "../utils";

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
  components: { Menu, MenuItem, Icon, menuApp, menuSetting, menuDev }
})
export default class extends Vue {
  groupName: string = "apps";
  selectTab: "apps" | "script-manage" | "setting" = "apps";
  created() {
    chrome.storage.sync.get({ GroupName: "" }, ({ GroupName }: any) => {
      this.groupName = GroupName || "";
    });
  }
  protected get $message(): any {
    return Message;
  }
  protected get $notice(): any {
    return Notice;
  }
}
</script>

<style lang="scss">
@import "../styles/index.scss";
.panel-container {
  height: 400px;
  align-items: center;
  .group-name {
    color: #c5c5c5;
    margin: 5px 10px 0 10px;
  }
  .ivu-menu-horizontal {
    height: 40px;
    line-height: 40px;
  }
  .content {
    flex: 1;
    width: 100%;
    position: relative;
    overflow-y: scroll;

    .script-manage {
      justify-content: center;
      height: 100%;
    }
  }
}
</style>
