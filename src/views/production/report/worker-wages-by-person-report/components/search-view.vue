<template>
  <SearchBarGeneric
    :title="$t('view.production.workerWagesByPerson.searchTitle')"
    :description="$t('view.production.workerWagesByPerson.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.workerWagesByPerson.dateRange') }}</span>
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
        <span class="title-text">{{ $t('view.production.workerWagesByPerson.searchText') }}</span>
        <InputTextGeneric
          v-model.trim="form.text"
          :placeholder="$t('view.production.workerWagesByPerson.placeholder.searchText')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.workerWagesByPerson.status') }}</span>
        <MultiSelectGeneric
          v-model="form.status"
          :options="masterApiStore.planStatus"
          optionLabel="nameTh"
          optionValue="id"
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
        :disabled="!workerWagesByPersonStore.dataSearch.total"
        @click="onExport"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useWorkerWagesByPersonApiStore } from '@/stores/modules/api/production/worker-wages-by-person-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'

export default {
  name: 'WorkerWagesByPersonReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    DateRangeGeneric,
    MultiSelectGeneric
  },

  setup() {
    const workerWagesByPersonStore = useWorkerWagesByPersonApiStore()
    const masterApiStore = useMasterApiStore()
    return { workerWagesByPersonStore, masterApiStore }
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
  },

  created() {
    this.masterApiStore.fetchPlanStatus()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
