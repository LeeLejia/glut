<template>
  <div class="groupId-input-container">
    <div class="title f-normal">通过设置 GroupId 获取你的 Glut 应用</div>
    <div class="input-box flex-row">
      <i-input
        class="groupid-input"
        icon="ios-help-circle-outline"
        v-model="groupId"
        placeholder="请设定GroupId"
        @on-click="question"
        autocomplete
      />
      <i-button type="primary" shape="circle" :loading="handle" @click="confirm">OK</i-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Input, Button } from "iview";
import { Component, Vue } from "vue-property-decorator";
import { Message, Notice } from "iview";
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
  components: { "i-input": Input, "i-button": Button }
})
export default class extends Vue {
  groupId: string = "";
  handle: boolean = false;
  created() {
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
  // methods
  confirm(): void {
    if (!this.groupId.trim()) {
      this.$message.error("请输入先groupId");
      return;
    }
    this.handle = true;
    const msg = this.$message.loading({
      content: "同步配置中...",
      duration: 0
    });
    utils.RMI("updateConfig", this.groupId.trim()).then((res: any) => {
      msg();
      this.handle = false;
      if (res.status !== 0) {
        this.$message.error(res.result || "请输入有效的GroupId");
        this.$emit("updateConfig", false);
        return;
      }
      this.$message.success("设置成功！");
      this.$emit("updateConfig", true);
    });
  }
}
</script>

<style lang="scss">
@import "../styles/index.scss";
.groupId-input-container {
  width: 80%;
  margin: auto;
  padding: 20px;

  .title {
    margin-bottom: 20px;
    text-align: left;
    color: #aaaaaa;
  }

  .input-box {
    .groupid-input {
      margin-right: 5px;
    }
    input {
      border-radius: 16px;
      text-align: center;
    }
  }
}
</style>
