<template>
  <SearchBarGeneric
    :title="$t('view.production.wagesMonthlyTrend.searchTitle')"
    :description="$t('view.production.wagesMonthlyTrend.searchDesc')"
    @search="onSearch"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.wagesMonthlyTrend.monthRange') }}</span>
        <DateRangeGeneric
          :startDate="form.start"
          :endDate="form.end"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.start = $event"
          @update:endDate="form.end = $event"
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
import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'

export default {
  name: 'WagesMonthlyTrendReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    DateRangeGeneric
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
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
