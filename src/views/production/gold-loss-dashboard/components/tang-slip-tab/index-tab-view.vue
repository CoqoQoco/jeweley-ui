<template>
  <div>
    <SourceStripGeneric source="slip-tang" />

    <div class="local-filter-row">
      <CheckboxGeneric
        v-model="localGroupByMonth"
        :label="$t('view.production.goldLossTangByWorker.groupByMonth')"
      />
      <ButtonGeneric
        variant="green"
        icon="bi-filetype-csv"
        class="local-filter-export"
        :title="$t('common.btn.export')"
        :disabled="!goldLossTangByWorkerStore.dataSearch.total"
        @click="onExport"
      />
    </div>

    <StatCardsView :modelForm="mergedFilter" />
    <DataTableView :modelForm="mergedFilter" :modelFormExport="formExport" />
  </div>
</template>

<script>
import { useGoldLossTangByWorkerApiStore } from '@/stores/modules/api/production/gold-loss-tang-by-worker-api.js'

import SourceStripGeneric from '@/components/generic/SourceStripGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import StatCardsView from './stat-cards-view.vue'
import DataTableView from './data-table-view.vue'

export default {
  name: 'GoldLossTangSlipTabView',

  components: {
    SourceStripGeneric,
    ButtonGeneric,
    CheckboxGeneric,
    StatCardsView,
    DataTableView
  },

  setup() {
    const goldLossTangByWorkerStore = useGoldLossTangByWorkerApiStore()
    return { goldLossTangByWorkerStore }
  },

  props: {
    filter: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      localGroupByMonth: false,
      formExport: {}
    }
  },

  computed: {
    mergedFilter() {
      return {
        requestDateStart: this.filter.start,
        requestDateEnd: this.filter.end,
        workerCode: this.filter.workerCode,
        groupByMonth: this.localGroupByMonth
      }
    }
  },

  methods: {
    onExport() {
      this.formExport = { ...this.mergedFilter }
    }
  }
}
</script>

<style lang="scss" scoped>
.local-filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-lg);
}
</style>
