<template>
  <SearchBarGeneric
    :title="$t('view.stock.materialValuationReport.searchTitle')"
    :description="$t('view.stock.materialValuationReport.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.stock.materialValuationReport.productType') }}</span>
        <DropdownGeneric
          v-model="form.productType"
          :options="masterApiStore.productType"
          optionLabel="description"
          optionValue="code"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.materialValuationReport.region') }}</span>
        <InputTextGeneric
          v-model.trim="form.region"
          :placeholder="$t('view.stock.materialValuationReport.placeholder.region')"
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
        :disabled="!materialValuationStore.byType.length"
        @click="onExport"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useMaterialValuationReportApiStore } from '@/stores/modules/api/stock/material-valuation-report-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

export default {
  name: 'MaterialValuationReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    DropdownGeneric
  },

  setup() {
    const materialValuationStore = useMaterialValuationReportApiStore()
    const masterApiStore = useMasterApiStore()
    return { materialValuationStore, masterApiStore }
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

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    onExport() {
      this.materialValuationStore.exportByType()
    }
  },

  created() {
    this.masterApiStore.fetchProductType()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
