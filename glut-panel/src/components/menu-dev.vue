<template>
  <div class="dev-container flex-row">
    <RadioGroup v-model="mode" vertical class="mode-selector">
      <Radio label="dev">
        <Icon type="ios-bug"></Icon>
        <span>调试</span>
      </Radio>
      <Radio label="publish">
        <Icon type="md-cloud-upload" />
        <span>发布</span>
      </Radio>
    </RadioGroup>
    <div class="content">
      <devPart class="dev" v-if="mode==='dev'"></devPart>
      <uploadPart class="upload" v-else-if="mode==='publish'"></uploadPart>
    </div>
  </div>
</template>

<script lang="ts">
import { Input, Radio, Icon, RadioGroup } from "iview";
import { Component, Vue } from "vue-property-decorator";
import devPart from "./dev-tab.vue";
import uploadPart from "./upload-tab.vue";
import { Message, Notice } from "iview";
import { App } from "../types";
import utils from "../utils";
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
  components: {
    "i-input": Input,
    Radio,
    Icon,
    RadioGroup,
    devPart,
    uploadPart
  }
})
export default class extends Vue {
  mode: string = "dev";
  groupId: string = "";
  handle: boolean = false;
  appList: App[] = [];
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
}
</script>

<style lang="scss">
@import "../styles/index.scss";
.dev-container {
  width: 80%;
  height: 300px;
  margin: auto;
  padding-top: 15px;

  .mode-selector {
    width: 80px;
  }

  .content {
    flex: 1;
    height: 100%;
    border-left: 1px solid #b8b8b8;
    padding: 10px;
  }
}
</style>
