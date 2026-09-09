<template>
  <div class="expand-container">
    <div class="expand-grid">
      <SectionCardGeneric :title="$t('view.stock.product.materialsTitle')" headerStyle="legend" icon="bi-gem" accent="main">
        <materialTable :items="row.materials || []" variant="compact" />
      </SectionCardGeneric>
      <SectionCardGeneric :title="$t('view.stock.product.balanceTitle')" headerStyle="legend" icon="bi-box-seam" accent="main">
        <balancePanel :item="row" />
      </SectionCardGeneric>
    </div>
  </div>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

import materialTable from '../../components/material-table.vue'
import balancePanel from '../../components/balance-panel.vue'

export default {
  name: 'DataExpand',

  components: {
    SectionCardGeneric,
    materialTable,
    balancePanel
  },

  props: {
    modelForm: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },

  computed: {
    row() {
      return this.modelForm.data || {}
    }
  }
}
</script>

<style lang="scss" scoped>
.expand-container {
  position: sticky;
  left: 0;
  max-width: min(1200px, calc(100vw - 4 * var(--sp-2xl)));
  padding: var(--sp-md) var(--sp-lg);
}

.expand-grid {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: var(--sp-lg);
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}
</style>
