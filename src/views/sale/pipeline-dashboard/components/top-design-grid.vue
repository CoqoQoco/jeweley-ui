<template>
  <div class="top-design-block">
    <div class="top-design-header">
      <h6 class="top-design-title">{{ $t('view.sale.pipelineDashboard.topDesignTitle') }}</h6>
      <div class="top-design-header-controls">
        <span class="title-text top-design-sort-label">{{ $t('view.sale.pipelineDashboard.topDesignSortLabel') }}</span>
        <ToggleGroupGeneric
          v-model="sortBy"
          :options="sortOptions"
          :ariaLabel="$t('view.sale.pipelineDashboard.topDesignSortLabel')"
        />
      </div>
    </div>

    <p class="top-design-total">
      {{
        $t('view.sale.pipelineDashboard.topDesignTotal', {
          designs: formatCount(topDesign.totalDesignCount),
          pieces: formatCount(topDesign.totalPieceCount)
        })
      }}
    </p>

    <div v-if="topDesign.designs.length" class="design-grid">
      <div
        v-for="(design, index) in topDesign.designs"
        :key="design.designKey"
        class="design-card"
        role="button"
        tabindex="0"
        :aria-label="$t('view.sale.pipelineDashboard.topDesignOpenDetail', { code: design.designKey })"
        @click="onOpenDetail(design)"
        @keydown.enter.prevent="onOpenDetail(design)"
        @keydown.space.prevent="onOpenDetail(design)"
      >
        <span class="design-card-rank">#{{ index + 1 }}</span>

        <div class="design-card-image">
          <ImagePreview :imageName="design.imageBlobPath || ''" :width="160" :height="160" :preview="false" />
        </div>

        <div class="design-card-code">{{ design.designKey }}</div>
        <div class="design-card-type">{{ design.productTypeName }}</div>

        <div class="design-card-stats">
          <span>{{ $t('view.sale.pipelineDashboard.topDesignPieces', { count: formatCount(design.pieceCount) }) }}</span>
          <span>{{ $t('view.sale.pipelineDashboard.topDesignAmount', { amount: formatMoneyValue(design.amountThb) }) }}</span>
        </div>

        <div v-if="design.golds && design.golds.length" class="design-card-chips">
          <span v-for="(gold, idx) in design.golds" :key="`${gold}-${idx}`" class="design-chip">{{ gold }}</span>
        </div>

        <div class="design-card-items">
          <i class="bi bi-search"></i>
          {{ $t('view.sale.pipelineDashboard.topDesignItems', { count: designItemCount(design) }) }}
        </div>
      </div>
    </div>

    <p v-else class="design-empty">{{ $t('common.label.noData') }}</p>

    <div v-if="topDesign.totalDesignCount > defaultTake" class="top-design-more">
      <ButtonGeneric
        variant="outline"
        :label="isExpanded ? $t('view.sale.pipelineDashboard.topDesignShowLess') : $t('view.sale.pipelineDashboard.topDesignShowMore', { count: expandedTake })"
        @click="isExpanded = !isExpanded"
      />
    </div>

    <p class="summary-note">
      <i class="bi bi-info-circle"></i>
      {{ $t('view.sale.pipelineDashboard.topDesignNote') }}
    </p>

    <topDesignDetailModal :isShow="isShowDetail" :design="selectedDesign" @closeModal="isShowDetail = false" />
  </div>
</template>

<script>
import { useSaleReportApiStore } from '@/stores/modules/api/sale/sale-report-api.js'
import { formatMoney } from '@/services/utils/decimal.js'

import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ImagePreview from '@/components/prime-vue/ImagePreview.vue'
import topDesignDetailModal from '../modal/top-design-detail-modal.vue'

const DEFAULT_TAKE = 10
const EXPANDED_TAKE = 50

export default {
  name: 'SalePipelineDashboardTopDesignGrid',

  components: {
    ToggleGroupGeneric,
    ButtonGeneric,
    ImagePreview,
    topDesignDetailModal
  },

  setup() {
    const saleReportStore = useSaleReportApiStore()
    return { saleReportStore }
  },

  props: {
    filter: {
      type: Object,
      default: () => ({})
    },
    productTypes: {
      type: Array,
      default: () => []
    },
    golds: {
      type: Array,
      default: () => []
    },
    goldSizes: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      sortBy: 'pieces',
      isExpanded: false,
      selectedDesign: null,
      isShowDetail: false
    }
  },

  computed: {
    topDesign() {
      return this.saleReportStore.topDesign
    },

    sortOptions() {
      return [
        { value: 'pieces', label: this.$t('view.sale.pipelineDashboard.topDesignSortPieces') },
        { value: 'amount', label: this.$t('view.sale.pipelineDashboard.topDesignSortAmount') }
      ]
    },

    defaultTake() {
      return DEFAULT_TAKE
    },

    expandedTake() {
      return EXPANDED_TAKE
    }
  },

  watch: {
    filter: {
      handler() {
        this.fetchData()
      },
      deep: true,
      immediate: true
    },

    productTypes: {
      handler() {
        this.fetchData()
      },
      deep: true
    },

    golds: {
      handler() {
        this.fetchData()
      },
      deep: true
    },

    goldSizes: {
      handler() {
        this.fetchData()
      },
      deep: true
    },

    sortBy() {
      this.fetchData()
    },

    isExpanded() {
      this.fetchData()
    }
  },

  methods: {
    fetchData() {
      this.saleReportStore.fetchTopDesignSales(this.filter, {
        productTypes: this.productTypes,
        golds: this.golds,
        goldSizes: this.goldSizes,
        sortBy: this.sortBy,
        take: this.isExpanded ? EXPANDED_TAKE : DEFAULT_TAKE
      })
    },

    onOpenDetail(design) {
      this.selectedDesign = design
      this.isShowDetail = true
    },

    designItemCount(design) {
      return (design.items || []).length
    },

    formatMoneyValue(value) {
      return formatMoney(value)
    },

    formatCount(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.top-design-block {
  margin-top: var(--sp-lg);
}

.top-design-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-xs);
}

.top-design-title {
  margin: 0;
  color: var(--base-font-color);
  font-weight: 600;
  font-size: var(--fs-lg);
}

.top-design-header-controls {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);

  .top-design-sort-label {
    white-space: nowrap;
    font-weight: 600;
  }
}

.top-design-total {
  margin: 0 0 var(--sp-lg);
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}

.design-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--sp-lg);
  margin-bottom: var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.design-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  background: var(--color-card-bg);
  padding: var(--sp-md);
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--base-green);
  }

  &:focus-visible {
    outline: 2px solid var(--base-green);
    outline-offset: 2px;
  }
}

.design-card-rank {
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--base-green);
  margin-bottom: var(--sp-xs);
}

.design-card-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  margin-bottom: var(--sp-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-highlight-bg);
  border-radius: var(--radius-sm);
  overflow: hidden;

  // ImagePreview บังคับ width/height เป็น HTML attribute บนตัว <img> จริง (ไม่ผ่าน CSS)
  // override ให้เต็มกล่อง aspect-ratio 1:1 แทนขนาด fix ที่ส่งเข้าไปตอนเรียกใช้
  :deep(.p-image) {
    display: flex;
    width: 100%;
    height: 100%;
  }

  :deep(.p-image img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.design-card-code {
  font-weight: 700;
  color: var(--base-font-color);
  text-align: center;
}

.design-card-type {
  text-align: center;
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
  margin-bottom: var(--sp-sm);
}

.design-card-stats {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--base-font-color);
  margin-bottom: var(--sp-sm);
}

.design-card-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-xs);
  margin-bottom: var(--sp-sm);
}

.design-chip {
  background: var(--color-highlight-bg);
  color: var(--base-font-color);
  border-radius: var(--radius-sm);
  padding: 1px var(--sp-xs);
  font-size: var(--fs-sm);
}

.design-card-items {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}

.design-empty {
  text-align: center;
  color: var(--base-sub-color);
  padding: var(--sp-2xl) 0;
  margin-bottom: var(--sp-lg);
}

.top-design-more {
  display: flex;
  justify-content: center;
  margin-bottom: var(--sp-lg);
}

.summary-note {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  margin: 0;
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}
</style>
