<template>
  <modal :showModal="isShow" @closeModal="onClose" width="1100px">
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.stock.convert.picker.title') }}</span>
    </template>
    <template #content>
      <div>
        <form class="filter-row mb-3" @submit.prevent="onSearch">
          <FormFieldGeneric :label="$t('view.stock.convert.picker.stockNumber')">
            <InputTextGeneric v-model.trim="form.stockNumber" @keyup.enter="onSearch" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.convert.picker.stockNumberOrigin')">
            <InputTextGeneric v-model.trim="form.stockNumberOrigin" @keyup.enter="onSearch" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.convert.picker.productNumber')">
            <InputTextGeneric v-model.trim="form.productNumber" @keyup.enter="onSearch" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.convert.picker.location')">
            <MultiSelectGeneric v-model="form.locationCodes" :options="locationOptions" optionLabel="label" optionValue="value" :filter="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.convert.picker.keyword')">
            <InputTextGeneric v-model.trim="form.keyword" @keyup.enter="onSearch" />
          </FormFieldGeneric>

          <div class="filter-action">
            <ButtonGeneric variant="green" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
            <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
          </div>
        </form>

        <div class="mb-2">
          <span class="found-count">{{ $t('view.stock.convert.picker.foundCount', { count: total }) }}</span>
        </div>

        <div class="picker-table-container">
          <BaseDataTable
            :items="dataList"
            :totalRecords="total"
            :columns="columns"
            :perPage="take"
            dataKey="stockNumber"
            :selectionMode="true"
            selectionType="multiple"
            :itemsSelection="selectedItems"
            scrollHeight="360px"
            @update:itemsSelection="selectedItems = $event"
            @page="handlePageChange"
          >
            <template #productPriceTemplate="{ data }">
              <div class="text-right">{{ formatDecimal(data.productPrice, 2) }}</div>
            </template>
          </BaseDataTable>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3">
          <span class="selected-count">{{ selectedItems.length }} / {{ total }}</span>
          <ButtonGeneric
            variant="main"
            icon="bi-plus-circle"
            :label="$t('view.stock.convert.picker.addSelected')"
            :disabled="!selectedItems.length"
            @click="onAddSelected"
          />
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import api from '@/axios/axios-helper.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { formatDecimal } from '@/services/utils/decimal.js'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceForm = {
  stockNumber: null,
  stockNumberOrigin: null,
  productNumber: null,
  locationCodes: [],
  keyword: null
}

export default {
  name: 'StockConvertSourcePickerModal',

  components: {
    modal,
    BaseDataTable,
    FormFieldGeneric,
    InputTextGeneric,
    ButtonGeneric,
    MultiSelectGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    // เลขที่ผลิตที่ถูกเลือกเป็นชิ้นต้นทางไปแล้ว — กันเลือกซ้ำ
    excludeStockNumbers: {
      type: Array,
      default: () => []
    }
  },

  emits: ['closeModal', 'confirm'],

  setup() {
    const locationStore = useStockLocationApiStore()
    return { locationStore }
  },

  data() {
    return {
      form: { ...interfaceForm },
      dataList: [],
      total: 0,
      take: 20,
      skip: 0,
      selectedItems: []
    }
  },

  computed: {
    locationOptions() {
      return this.locationStore.all
        .filter((item) => item.isActive)
        .map((item) => ({ value: item.code, label: `${item.code} — ${item.nameTh}` }))
    },
    columns() {
      return [
        { field: 'stockNumber', header: this.$t('view.stock.convert.picker.stockNumber'), minWidth: '130px' },
        { field: 'stockNumberOrigin', header: this.$t('view.stock.convert.picker.stockNumberOrigin'), minWidth: '120px' },
        { field: 'productNumber', header: this.$t('view.stock.convert.picker.productNumber'), minWidth: '130px' },
        { field: 'productNameEn', header: this.$t('view.stock.convert.productNameEn'), minWidth: '160px' },
        { field: 'productTypeName', header: this.$t('view.stock.convert.productType'), minWidth: '110px' },
        { field: 'location', header: this.$t('view.stock.convert.picker.location'), minWidth: '100px' },
        { field: 'productPrice', header: this.$t('view.stock.convert.picker.colCost'), minWidth: '110px' }
      ]
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.form = { ...interfaceForm }
        this.selectedItems = []
        this.skip = 0
        this.locationStore.fetchAllForMap()
        this.fetchList()
      }
    }
  },

  methods: {
    formatDecimal,

    async fetchList() {
      const param = {
        take: this.take,
        skip: this.skip,
        sort: [],
        search: {
          stockNumber: this.form.stockNumber || null,
          stockNumberOrigin: this.form.stockNumberOrigin || null,
          productNumber: this.form.productNumber || null,
          locationCodes: this.form.locationCodes?.length ? this.form.locationCodes : null,
          keyword: this.form.keyword || null,
          pieceStatus: 'IN_STOCK'
        }
      }
      const res = await api.jewelry.post('StockProduct/List', param)
      const exclude = new Set(this.excludeStockNumbers || [])
      this.dataList = (res?.data || []).filter((item) => !exclude.has(item.stockNumber))
      this.total = res?.total || 0
    },

    onSearch() {
      this.skip = 0
      this.fetchList()
    },

    onClear() {
      this.form = { ...interfaceForm }
      this.skip = 0
      this.fetchList()
    },

    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchList()
    },

    onAddSelected() {
      if (!this.selectedItems.length) {
        warning(this.$t('view.stock.convert.picker.noSelection'))
        return
      }
      this.$emit('confirm', this.selectedItems)
      this.selectedItems = []
      this.onClose()
    },

    onClose() {
      this.$emit('closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.filter-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-md);
  align-items: end;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.filter-action {
  display: flex;
  align-items: flex-end;
}

.picker-table-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-card-bg);
}

.found-count,
.selected-count {
  font-weight: 700;
  color: var(--base-font-color);
}

.text-right {
  text-align: right;
}
</style>
