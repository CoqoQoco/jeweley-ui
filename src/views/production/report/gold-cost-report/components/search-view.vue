<template>
  <SearchBarGeneric
    :title="$t('view.production.goldCostReport.searchTitle')"
    :description="$t('view.production.goldCostReport.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.goldCostReport.dateRange') }}</span>
        <DateRangeGeneric
          :startDate="form.createStart"
          :endDate="form.createEnd"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.createStart = $event"
          @update:endDate="form.createEnd = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.goldCostReport.bookNo') }}</span>
        <InputTextGeneric
          v-model.trim="form.bookNo"
          :placeholder="$t('view.production.goldCostReport.placeholder.bookNo')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.goldCostReport.no') }}</span>
        <InputTextGeneric
          v-model.trim="form.no"
          :placeholder="$t('view.production.goldCostReport.placeholder.no')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.goldCostReport.runningNumber') }}</span>
        <InputTextGeneric
          v-model.trim="form.runningNumber"
          :placeholder="$t('view.production.goldCostReport.placeholder.runningNumber')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.goldCostReport.searchText') }}</span>
        <InputTextGeneric
          v-model.trim="form.text"
          :placeholder="$t('view.production.goldCostReport.placeholder.searchText')"
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
        :disabled="!goldCostReportStore.dataSearch.total"
        @click="onExport"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useGoldCostReportApiStore } from '@/stores/modules/api/production/gold-cost-report-api.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'

export default {
  name: 'GoldCostReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    DateRangeGeneric
  },

  setup() {
    const goldCostReportStore = useGoldCostReportApiStore()
    return { goldCostReportStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['search', 'clear', 'export'],

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
      this.$emit('export', this.form)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
