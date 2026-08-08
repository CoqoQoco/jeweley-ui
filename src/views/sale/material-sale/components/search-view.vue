<template>
  <SearchBarGeneric
    :title="$t('view.sale.materialSale.searchTitle')"
    :description="$t('view.sale.materialSale.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #header-actions>
      <ButtonGeneric
        variant="green"
        icon="bi-plus-circle"
        :label="$t('view.sale.materialSale.createBtn')"
        @click="$emit('create')"
      />
    </template>

    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.sale.materialSale.documentNo') }}</span>
        <InputTextGeneric
          v-model.trim="form.documentNo"
          :placeholder="$t('view.sale.materialSale.placeholder.documentNo')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.materialSale.customerName') }}</span>
        <InputTextGeneric
          v-model.trim="form.customerName"
          :placeholder="$t('view.sale.materialSale.placeholder.customerName')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.materialSale.status') }}</span>
        <MultiSelectGeneric
          v-model="form.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.materialSale.dateRange') }}</span>
        <DateRangeGeneric
          :startDate="form.documentDateStart"
          :endDate="form.documentDateEnd"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.documentDateStart = $event"
          @update:endDate="form.documentDateEnd = $event"
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
// External dependencies
// (none)

// Local components
import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'

export default {
  name: 'MaterialSaleSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    MultiSelectGeneric,
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
        { value: 10, label: this.$t('view.sale.materialSale.statusDraft') },
        { value: 100, label: this.$t('view.sale.materialSale.statusConfirmed') },
        { value: 500, label: this.$t('view.sale.materialSale.statusCancelled') }
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
