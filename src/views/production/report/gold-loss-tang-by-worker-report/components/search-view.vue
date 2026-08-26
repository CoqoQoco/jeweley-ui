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
        <DropdownGeneric
          v-model="form.workerCode"
          :options="workers"
          optionLabel="label"
          optionValue="code"
          :filter="true"
          :showClear="true"
          :placeholder="$t('view.production.goldLossTangByWorker.placeholder.workerCode')"
        />
      </div>
    </template>

    <template #actions-left>
      <CheckboxGeneric
        v-model="form.groupByMonth"
        :label="$t('view.production.goldLossTangByWorker.groupByMonth')"
      />
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
import api from '@/axios/axios-helper.js'
import { useGoldLossTangByWorkerApiStore } from '@/stores/modules/api/production/gold-loss-tang-by-worker-api.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'

export default {
  name: 'GoldLossTangByWorkerReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    DateRangeGeneric,
    DropdownGeneric,
    CheckboxGeneric
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
      form: { ...this.modelForm },
      workers: []
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
    },
    async loadWorkers() {
      const res = await api.jewelry.post('Worker/Search', {
        take: 0,
        skip: 0,
        search: { type: 50, active: 1 }
      })
      if (res && res.data) {
        this.workers = res.data.map((w) => {
          const code = w.code || w.workerCode || ''
          const name = w.nameTh || w.name || w.workerName || ''
          return { code, name, label: `${code} - ${name}` }
        })
      }
    }
  },

  created() {
    this.loadWorkers()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
