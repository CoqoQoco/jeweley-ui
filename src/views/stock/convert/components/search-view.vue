<template>
  <SearchBarGeneric
    :title="$t('view.stock.convert.searchTitle')"
    :description="$t('view.stock.convert.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #header-actions>
      <ButtonGeneric variant="green" icon="bi-plus-circle" :label="$t('view.stock.convert.createBtn')" @click="$emit('create')" />
    </template>

    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.stock.convert.keyword') }}</span>
        <InputTextGeneric v-model.trim="form.documentNumber" @keyup.enter="onSearch" />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.convert.soNumber') }}</span>
        <InputTextGeneric v-model.trim="form.soNumber" @keyup.enter="onSearch" />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.convert.sourceStockNumber') }}</span>
        <InputTextGeneric v-model.trim="form.sourceStockNumber" @keyup.enter="onSearch" />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.convert.status') }}</span>
        <DropdownGeneric
          v-model="form.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          :ariaLabel="$t('view.stock.convert.status')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.convert.dateRange') }}</span>
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
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'

export default {
  name: 'StockConvertSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    DropdownGeneric,
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

  computed: {
    statusOptions() {
      return [
        { value: 0, label: this.$t('view.stock.convert.statusConverting') },
        { value: 1, label: this.$t('view.stock.convert.statusCompleted') },
        { value: 9, label: this.$t('view.stock.convert.statusCancelled') }
      ]
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
