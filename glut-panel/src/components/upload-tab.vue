<template>
  <div class="dev-form-container flex-column">
    <div class="info">
      <div class="form-row flex-row select-app">
        <div class="label">选择小程序：</div>
        <Select v-model="selectApp" :disabled="loadding" @on-change="changeSelector">
          <Option class="app-item flex-row" value="create" label="新建小程序" :key="'create'">
            <div class="app-info">
              <div class="name f-ellipsis">新建小程序</div>
            </div>
          </Option>
          <Option
            class="app-item flex-row"
            v-for="item in appList"
            :label="item.name"
            :value="item.id"
            :key="item.id"
          >
            <img v-if="item.icon" class="icon" :src="item.icon" />
            <div class="app-info">
              <div class="name f-ellipsis">{{ `${item.name}` }}</div>
              <div class="desc f-ellipsis">{{ `id: [...${item.id.slice(-8)}]` }}</div>
            </div>
          </Option>
        </Select>
      </div>
      <div class="form-row flex-row">
        <div class="label">小程序名：</div>
        <i-input v-model="name" size="small" class="link-input" placeholder="请输入小程序名" />
      </div>
      <div class="form-row flex-row nomargin">
        <div class="label select-script">选择图标：</div>
        <Upload
          class="file-input"
          :disabled="iconUploadding || loadding"
          :before-upload="onIcon"
          accept="image/*"
        >
          <Button
            size="small"
            :disabled="iconUploadding || loadding"
            icon="ios-cloud-upload-outline"
          >{{iconName || '上传小图标(128*128)'}}</Button>
        </Upload>
      </div>
      <div class="form-row flex-row">
        <div class="label label-desc">程序介绍：</div>
        <i-input
          v-model="desc"
          size="small"
          class="link-input"
          maxlength="500"
          show-word-limit
          type="textarea"
        />
      </div>
      <div class="form-row flex-row nomargin">
        <div class="label select-script">选择脚本：</div>
        <Upload
          class="file-input"
          :disabled="scriptUploadding || loadding"
          :before-upload="onScript"
          accept="text/javascript, application/javascript"
        >
          <Button
            :disabled="scriptUploadding || loadding"
            size="small"
            icon="ios-cloud-upload-outline"
          >{{scriptName || '上传脚本'}}</Button>
        </Upload>
      </div>
      <div class="form-row flex-row">
        <div class="label">管理员密码：</div>
        <i-input
          v-model="pwd"
          size="small"
          type="password"
          class="link-input"
          placeholder="输入管理员密码"
        />
      </div>
    </div>
    <Button
      size="primary"
      :loading="loadding"
      icon="md-cloud-upload"
      @click="publish"
    >{{selectApp === "create"?"发布": "更新"}}</Button>
  </div>
</template>
<script lang="ts">
import { Input, Upload, Button, Message, Notice, Select, Option } from "iview";
import { Component, Vue } from "vue-property-decorator";
import utils from "../utils";
import { App } from "../types";

@Component({
  components: {
    "i-input": Input,
    Upload,
    Button,
    Message,
    Notice,
    Select,
    Option
  }
})
export default class extends Vue {
  scriptName: string = "";
  iconName: string = "";
  iconContent: string = "";
  iconUploadding: boolean = false;
  scriptUploadding: boolean = false;
  scriptContent: string = "";
  pwd: string = "";
  desc: string = "";
  name: string = "";
  loadding: boolean = false;
  selectApp: string = "create";
  appList: App[] = [];
  onIcon(file: File) {
    if (!file) {
      return false;
    }
    if (file.size > 1024 * 25) {
      this.$message.warning("请压缩图标在25k以内");
      return false;
    }
    this.iconName = file.name;
    this.iconContent = "";
    this.iconUploadding = true;
    const reader = new FileReader();
    reader.onloadend = evt => {
      // @ts-ignore
      if (evt.target.readyState == FileReader.DONE) {
        // @ts-ignore
        this.iconContent = evt.target.result;
        this.iconUploadding = false;
      }
    };
    reader.readAsDataURL(file);
    return false;
  }
  onScript(file: File) {
    if (!file) {
      return false;
    }
    if (file.size > 1024 * 1024 * 10) {
      this.$message.warning("请压缩脚本文件在10M以内,尝试外部引用资源文件");
      return false;
    }
    this.scriptName = file.name;
    this.scriptContent = "";
    this.scriptUploadding = true;
    const reader = new FileReader();
    reader.onloadend = evt => {
      // @ts-ignore
      if (evt.target.readyState == FileReader.DONE) {
        // @ts-ignore
        this.scriptContent = evt.target.result;
        this.scriptUploadding = false;
      }
    };
    reader.readAsText(file, "utf-8");
    return false;
  }

  created() {
    this.appList = JSON.parse(localStorage.getItem("LIST#APP") || "[]") || [];
  }

  reset() {
    this.iconName = "";
    this.iconContent = "";
    this.scriptContent = "";
    this.scriptName = "";
    this.name = "";
    this.desc = "";
  }

  changeSelector(id: string) {
    this.reset();
    if (id === "create") {
      return;
    }
    const app = (this.appList || []).find(it => it.id === id);
    if (app) {
      this.name = app.name || "";
      this.desc = app.desc || "";
    }
  }

  publish() {
    if (!this.name) {
      this.$message.error("请输入小程序名称");
      return;
    }
    if (!this.desc) {
      this.$message.error("请输入小程序描述");
      return;
    }

    if (!this.pwd) {
      this.$message.error("请输入管理员密码");
      return;
    }

    if (this.selectApp !== "create") {
      this.loadding = true;
      // 修改小程序
      utils
        .RMI(
          "uploadApp",
          "modify",
          {
            id: this.selectApp,
            name: this.name,
            icon: this.iconContent || "",
            script: this.scriptContent || "",
            desc: this.desc || ""
          },
          this.pwd
        )
        .then(({ result }: any) => {
          this.loadding = false;
          console.log("modify result: ", result);
          if (result && result.status === 0) {
            this.reset();
            this.$message.success("修改成功");
            utils.RMI("updateConfig").then((res: any) => {
              if (res.status !== 0) {
                this.$message.error("加载配置失败");
                return;
              }
              this.$message.success("已同步配置");
            });
            return;
          }
          this.$message.error(
            `修改失败，msg:${(result && result.msg) || "none"}`
          );
        });
      return;
    }
    // 新建小程序
    if (!this.iconContent) {
      this.$message.error("请上传小程序图标");
      return;
    }
    if (!this.scriptContent) {
      this.$message.error("请上传脚本文件");
      return;
    }
    this.loadding = true;
    utils
      .RMI(
        "uploadApp",
        "create",
        {
          name: this.name,
          icon: this.iconContent,
          script: this.scriptContent,
          desc: this.desc
        },
        this.pwd
      )
      .then(({ result }: any) => {
        this.loadding = false;
        console.log("create result: ", result);
        if (result && result.status === 0) {
          this.reset();
          this.$message.success("上传成功");
          utils.RMI("updateConfig").then((res: any) => {
            if (res.status !== 0) {
              this.$message.error("加载配置失败");
              return;
            }
            this.$message.success("已同步配置");
          });
          return;
        }
        this.$message.error(`上传失败,msg:${(result && result.msg) || "none"}`);
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
  .label {
    width: 80px;
    text-align: right;
    flex-shrink: 0;
    &.label-desc {
      align-self: flex-start;
    }
  }
  .select-script {
    position: relative;
    top: -4px;
  }

  .info {
    width: 100%;
    .form-row {
      margin-bottom: 8px;
      width: 100%;
      align-items: center;
    }
    .ivu-select {
      overflow: hidden;
    }
    .nomargin {
      margin-bottom: 0;
    }
    .select-app {
      .app-item {
        width: 140px;
        padding: 7px;
        .icon {
          width: 25px;
          height: 25px;
          margin-right: 6px;
        }
        .app-info {
          overflow: hidden;
          flex: 1;
          .name {
            font-size: 14px;
            color: rgb(59, 59, 59);
          }
          .desc {
            color: rgb(177, 177, 177);
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>