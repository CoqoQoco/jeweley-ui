<template>
  <SearchBarGeneric
    :title="$t('view.production.goldLossTangByWorker.searchTitle')"
    :description="$t('view.production.goldLossTangByWorker.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.goldLossTangByWorker.dateRange') }}</span>
        <DateRangeGeneric
          :startDate="form.requestDateStart"
          :endDate="form.requestDateEnd"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.requestDateStart = $event"
          @update:endDate="form.requestDateEnd = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.goldLossTangByWorker.workerCode') }}</span>
        <InputTextGeneric
          v-model.trim="form.workerCode"
          :placeholder="$t('view.production.goldLossTangByWorker.placeholder.workerCode')"
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
        :disabled="!goldLossTangByWorkerStore.dataSearch.total"
        @click="onExport"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useGoldLossTangByWorkerApiStore } from '@/stores/modules/api/production/gold-loss-tang-by-worker-api.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'

export default {
  name: 'GoldLossTangByWorkerReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    DateRangeGeneric
  },

  setup() {
    const goldLossTangByWorkerStore = useGoldLossTangByWorkerApiStore()
    return { goldLossTangByWorkerStore }
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
