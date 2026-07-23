<template>
  <SearchBarGeneric
    :title="$t('view.stock.stockBalanceSummary.searchTitle')"
    :description="$t('view.stock.stockBalanceSummary.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.stock.stockBalanceSummary.location') }}</span>
        <DropdownGeneric
          v-model="form.locationCode"
          :options="locationOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
      <ButtonGeneric
        variant="green"
        icon="bi-filetype-csv"
        class="ml-2"
        :title="$t('common.btn.export')"
        :disabled="!stockBalanceStore.byLocation.length"
        @click="onExport"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useStockBalanceApiStore } from '@/stores/modules/api/stock/stock-balance-api.js'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

export default {
  name: 'StockBalanceSummarySearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    DropdownGeneric
  },

  setup() {
    const stockBalanceStore = useStockBalanceApiStore()
    const locationStore = useStockLocationApiStore()
    return { stockBalanceStore, locationStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['search', 'clear'],

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },

  data() {
    return {
      form: { ...this.modelForm }
    }
  },

  computed: {
    locationOptions() {
      return this.locationStore.all
        .filter((item) => item.isActive)
        .map((item) => ({ value: item.code, label: `${item.code} — ${item.nameTh}` }))
    }
  },

  async created() {
    await this.locationStore.fetchAllForMap()
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    onExport() {
      this.stockBalanceStore.exportByLocation()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
