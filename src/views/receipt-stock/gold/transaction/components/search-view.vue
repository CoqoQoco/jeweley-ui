<template>
  <SearchBarGeneric
    :title="$t('view.receiptStock.gold.transaction.title')"
    :description="$t('view.receiptStock.gold.transaction.description')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.receiptStock.gold.transaction.fieldDateRange') }}</span>
        <DateRangeGeneric
          :startDate="dateFrom"
          :endDate="dateTo"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="$emit('update:dateFrom', $event)"
          @update:endDate="$emit('update:dateTo', $event)"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.receiptStock.gold.transaction.fieldGoldType') }}</span>
        <MultiSelectGeneric
          :modelValue="goldCode"
          :options="masterGold"
          optionLabel="description"
          optionValue="code"
          :placeholder="$t('common.label.all')"
          :showClear="true"
          @update:modelValue="$emit('update:goldCode', $event)"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.receiptStock.gold.transaction.fieldGoldPercent') }}</span>
        <MultiSelectGeneric
          :modelValue="goldSizeCode"
          :options="masterGoldSize"
          optionLabel="description"
          optionValue="code"
          :placeholder="$t('common.label.all')"
          :showClear="true"
          @update:modelValue="$emit('update:goldSizeCode', $event)"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.receiptStock.gold.transaction.fieldType') }}</span>
        <MultiSelectGeneric
          :modelValue="type"
          :options="typeOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('common.label.all')"
          :showClear="true"
          @update:modelValue="$emit('update:type', $event)"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.receiptStock.gold.transaction.fieldRefDocNo') }}</span>
        <InputTextGeneric
          :modelValue="refDocNo"
          trim
          :placeholder="$t('view.receiptStock.gold.transaction.fieldRefDocNo')"
          @update:modelValue="$emit('update:refDocNo', $event)"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
      <ButtonGeneric
        variant="dark"
        icon="bi-x-circle"
        class="ml-2"
        :title="$t('common.btn.clear')"
        @click="onClear"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'

export default {
  name: 'StockGoldTransectionSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    MultiSelectGeneric,
    DateRangeGeneric
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  props: {
    dateFrom: {
      type: Date,
      default: null
    },
    dateTo: {
      type: Date,
      default: null
    },
    goldCode: {
      type: Array,
      default: () => []
    },
    goldSizeCode: {
      type: Array,
      default: () => []
    },
    type: {
      type: Array,
      default: () => []
    },
    refDocNo: {
      type: String,
      default: ''
    }
  },

  emits: [
    'update:dateFrom',
    'update:dateTo',
    'update:goldCode',
    'update:goldSizeCode',
    'update:type',
    'update:refDocNo',
    'search',
    'clear'
  ],

  computed: {
    masterGold() {
      return this.masterStore.gold
    },
    masterGoldSize() {
      return this.masterStore.goldSize
    },
    typeOptions() {
      return [
        { value: 1, label: this.$t('view.receiptStock.gold.transaction.typeOptions.type1') },
        { value: 2, label: this.$t('view.receiptStock.gold.transaction.typeOptions.type2') },
        { value: 3, label: this.$t('view.receiptStock.gold.transaction.typeOptions.type3') },
        { value: 4, label: this.$t('view.receiptStock.gold.transaction.typeOptions.type4') },
        { value: 5, label: this.$t('view.receiptStock.gold.transaction.typeOptions.type5') },
        { value: 6, label: this.$t('view.receiptStock.gold.transaction.typeOptions.type6') },
        { value: 7, label: this.$t('view.receiptStock.gold.transaction.typeOptions.type7') },
        { value: 8, label: this.$t('view.receiptStock.gold.transaction.typeOptions.type8') }
      ]
    }
  },

  created() {
    this.masterStore.fetchGold()
    this.masterStore.fetchGoldSize()
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
