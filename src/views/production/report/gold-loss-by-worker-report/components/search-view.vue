<template>
  <SearchBarGeneric
    :title="$t('view.production.goldLossByWorkerAllStages.searchTitle')"
    :description="$t('view.production.goldLossByWorkerAllStages.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.goldLossByWorkerAllStages.dateRange') }}</span>
        <DateRangeGeneric
          :startDate="form.start"
          :endDate="form.end"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.start = $event"
          @update:endDate="form.end = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.goldLossByWorkerAllStages.department') }}</span>
        <MultiSelectGeneric
          v-model="form.status"
          :options="masterApiStore.planStatus"
          optionLabel="nameTh"
          optionValue="id"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.goldLossByWorkerAllStages.gold') }}</span>
        <MultiSelectGeneric
          v-model="form.gold"
          :options="masterApiStore.gold"
          optionLabel="nameTh"
          optionValue="nameEn"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.goldLossByWorkerAllStages.workerCode') }}</span>
        <DropdownGeneric
          v-model="form.workerCode"
          :options="workers"
          optionLabel="label"
          optionValue="code"
          :filter="true"
          :showClear="true"
          :placeholder="$t('view.production.goldLossByWorkerAllStages.placeholder.workerCode')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.goldLossByWorkerAllStages.minJobCount') }}</span>
        <InputTextGeneric v-model.number="form.minJobCount" type="number" :min="1" />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
      <ButtonGeneric
        variant="green"
        icon="bi-file-earmark-excel"
        class="ml-2"
        :title="$t('common.btn.export')"
        @click="$emit('export')"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import api from '@/axios/axios-helper.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

export default {
  name: 'GoldLossByWorkerReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    DateRangeGeneric,
    MultiSelectGeneric,
    DropdownGeneric
  },

  setup() {
    const masterApiStore = useMasterApiStore()
    return { masterApiStore }
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
    async loadWorkers() {
      const res = await api.jewelry.post('Worker/Search', {
        take: 0,
        skip: 0,
        sort: [],
        search: { active: 1 }
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
    this.masterApiStore.fetchPlanStatus()
    this.masterApiStore.fetchGold()
    this.loadWorkers()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
