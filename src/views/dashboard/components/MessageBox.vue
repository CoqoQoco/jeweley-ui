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

<style lang="scss" scoped>
.message-box {
  display: inline-block;
  width: 25%;
  padding: var(--sp-sm);
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  margin-right: var(--sp-sm);
}
</style>
