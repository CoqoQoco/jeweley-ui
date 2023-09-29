<template>
  <div class="box-welcome">
    <img src="@/assets/duangkaew-logo.png" />
    <label class="txt-title">
      ยินดีต้อนรับสู่เครื่องมือบริหารเเละจัดการ ผลิต/จัดเก็บ/ขาย/บริการ สินค้า
    </label>
    <label class="txt-title"> Version 0.0.01</label>
  </div>
  <div>
    <label class="txt-foot float-right mr-2">@บริษัท ดวงแก้วจิวเวลรี่ แมนูแฟคเจอเรอร์</label>
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
