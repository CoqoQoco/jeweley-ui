<template>
  <SearchBarGeneric
    :title="$t('view.production.leadTime.searchTitle')"
    :description="$t('view.production.leadTime.searchDesc')"
    @search="onSearch"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.leadTime.completedDate') }}</span>
        <DateRangeGeneric
          :startDate="form.completedStart"
          :endDate="form.completedEnd"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.completedStart = $event"
          @update:endDate="form.completedEnd = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.leadTime.groupBy') }}</span>
        <DropdownGeneric
          v-model="form.groupBy"
          :options="groupByOptions"
          optionLabel="label"
          optionValue="value"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.leadTime.productType') }}</span>
        <MultiSelectGeneric
          v-model="form.productType"
          :options="masterApiStore.productType"
          optionLabel="nameTh"
          optionValue="code"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.leadTime.customerType') }}</span>
        <MultiSelectGeneric
          v-model="form.customerType"
          :options="masterApiStore.customerType"
          optionLabel="nameTh"
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
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'

export default {
  name: 'LeadTimeReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    DropdownGeneric,
    MultiSelectGeneric,
    DateRangeGeneric
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

  computed: {
    groupByOptions() {
      return [
        { value: 'productType', label: this.$t('view.production.leadTime.groupProduct') },
        { value: 'customerType', label: this.$t('view.production.leadTime.groupCustomer') }
      ]
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    }
  },

  created() {
    if (!this.masterApiStore.productType.length) {
      this.masterApiStore.fetchProductType()
    }
    if (!this.masterApiStore.customerType.length) {
      this.masterApiStore.fetchCustomerType()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
