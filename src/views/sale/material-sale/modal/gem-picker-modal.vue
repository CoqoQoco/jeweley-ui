<template>
  <modal :showModal="showModal" @closeModal="onClose" width="1100px">
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.sale.materialSale.gemPicker.title') }}</span>
    </template>
    <template #content>
      <div class="p-3">
        <form class="filter-row mb-3" @submit.prevent="onSearch">
          <div>
            <span class="title-text">{{ $t('view.sale.materialSale.gemPicker.code') }}</span>
            <InputTextGeneric v-model.trim="form.code" />
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.materialSale.gemPicker.text') }}</span>
            <InputTextGeneric v-model.trim="form.text" :placeholder="$t('view.sale.materialSale.gemPicker.placeholderText')" />
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.materialSale.gemPicker.groupName') }}</span>
            <MultiSelectGeneric v-model="form.groupName" :options="groupOptions" optionLabel="value" optionValue="value" :filter="true" />
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.materialSale.gemPicker.shape') }}</span>
            <MultiSelectGeneric v-model="form.shape" :options="shapeOptions" optionLabel="value" optionValue="value" :filter="true" />
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.materialSale.gemPicker.size') }}</span>
            <MultiSelectGeneric v-model="form.size" :options="sizeOptions" optionLabel="value" optionValue="value" :filter="true" />
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.materialSale.gemPicker.grade') }}</span>
            <MultiSelectGeneric v-model="form.grade" :options="gradeOptions" optionLabel="value" optionValue="value" :filter="true" />
          </div>
          <div class="filter-action">
            <ButtonGeneric variant="main" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
            <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
          </div>
        </form>

        <div class="gem-table-container">
          <BaseDataTable
            :items="dataList.data"
            :totalRecords="dataList.total"
            :columns="columns"
            :perPage="take"
            dataKey="code"
            :selectionMode="true"
            selectionType="multiple"
            :itemsSelection="selectedItems"
            scrollHeight="360px"
            @update:itemsSelection="selectedItems = $event"
            @page="handlePageChange"
            @sort="handleSortChange"
          >
            <template #quantityTemplate="{ data }">
              <div class="text-right">{{ formatNumber(data.quantity, 0) }}</div>
            </template>
            <template #quantityWeightTemplate="{ data }">
              <div class="text-right">{{ formatNumber(data.quantityWeight) }}</div>
            </template>
            <template #priceTemplate="{ data }">
              <div class="text-right">{{ formatNumber(data.price) }}</div>
            </template>
          </BaseDataTable>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3">
          <span class="selected-count">{{ selectedItems.length }} / {{ dataList.total }}</span>
          <ButtonGeneric
            variant="main"
            icon="bi-plus-circle"
            :label="$t('view.sale.materialSale.gemPicker.addSelected')"
            @click="onAddSelected"
          />
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
// External dependencies
import { defineAsyncComponent } from 'vue'
import api from '@/axios/axios-helper.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { warning, success } from '@/services/alert/sweetAlerts.js'

// Local components
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceForm = {
  code: null,
  text: null,
  groupName: [],
  shape: [],
  size: [],
  grade: []
}

export default {
  name: 'MaterialSaleGemPickerModal',

  mixins: [dataTablePaging],

  components: {
    modal,
    BaseDataTable,
    InputTextGeneric,
    ButtonGeneric,
    MultiSelectGeneric
  },

  props: {
    showModal: { type: Boolean, default: false },
    existingCodes: { type: Array, default: () => [] }
  },

  emits: ['closeModal', 'select'],

  data() {
    return {
      form: { ...interfaceForm },
      dataList: { data: [], total: 0 },
      selectedItems: [],
      groupOptions: [],
      shapeOptions: [],
      sizeOptions: [],
      gradeOptions: []
    }
  },

  computed: {
    columns() {
      return [
        { field: 'code', header: this.$t('view.sale.materialSale.gemPicker.colCode'), minWidth: '110px', sortable: true },
        { field: 'groupName', header: this.$t('view.sale.materialSale.gemPicker.colGroupName'), minWidth: '110px', sortable: true },
        { field: 'shape', header: this.$t('view.sale.materialSale.gemPicker.colShape'), minWidth: '100px', sortable: true },
        { field: 'size', header: this.$t('view.sale.materialSale.gemPicker.colSize'), minWidth: '90px', sortable: true },
        { field: 'grade', header: this.$t('view.sale.materialSale.gemPicker.colGrade'), minWidth: '90px', sortable: true },
        { field: 'quantity', header: this.$t('view.sale.materialSale.gemPicker.colRemainQty'), minWidth: '110px', align: 'right', sortable: true },
        { field: 'quantityWeight', header: this.$t('view.sale.materialSale.gemPicker.colRemainWeight'), minWidth: '110px', align: 'right', sortable: true },
        { field: 'price', header: this.$t('view.sale.materialSale.gemPicker.colPrice'), minWidth: '110px', align: 'right', sortable: true }
      ]
    }
  },

  watch: {
    showModal(val) {
      if (val) {
        this.form = { ...interfaceForm }
        this.selectedItems = []
        this.resetPaging()
        this.fetchMasterOptions()
      }
    }
  },

  methods: {
    async fetchData() {
      const request = {
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        search: {
          code: this.form.code || null,
          groupName: this.form.groupName?.length ? this.form.groupName : null,
          shape: this.form.shape?.length ? this.form.shape : null,
          size: this.form.size?.length ? this.form.size : null,
          grade: this.form.grade?.length ? this.form.grade : null,
          typeCheck: null,
          text: this.form.text || null
        }
      }
      const res = await api.jewelry.post('StockGem/SearchData', request)
      if (res) {
        this.dataList = { data: res.data || [], total: res.total || 0 }
      }
    },

    async fetchMasterOptions() {
      const [group, shape, size, grade] = await Promise.all([
        api.jewelry.post('StockGem/GroupGemData', { type: 'GROUPGEM', Value: null }),
        api.jewelry.post('StockGem/GroupGemData', { type: 'SHAPE', Value: null }),
        api.jewelry.post('StockGem/GroupGemData', { type: 'SIZE', Value: null }),
        api.jewelry.post('StockGem/GroupGemData', { type: 'GRADE', Value: null })
      ])
      this.groupOptions = group || []
      this.shapeOptions = shape || []
      this.sizeOptions = size || []
      this.gradeOptions = grade || []
    },

    onSearch() {
      this.resetPaging()
    },

    onClear() {
      this.form = { ...interfaceForm }
      this.resetPaging()
    },

    formatNumber(val, decimals = 2) {
      const num = Number(val) || 0
      return num.toLocaleString('th-TH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    },

    onAddSelected() {
      if (this.selectedItems.length === 0) {
        warning(this.$t('view.sale.materialSale.gemPicker.noSelection'))
        return
      }

      const skippedCodes = []
      const result = []

      this.selectedItems.forEach((item) => {
        if (this.existingCodes.includes(item.code)) {
          skippedCodes.push(item.code)
          return
        }
        result.push({
          gemCode: item.code,
          gemName: item.name,
          gemGroup: item.groupName,
          gemShape: item.shape,
          gemSize: item.size,
          gemGrade: item.grade,
          refStockPrice: item.price,
          remainQty: item.quantity,
          remainWeight: item.quantityWeight
        })
      })

      if (skippedCodes.length) {
        warning(this.$t('view.sale.materialSale.gemPicker.duplicateSkipped', { codes: skippedCodes.join(', ') }))
      }

      if (result.length === 0) return

      this.$emit('select', result)
      success(this.$t('view.sale.materialSale.gemPicker.addedCount', { count: result.length }))
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

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.filter-action {
  display: flex;
  align-items: flex-end;
}

.gem-table-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-card-bg);
}

.selected-count {
  font-weight: 700;
  color: var(--base-font-color);
}
</style>
