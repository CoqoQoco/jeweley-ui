<template>
  <SearchBarGeneric
    :title="$t('view.sale.exportShipment.searchTitle')"
    :description="$t('view.sale.exportShipment.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #header-actions>
      <ButtonGeneric variant="green" icon="bi-plus-circle" :label="$t('view.sale.exportShipment.createBtn')" @click="$emit('create')" />
    </template>

    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.sale.exportShipment.keyword') }}</span>
        <InputTextGeneric v-model.trim="form.keyword" :placeholder="$t('view.sale.exportShipment.placeholderKeyword')" />
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.exportShipment.dateRange') }}</span>
        <DateRangeGeneric
          :startDate="form.dateFrom"
          :endDate="form.dateTo"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.dateFrom = $event"
          @update:endDate="form.dateTo = $event"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
    </template>
  </SearchBarGeneric>
</template>

<script>
import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'

export default {
  name: 'ExportShipmentSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    DateRangeGeneric
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['update:modelForm', 'search', 'clear', 'create'],

  data() {
    return {
      form: { ...this.modelForm }
    }
  },

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    },
    form: {
      handler(val) {
        this.$emit('update:modelForm', val)
      },
      deep: true
    }
  },

  methods: {
    onSearch() {
      this.$emit('search')
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
