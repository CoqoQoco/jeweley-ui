<template>
  <div class="message-box">
    <div class="message-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style scoped>
.message-box {
  display: inline-block;
  width: 25%; /* แบ่งเป็น 4 ส่วนเท่าๆกันในแนวนอน */
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  margin-right: 10px;
}

.message-content {
  /* ปรับแต่งสไตล์ของเนื้อหาในกล่องข้อความ */
}
</style>
