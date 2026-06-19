<template>
  <div class="box-welcome">
    <img src="@/assets/duangkaew-logo.png" />
    <label class="txt-title">{{ $t('view.dashboard.welcomeDesc') }}</label>
    <label class="txt-title"> Version 1.0.0</label>
  </div>
  <div>
    <label class="txt-foot float-right mr-2">{{ $t('view.dashboard.companyFooter') }}</label>
  </div>
</template>

<script>
//import { version } from 'vue';

export default {}
</script>

<style lang="scss" scoped>
.box-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 90px);
  text-align: center;
  .txt-title {
    font-size: 30px;
    color: var(--base-font-color);
  }
}
.txt-foot {
  //font-size: 30px;
  color: var(--base-font-color);
}
</style>
