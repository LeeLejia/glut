<template>
  <div class="dev-form-container flex-column">
    <div class="info">
      <!-- 上传类型选择 -->
      <RadioGroup v-model="type" class="type-selector">
        <Radio label="link">链接</Radio>
        <Radio label="file">文件</Radio>
      </RadioGroup>
      <i-input
        v-model="inputUrl"
        size="small"
        :disabled="type!=='link'"
        class="link-input"
        placeholder="请输入脚本链接"
      />
      <Upload
        class="file-input"
        :disabled="type!=='file' || (type ==='file' && loadding)"
        :before-upload="onFile"
        accept="text/javascript, application/javascript"
      >
        <Button
          :loading="loadding"
          size="small"
          :disabled="type!=='file'"
          icon="ios-cloud-upload-outline"
        >{{fileName || '上传脚本'}}</Button>
      </Upload>
    </div>
    <Button size="primary" :loading="loadding" icon="ios-bug" @click="debug">调试</Button>
  </div>
</template>
<script lang="ts">
import {
  Input,
  Radio,
  RadioGroup,
  Upload,
  Button,
  Message,
  Notice
} from "iview";
import { Component, Vue } from "vue-property-decorator";
import getInjectCode from "../assets/js/inject";
import utils from "../utils";
import { App } from "../types";
declare let chrome: any;

@Component({
  components: {
    "i-input": Input,
    Radio,
    RadioGroup,
    Upload,
    Button
  }
})
export default class extends Vue {
  type: "link" | "file" = "link";
  inputUrl: string = "";
  fileName: string = "";
  fileText: string = "";
  loadding: boolean = false;
  created() {
    chrome.storage.sync.get(
      { formData_devUrl: "", formData_devType: "link" },
      (res: any) => {
        this.inputUrl = res.formData_devUrl;
        this.type = res.formData_devType;
      }
    );
  }
  onFile(file: File) {
    if (!file) {
      return false;
    }
    if (file.size > 1024 * 1024 * 10) {
      this.$message.warning("请压缩脚本文件在10M以内,尝试外部引用资源文件");
      return false;
    }
    this.fileName = file.name;
    var reader = new FileReader();
    reader.onloadend = evt => {
      // @ts-ignore
      if (evt.target.readyState == FileReader.DONE) {
        // @ts-ignore
        this.fileText = evt.target.result;
      }
    };
    reader.readAsText(file, "utf-8");
    return false;
  }
  async debug() {
    // __GLUT_APP_ID__ 全局替换
    // 处理脚本文件
    let script = this.fileText;
    chrome.storage.sync.set({ formData_devType: this.type });
    if (this.type === "link") {
      if (
        !/^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i.test(
          this.inputUrl
        )
      ) {
        this.$message.error("请输入有效链接");
        return;
      }
      chrome.storage.sync.set({ formData_devUrl: this.inputUrl });
      this.loadding = true;
      // @ts-ignore
      const result: { status: number; result: string } = await utils.RMI(
        "fetch",
        this.inputUrl
      );
      if (result.status !== 0) {
        this.loadding = false;
        this.$message.error("请输入有效链接");
        return;
      }
      script = result.result;
    }
    if (!script) {
      this.loadding = false;
      this.$message.error("无效脚本");
      return;
    }
    const app: App = {
      id: `__GLUT_APP_ID__`,
      name: `debug_version`,
      icon: chrome.extension && chrome.extension.getURL("assets/img/debug.svg")
    };
    // 检查脚本是否有效
    // let valid = false;
    // script = script.replace(/__GLUT_APP_ID__/g, () => {
    //   if (!valid) {
    //     valid = true;
    //   }
    //   return app.id;
    // });
    // if (!valid) {
    //   this.loadding = false;
    //   this.$message.error("请将小程序界面挂载到#__GLUT_APP_ID__");
    //   return;
    // }
    // 调用脚本
    utils.getCurrentTab((tab: any) => {
      console.log("tab:", tab);
      if (tab.url.startsWith("chrome://")) {
        this.$message.warning("不能在该页面调试小程序");
        return;
      }
      this.loadding = false;
      chrome.tabs.executeScript(tab.id, {
        code: getInjectCode(app, script)
      });
      this.$message.success("加载成功");
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
<style lang="scss" scoped>
.dev-form-container {
  height: 100%;
  align-items: center;
  justify-content: space-between;
  .type-selector {
    margin-bottom: 10px;
  }
  .link-input {
    margin: 10px 0;
  }
  .file-input {
    margin: 10px 0;
  }
}
</style>