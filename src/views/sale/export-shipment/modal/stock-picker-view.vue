<template>
  <modal :showModal="isShow" @closeModal="onClose" width="1200px">
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.sale.exportShipment.stockPicker.title') }}</span>
    </template>
    <template #content>
      <div class="p-3">
        <form class="filter-row mb-3" @submit.prevent="onSearch">
          <FormFieldGeneric :label="$t('view.sale.exportShipment.stockPicker.stockNumber')">
            <InputTextGeneric v-model.trim="form.stockNumber" @keyup.enter="onSearch" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.exportShipment.stockPicker.stockNumberOrigin')">
            <InputTextGeneric v-model.trim="form.stockNumberOrigin" @keyup.enter="onSearch" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.exportShipment.stockPicker.productNumber')">
            <InputTextGeneric v-model.trim="form.productNumber" @keyup.enter="onSearch" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.exportShipment.stockPicker.productNameEn')">
            <InputTextGeneric v-model.trim="form.productNameEn" @keyup.enter="onSearch" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.exportShipment.stockPicker.productNameTh')">
            <InputTextGeneric v-model.trim="form.productNameTh" @keyup.enter="onSearch" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.exportShipment.stockPicker.productType')">
            <MultiSelectGeneric v-model="form.productType" :options="masterProductType" optionLabel="description" optionValue="code" :filter="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.exportShipment.stockPicker.goldColor')">
            <MultiSelectGeneric v-model="form.gold" :options="masterGold" optionLabel="nameTh" optionValue="nameEn" :filter="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.exportShipment.stockPicker.karat')">
            <MultiSelectGeneric v-model="form.goldSize" :options="masterGoldSize" optionLabel="nameTh" optionValue="nameEn" :filter="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.exportShipment.stockPicker.location')">
            <MultiSelectGeneric v-model="form.locationCodes" :options="locationOptions" optionLabel="label" optionValue="value" :filter="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.exportShipment.stockPicker.receiptNumber')">
            <InputTextGeneric v-model.trim="form.receiptNumber" @keyup.enter="onSearch" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.exportShipment.stockPicker.keyword')">
            <InputTextGeneric v-model.trim="form.keyword" :placeholder="$t('view.sale.exportShipment.stockPicker.keywordHint')" @keyup.enter="onSearch" />
          </FormFieldGeneric>

          <div class="filter-action">
            <ButtonGeneric variant="green" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
            <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
          </div>
        </form>

        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="found-count">{{ $t('view.sale.exportShipment.stockPicker.foundCount', { count: total }) }}</span>
          <ButtonGeneric
            variant="main"
            icon="bi-collection"
            :label="$t('view.sale.exportShipment.stockPicker.addAllByFilter')"
            :disabled="total === 0"
            @click="onAddAllByFilter"
          />
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
          />
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3">
          <span class="selected-count">{{ selectedItems.length }} / {{ total }}</span>
          <ButtonGeneric
            variant="main"
            icon="bi-plus-circle"
            :label="$t('view.sale.exportShipment.stockPicker.addSelected')"
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
import { warning, success } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { useExportShipmentStore } from '@/stores/modules/api/sale/export-shipment-store.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
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
  productNameEn: null,
  productNameTh: null,
  productType: [],
  gold: [],
  goldSize: [],
  locationCodes: [],
  receiptNumber: null,
  keyword: null
}

export default {
  name: 'ExportShipmentStockPickerView',

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
    running: {
      type: [String, Number],
      default: null
    }
  },

  emits: ['closeModal', 'added'],

  setup() {
    const exportShipmentStore = useExportShipmentStore()
    const masterStore = useMasterApiStore()
    const locationStore = useStockLocationApiStore()
    return { exportShipmentStore, masterStore, locationStore }
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
    masterProductType() {
      return this.masterStore.productType
    },
    masterGold() {
      return this.masterStore.gold
    },
    masterGoldSize() {
      return this.masterStore.goldSize
    },
    locationOptions() {
      return this.locationStore.all
        .filter((item) => item.isActive)
        .map((item) => ({ value: item.code, label: `${item.code} — ${item.nameTh}` }))
    },
    columns() {
      return [
        { field: 'stockNumber', header: this.$t('view.sale.exportShipment.stockPicker.stockNumber'), minWidth: '130px' },
        { field: 'stockNumberOrigin', header: this.$t('view.sale.exportShipment.stockPicker.stockNumberOrigin'), minWidth: '120px' },
        { field: 'productNumber', header: this.$t('view.sale.exportShipment.stockPicker.productNumber'), minWidth: '130px' },
        { field: 'productNameEn', header: this.$t('view.sale.exportShipment.stockPicker.productNameEn'), minWidth: '160px' },
        { field: 'productTypeName', header: this.$t('view.sale.exportShipment.stockPicker.productType'), minWidth: '110px' },
        { field: 'productionType', header: this.$t('view.sale.exportShipment.stockPicker.goldColor'), minWidth: '90px' },
        { field: 'productionTypeSize', header: this.$t('view.sale.exportShipment.stockPicker.karat'), minWidth: '90px' },
        { field: 'location', header: this.$t('view.sale.exportShipment.stockPicker.location'), minWidth: '100px' }
      ]
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.form = { ...interfaceForm }
        this.selectedItems = []
        this.skip = 0
        this.fetchMasterData()
        this.fetchList()
      }
    }
  },

  methods: {
    async fetchMasterData() {
      await Promise.all([
        this.masterStore.fetchGold(),
        this.masterStore.fetchGoldSize(),
        this.masterStore.fetchProductType(),
        this.locationStore.fetchAllForMap()
      ])
    },

    async fetchList() {
      const param = {
        take: this.take,
        skip: this.skip,
        sort: [],
        search: {
          stockNumber: this.form.stockNumber || null,
          stockNumberOrigin: this.form.stockNumberOrigin || null,
          productNumber: this.form.productNumber || null,
          productNameEn: this.form.productNameEn || null,
          productNameTh: this.form.productNameTh || null,
          productType: this.form.productType?.length ? this.form.productType : null,
          gold: this.form.gold?.length ? this.form.gold : null,
          goldSize: this.form.goldSize?.length ? this.form.goldSize : null,
          locationCodes: this.form.locationCodes?.length ? this.form.locationCodes : null,
          receiptNumber: this.form.receiptNumber || null,
          keyword: this.form.keyword || null,
          pieceStatus: 'IN_STOCK'
        }
      }
      const res = await api.jewelry.post('StockProduct/List', param)
      this.dataList = res?.data || []
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

    async onAddSelected() {
      if (!this.selectedItems.length) {
        warning(this.$t('view.sale.exportShipment.stockPicker.noSelection'))
        return
      }

      const stockNumbers = this.selectedItems.map((it) => it.stockNumber)
      const res = await this.exportShipmentStore.addItems({ running: this.running, stockNumbers, filter: null })
      if (res) {
        success(this.$t('view.sale.exportShipment.addSelectedSuccess'))
        this.$emit('added', res.items || [])
        this.selectedItems = []
        this.onClose()
      }
    },

    onAddAllByFilter() {
      confirmThenSubmit(
        this.$t('view.sale.exportShipment.stockPicker.confirmAddAllMsg', { count: this.total }),
        this.$t('view.sale.exportShipment.stockPicker.confirmAddAllTitle'),
        async () => {
          const filter = {
            locationCodes: this.form.locationCodes?.length ? this.form.locationCodes : [],
            productType: this.form.productType?.length ? this.form.productType : [],
            productionType: this.form.gold?.length ? this.form.gold : [],
            productionTypeSize: this.form.goldSize?.length ? this.form.goldSize : [],
            receiptNumber: this.form.receiptNumber || null,
            keyword: this.form.keyword || null,
            stockNumberOrigin: this.form.stockNumberOrigin || null
          }
          const res = await this.exportShipmentStore.addItems({ running: this.running, stockNumbers: [], filter })
          if (res) {
            success(this.$t('view.sale.exportShipment.addAllSuccess', { count: res.added ?? 0 }))
            this.$emit('added', res.items || [])
            this.onClose()
          }
        }
      )
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
  grid-template-columns: repeat(4, 1fr);
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
</style>
