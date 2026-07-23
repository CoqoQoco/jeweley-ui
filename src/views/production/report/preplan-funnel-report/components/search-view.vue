<template>
  <SearchBarGeneric
    :title="$t('view.production.preplanFunnel.searchTitle')"
    :description="$t('view.production.preplanFunnel.searchDesc')"
    @search="onSearch"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.preplanFunnel.dateRange') }}</span>
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
        <span class="title-text">{{ $t('view.production.preplanFunnel.jobType') }}</span>
        <MultiSelectGeneric
          v-model="form.jobType"
          :options="masterPrePlanStore.jobTypes"
          optionLabel="description"
          optionValue="code"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.preplanFunnel.jobLocation') }}</span>
        <MultiSelectGeneric
          v-model="form.jobLocation"
          :options="masterPrePlanStore.jobLocations"
          optionLabel="description"
          optionValue="code"
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
import { useMasterPrePlanStore } from '@/stores/modules/api/master/master-pre-plan-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'

export default {
  name: 'PrePlanFunnelReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    MultiSelectGeneric,
    DateRangeGeneric
  },

  setup() {
    const masterPrePlanStore = useMasterPrePlanStore()
    return { masterPrePlanStore }
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
    if (!this.masterPrePlanStore.jobTypes.length) {
      this.masterPrePlanStore.fetchJobTypes()
    }
    if (!this.masterPrePlanStore.jobLocations.length) {
      this.masterPrePlanStore.fetchJobLocations()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
