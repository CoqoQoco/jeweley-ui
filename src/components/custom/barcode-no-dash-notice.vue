<template>
  <div class="barcode-no-dash-notice" role="note">
    <i class="bi bi-info-circle-fill notice-icon"></i>
    <span>{{ $t('common.label.labelNoDashNotice') }}</span>
  </div>
</template>

<script>
export default {
  name: 'BarcodeNoDashNotice'
}
</script>

<style lang="scss" scoped>
.barcode-no-dash-notice {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-sm);
  padding: var(--sp-sm) var(--sp-md);
  border: 1px solid var(--base-green);
  border-radius: var(--radius-sm);
  background: var(--color-green-bg);
  color: var(--base-font-color);
  font-size: var(--fs-sm);
  line-height: var(--lh-md);
}

.notice-icon {
  flex-shrink: 0;
  color: var(--base-green);
}
</style>
