<template>
  <SearchBarGeneric
    :title="$t('view.stock.product.dashboard.searchTitle')"
    :description="$t('view.stock.product.dashboard.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.stock.product.dashboard.filterLocationLabel') }}</span>
        <MultiSelectGeneric
          v-model="form.locationCodes"
          :options="locationOptions"
          optionLabel="name"
          optionValue="code"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.product.dashboard.filterProductTypeLabel') }}</span>
        <MultiSelectGeneric
          v-model="form.productTypes"
          :options="productTypeOptions"
          optionLabel="name"
          optionValue="code"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.product.dashboard.filterGoldLabel') }}</span>
        <MultiSelectGeneric
          v-model="form.golds"
          :options="goldOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.product.dashboard.filterGoldSizeLabel') }}</span>
        <MultiSelectGeneric
          v-model="form.goldSizes"
          :options="goldSizeOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div class="date-range-field">
        <span class="title-text">{{ $t('view.stock.product.dashboard.salesRangeLabel') }}</span>
        <DateRangeGeneric
          :startDate="form.salesStart"
          :endDate="form.salesEnd"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.salesStart = $event"
          @update:endDate="form.salesEnd = $event"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useStockReportApiStore } from '@/stores/modules/api/stock/stock-report-api.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'

export default {
  name: 'StockProductDashboardSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    DateRangeGeneric,
    MultiSelectGeneric
  },

  setup() {
    const stockReportStore = useStockReportApiStore()
    return { stockReportStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['search', 'clear'],

  data() {
    return {
      form: { ...this.modelForm }
    }
  },

  computed: {
    // filterOptions มาจาก /Summary เท่านั้น (ยิงจาก summary-view) — ที่นี่แค่อ่านจาก store มาทำ dropdown
    filterOptions() {
      return this.stockReportStore.summary.filterOptions
    },

    locationOptions() {
      return this.filterOptions.locations || []
    },

    productTypeOptions() {
      return this.filterOptions.productTypes || []
    },

    goldOptions() {
      return (this.filterOptions.golds || []).map((g) => ({ value: g, label: g }))
    },

    goldSizeOptions() {
      return (this.filterOptions.goldSizes || []).map((g) => ({ value: g, label: g }))
    }
  },

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', { ...this.form })
    },

    onClear() {
      this.$emit('clear')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

// DateRangeGeneric มี 2 input + ลูกศรอยู่ในคอลัมน์เดียวกัน — ต้องกินพื้นที่ 2 คอลัมน์ของ
// .form-col-container (auto-fit minmax(240px,1fr)) ไม่งั้นแต่ละ input เหลือพื้นที่ไม่พอ ตัวเลขปี ค.ศ. โดนตัด
// (pattern เดียวกับ sale/invoice/components/search-view.vue .date-range-field)
:deep(.date-range-field) {
  grid-column: span 2;
}
</style>
