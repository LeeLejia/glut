<template>
  <div id="app" class="font-normal">
    <Panel v-if="groupIdValid"></Panel>
    <InputGroupId v-else @updateConfig="checkGroupId"></InputGroupId>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import InputGroupId from "./components/inputGroupId.vue";
import Panel from "./components/panel.vue";
declare let chrome: any;
// Todo delete 测试代码
if (!chrome || !chrome.storage) {
  chrome.storage = {
    sync: {
      get: () => ({ groupIdValid: true }),
      set: (_: any, callback: Function) => callback()
    }
  };
}

@Component({
  components: { InputGroupId, Panel }
})
export default class App extends Vue {
  groupIdValid: boolean = true;
  created() {
    this.checkGroupId();
  }
  checkGroupId() {
    chrome.storage.sync.get(
      { groupIdValid: false },
      (res: { groupIdValid: boolean }) => {
        this.groupIdValid = res.groupIdValid;
      }
    );
  }
}
</script>

<style lang="scss">
@import "~iview/dist/styles/iview.css";
@import "./styles/index.scss";
#app {
  width: 400px;
  background: white;
}
</style>