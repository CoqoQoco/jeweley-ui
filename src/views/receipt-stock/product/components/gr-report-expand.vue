<template>
  <div class="expand-container">
    <div class="expand-hint">
      <i class="bi bi-info-circle"></i>
      {{ $t('view.receiptStock.product.reportGr.expandCurrentHint') }}
    </div>
    <div class="expand-grid">
      <SectionCardGeneric
        class="area-product"
        :title="$t('view.receiptStock.product.reportGr.expandProductTitle')"
        headerStyle="legend"
        icon="bi-box-seam"
        accent="main"
      >
        <div class="product-box">
          <div class="product-image">
            <imagePreview v-if="row.imagePath" :imageName="row.imagePath" type="STOCK-PRODUCT" :width="64" :height="64" />
            <div v-else class="image-empty">{{ $t('view.receiptStock.product.reportGr.expandNoImage') }}</div>
          </div>
          <div class="product-info">
            <div class="product-number">{{ row.productNumber || '—' }}</div>
            <div class="product-name">{{ row.productNameTh || '—' }}</div>
            <div class="product-name product-name--sub">{{ row.productNameEn || '—' }}</div>
          </div>
        </div>
        <dl class="detail-list detail-list--cols">
          <template v-for="item in detailItems" :key="item.key">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value || '—' }}</dd>
          </template>
        </dl>
      </SectionCardGeneric>

      <SectionCardGeneric
        class="area-materials"
        :title="materialsTitle"
        headerStyle="legend"
        icon="bi-gem"
        accent="main"
      >
        <materialTable :items="materials" variant="full" />
      </SectionCardGeneric>

      <SectionCardGeneric
        class="area-summary"
        :title="$t('view.receiptStock.product.reportGr.expandSummaryTitle')"
        headerStyle="legend"
        icon="bi-calculator"
        accent="main"
      >
        <dl class="detail-list">
          <template v-for="item in summaryItems" :key="item.key">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </template>
        </dl>
        <div class="price-block">
          <div class="price-label">{{ $t('view.receiptStock.product.reportGr.colSalesPrice') }}</div>
          <div class="price-value">
            {{ formatReportNumber(row.productPrice, 2) }}
            <span class="price-unit">{{ $t('view.receiptStock.product.reportGr.expandCurrency') }}</span>
          </div>
        </div>
        <a :href="detailHref" target="_blank" rel="noopener" class="btn btn-green btn-sm detail-link">
          <i class="bi bi-eye"></i>
          {{ $t('view.receiptStock.product.reportGr.expandViewDetail') }}
        </a>
      </SectionCardGeneric>
    </div>
  </div>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import imagePreview from '@/components/prime-vue/ImagePreview.vue'

import materialTable from '@/views/stock/product/components/material-table.vue'
import { formatReportNumber } from '@/services/helper/goods-receipt-report/goods-receipt-report.js'

const I18N = 'view.receiptStock.product.reportGr.'

export default {
  name: 'GrReportExpand',

  components: {
    SectionCardGeneric,
    imagePreview,
    materialTable
  },

  props: {
    row: {
      type: Object,
      required: true,
      default: () => ({})
    },
    mode: {
      type: String,
      default: 'production',
      validator: (v) => ['production', 'outsource'].includes(v)
    }
  },

  computed: {
    materials() {
      return Array.isArray(this.row.materials) ? this.row.materials : []
    },
    materialsTitle() {
      return this.$t(`${I18N}expandMaterialsTitle`, { count: this.materials.length })
    },
    detailHref() {
      return this.$router.resolve({ name: 'stock-product-detail', params: { stockNumber: this.row.stockNumber } }).href
    },
    statusLabel() {
      const keys = { IN_STOCK: 'inStock', RESERVED: 'reserved', SOLD: 'sold' }
      const key = keys[this.row.status]
      return key ? this.$t(`view.stock.product.${key}`) : this.row.status
    },
    detailItems() {
      const r = this.row
      const t = (key) => this.$t(`${I18N}${key}`)
      const items = [
        { key: 'status', label: t('expandStatus'), value: this.statusLabel },
        { key: 'location', label: t('colLocation'), value: r.location },
        { key: 'mold', label: t('mold'), value: r.mold }
      ]
      if (this.mode === 'outsource') {
        items.push({ key: 'vendor', label: t('colVendor'), value: [r.vendor, r.poNumber].filter(Boolean).join(' / ') })
      } else {
        items.push({ key: 'productionType', label: t('colProductionType'), value: r.productionType })
      }
      items.push(
        { key: 'receiptNumber', label: t('expandReceiptNumber'), value: r.receiptNumber },
        { key: 'createBy', label: t('colCreateBy'), value: r.createBy },
        { key: 'remark', label: t('colRemark'), value: r.remark }
      )
      return items
    },
    summaryItems() {
      const r = this.row
      const t = (key) => this.$t(`${I18N}${key}`)
      const sum = (...fields) => fields.reduce((acc, f) => acc + (Number(r[f]) || 0), 0)
      const stone = (qty, weight) =>
        `${formatReportNumber(qty, 0)} · ${formatReportNumber(weight, 3)} ${t('expandCarat')}`
      return [
        { key: 'qty', label: t('expandQtyReceived'), value: `${formatReportNumber(r.qty, 0)} ${t('expandPieceUnit')}` },
        { key: 'gold', label: t('expandGoldTotal'), value: `${formatReportNumber(r.goldWeight, 2)} ${t('expandGram')}` },
        { key: 'diamond', label: t('stoneDiamond'), value: stone(r.diamondQty, r.diamondWeight) },
        {
          key: 'color',
          label: t('expandColorStone'),
          value: stone(
            sum('rubyQty', 'sapphireQty', 'emeraldQty', 'otherQty'),
            sum('rubyWeight', 'sapphireWeight', 'emeraldWeight', 'otherWeight')
          )
        }
      ]
    }
  },

  mounted() {
    this.$nextTick(this.scrollRowToTop)
  },

  methods: {
    formatReportNumber,

    scrollRowToTop() {
      const expansionRow = this.$el?.closest?.('tr')
      const dataRow = expansionRow?.previousElementSibling
      const wrapper = expansionRow?.closest?.('.p-datatable-wrapper')
      if (!dataRow || !wrapper || typeof wrapper.scrollTo !== 'function') return
      const headHeight = wrapper.querySelector('thead')?.offsetHeight || 0
      const top = wrapper.scrollTop + dataRow.getBoundingClientRect().top - wrapper.getBoundingClientRect().top - headHeight
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
      wrapper.scrollTo({ top: Math.max(top, 0), behavior: reduce ? 'auto' : 'smooth' })
    }
  }
}
</script>

<style lang="scss" scoped>
.expand-container {
  position: sticky;
  left: 0;
  max-width: min(1400px, calc(100vw - 4 * var(--sp-2xl)));
  padding: var(--sp-sm) var(--sp-md);
}

.expand-hint {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  margin-bottom: var(--sp-sm);
  padding: var(--sp-xs) var(--sp-md);
  border-radius: var(--radius-md);
  background-color: var(--status-closed-bg);
  color: var(--base-sub-color);
  font-size: var(--fs-base);
}

.expand-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 320px);
  grid-template-areas:
    'materials materials'
    'product summary';
  gap: var(--sp-md);
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'materials'
      'product'
      'summary';
  }
}

.area-product {
  grid-area: product;
}

.area-materials {
  grid-area: materials;
}

.area-summary {
  grid-area: summary;
}

.product-box {
  display: flex;
  gap: var(--sp-md);
  margin-bottom: var(--sp-sm);
}

.product-image {
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
}

.image-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  opacity: 0.6;
}

.product-number {
  font-weight: 700;
}

.product-name--sub {
  opacity: 0.7;
  font-size: var(--fs-sm);
}

.detail-list {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: var(--sp-xs) var(--sp-md);
  margin: 0;

  dt {
    font-weight: 400;
    opacity: 0.7;
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
}

.detail-list--cols {
  grid-template-columns: repeat(3, max-content minmax(0, 1fr));
  column-gap: var(--sp-lg);

  @media (max-width: 1365px) {
    grid-template-columns: repeat(2, max-content minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: max-content minmax(0, 1fr);
  }
}

.price-block {
  margin: var(--sp-sm) 0;
}

.price-unit {
  font-size: var(--fs-base);
  font-weight: 400;
}

.price-label {
  font-size: var(--fs-sm);
  opacity: 0.7;
}

.price-value {
  font-size: var(--fs-xl, 1.5rem);
  font-weight: 700;
}
</style>
