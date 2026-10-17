<template>
  <div class="piece-summary">
    <div class="summary-row main-code">
      <span class="summary-label">{{ $t('view.mobile.rfidBind.pieceStockNumber') }}</span>
      <span class="summary-value">{{ stockNumber }}</span>
    </div>
    <div v-if="stockNumberOrigin" class="summary-row">
      <span class="summary-label">{{ $t('view.mobile.rfidBind.pieceStockNumberOrigin') }}</span>
      <span class="summary-value">{{ stockNumberOrigin }}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">{{ $t('view.mobile.rfidBind.pieceProductCode') }}</span>
      <span class="summary-value">{{ productCode }}</span>
    </div>
    <div v-if="name" class="summary-row">
      <span class="summary-label">{{ $t('view.mobile.rfidBind.pieceName') }}</span>
      <span class="summary-value">{{ name }}</span>
    </div>
    <div v-if="location" class="summary-row">
      <span class="summary-label">{{ $t('view.mobile.rfidBind.pieceLocation') }}</span>
      <span class="summary-value">{{ location }}</span>
    </div>
    <div v-if="status" class="summary-row">
      <span class="summary-label">{{ $t('view.mobile.rfidBind.pieceStatus') }}</span>
      <span class="summary-value">{{ status }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RfidPieceSummary',

  props: {
    stockNumber: { type: String, required: true },
    stockNumberOrigin: { type: String, default: '' },
    productCode: { type: String, default: '' },
    name: { type: String, default: '' },
    location: { type: String, default: '' },
    status: { type: String, default: '' }
  }
}
</script>

<style lang="scss" scoped>
.piece-summary {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-md);
}

.summary-label {
  color: var(--base-sub-color);
  flex-shrink: 0;
}

.summary-value {
  color: var(--base-font-sub-color);
  font-weight: 600;
  text-align: right;
  word-break: break-all;
}

.main-code .summary-value {
  color: var(--base-font-color);
  font-size: 1.15rem;
}
</style>
