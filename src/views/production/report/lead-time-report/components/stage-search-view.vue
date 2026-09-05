<template>
  <SearchBarGeneric
    :title="$t('view.production.leadTime.stage.searchTitle')"
    :description="$t('view.production.leadTime.stage.searchDesc')"
    @search="onSearch"
    @clear="onClear"
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

      <div>
        <span class="title-text">{{ $t('view.production.leadTime.stage.gold') }}</span>
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
        <span class="title-text">{{ $t('view.production.leadTime.stage.goldSize') }}</span>
        <MultiSelectGeneric
          v-model="form.goldSize"
          :options="masterApiStore.goldSize"
          optionLabel="nameTh"
          optionValue="nameEn"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.leadTime.stage.customerCode') }}</span>
        <InputTextGeneric v-model.trim="form.customerCode" />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.leadTime.stage.mold') }}</span>
        <InputTextGeneric v-model.trim="form.mold" />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.leadTime.stage.productNumber') }}</span>
        <InputTextGeneric v-model.trim="form.productNumber" />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.leadTime.stage.text') }}</span>
        <InputTextGeneric
          v-model.trim="form.text"
          icon="bi-search"
          :placeholder="$t('view.production.leadTime.stage.textPlaceholder')"
        />
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
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

export default {
  name: 'LeadTimeStageSearchView',

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
      form: { ...this.modelForm }
    }
  },

  computed: {
    groupByOptions() {
      return [
        { value: 'none', label: this.$t('view.production.leadTime.stage.groupByOptionNone') },
        { value: 'productType', label: this.$t('view.production.leadTime.productType') },
        { value: 'customerType', label: this.$t('view.production.leadTime.customerType') },
        { value: 'gold', label: this.$t('view.production.leadTime.stage.groupByOptionGold') },
        { value: 'goldSize', label: this.$t('view.production.leadTime.stage.groupByOptionGoldSize') }
      ]
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    }
  },

  created() {
    if (!this.masterApiStore.productType.length) {
      this.masterApiStore.fetchProductType()
    }
    if (!this.masterApiStore.customerType.length) {
      this.masterApiStore.fetchCustomerType()
    }
    if (!this.masterApiStore.gold.length) {
      this.masterApiStore.fetchGold()
    }
    if (!this.masterApiStore.goldSize.length) {
      this.masterApiStore.fetchGoldSize()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
