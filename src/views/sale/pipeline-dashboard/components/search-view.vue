<template>
  <SearchBarGeneric
    :title="$t('view.sale.pipelineDashboard.searchTitle')"
    :description="$t('view.sale.pipelineDashboard.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.sale.pipelineDashboard.dateRange') }}</span>
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
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
    </template>
  </SearchBarGeneric>
</template>

<script>
import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'

export default {
  name: 'SalePipelineDashboardSearchView',

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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
