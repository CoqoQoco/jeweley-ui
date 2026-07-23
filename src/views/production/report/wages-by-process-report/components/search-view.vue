<template>
  <SearchBarGeneric
    :title="$t('view.production.wagesByProcess.searchTitle')"
    :description="$t('view.production.wagesByProcess.searchDesc')"
    @search="onSearch"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.wagesByProcess.dateRange') }}</span>
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
        <span class="title-text">{{ $t('view.production.wagesByProcess.process') }}</span>
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
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'

export default {
  name: 'WagesByProcessReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    DateRangeGeneric,
    MultiSelectGeneric
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

  emits: ['search', 'export'],

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
    }
  },

  created() {
    if (!this.masterApiStore.planStatus.length) {
      this.masterApiStore.fetchPlanStatus()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
