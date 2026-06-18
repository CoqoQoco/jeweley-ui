<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')" width="1100px">
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.sale.document.stockPickerTitle') }}</span>
    </template>
    <template #content>
      <div class="p-3">
        <div class="search-row mb-3">
          <div class="form-row four-col">
            <div class="form-field">
              <span class="title-text">{{ $t('view.sale.document.productNumber') }}</span>
              <input class="form-control" v-model="searchForm.productNumber" :placeholder="$t('view.sale.document.placeholder.productNumber')" @keyup.enter="onSearch" />
            </div>
            <div class="form-field">
              <span class="title-text">{{ $t('view.sale.document.productNameEn') }}</span>
              <input class="form-control" v-model="searchForm.productNameEn" :placeholder="$t('view.sale.document.placeholder.productNameEn')" @keyup.enter="onSearch" />
            </div>
            <div class="form-field">
              <span class="title-text">{{ $t('view.sale.document.productNameTh') }}</span>
              <input class="form-control" v-model="searchForm.productNameTh" :placeholder="$t('view.sale.document.placeholder.productNameTh')" @keyup.enter="onSearch" />
            </div>
            <div class="form-field">
              <span class="title-text">{{ $t('view.sale.document.productType') }}</span>
              <input class="form-control" v-model="searchForm.productType" :placeholder="$t('view.sale.document.placeholder.productType')" @keyup.enter="onSearch" />
            </div>
          </div>
          <div class="mt-2">
            <button class="btn btn-sm btn-green" @click="onSearch">
              <i class="bi bi-search mr-1"></i> {{ $t('common.btn.search') }}
            </button>
            <button class="btn btn-sm btn-outline-main ml-2" @click="onClear">
              <i class="bi bi-x-circle"></i>
            </button>
          </div>
        </div>

        <BaseDataTable
          :items="dataList"
          :totalRecords="total"
          :columns="columns"
          :perPage="pageSize"
          :paginator="true"
          dataKey="stockNumber"
          scrollHeight="400px"
          @page="onPageChange"
        >
          <template #actionTemplate="{ data }">
            <button class="btn btn-sm btn-main" @click="onSelect(data)">
              <i class="bi bi-plus-circle mr-1"></i> {{ $t('common.btn.select') }}
            </button>
          </template>
        </BaseDataTable>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import api from '@/axios/axios-helper.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceSearch = {
  productNumber: null,
  productNameEn: null,
  productNameTh: null,
  productType: null
}

export default {
  name: 'StockPickerView',

  components: { modal, BaseDataTable },

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  emits: ['closeModal', 'select'],

  data() {
    return {
      searchForm: { ...interfaceSearch },
      dataList: [],
      total: 0,
      pageSize: 10,
      currentSkip: 0
    }
  },

  computed: {
    columns() {
      return [
        { field: 'action', header: '', width: '90px', sortable: false },
        { field: 'productNumber', header: this.$t('view.sale.document.productNumber'), minWidth: '120px' },
        { field: 'productNameEn', header: this.$t('view.sale.document.productNameEn'), minWidth: '180px' },
        { field: 'productNameTh', header: this.$t('view.sale.document.productNameTh'), minWidth: '180px' },
        { field: 'productTypeName', header: this.$t('view.sale.document.productType'), minWidth: '120px' },
        { field: 'productionType', header: this.$t('view.sale.document.goldColor'), minWidth: '100px' }
      ]
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.onSearch()
      }
    }
  },

  methods: {
    async onSearch() {
      this.currentSkip = 0
      await this.fetchList()
    },

    onClear() {
      this.searchForm = { ...interfaceSearch }
      this.onSearch()
    },

    async fetchList() {
      const param = {
        take: this.pageSize,
        skip: this.currentSkip,
        sort: null,
        search: { ...this.searchForm }
      }
      const res = await api.jewelry.post('StockProduct/List', param)
      if (res) {
        this.dataList = res.data || []
        this.total = res.total || 0
      } else {
        this.dataList = []
        this.total = 0
      }
    },

    onPageChange({ first, rows }) {
      this.currentSkip = first
      this.pageSize = rows
      this.fetchList()
    },

    onSelect(data) {
      const materials = data.materials || []
      const goldMat = materials.find((m) => m.materialType === 'Gold' || m.materialType === 'gold')
      const diamondMat = materials.find((m) => m.materialType === 'Diamond' || m.materialType === 'diamond')

      const goldWeight = goldMat?.weight ?? data.goldWeight ?? null
      const goldColor = data.productionType || 'GOLD'
      const karat = data.karat || '18K'
      const productType = data.productTypeName || data.productType || 'RING'

      let descLine1 = ''
      const parts = [karat, goldColor.toUpperCase(), productType.toUpperCase()]
      if (goldWeight) parts.push(`${goldWeight} G`)
      descLine1 = parts.join(' ')

      let descLine2 = ''
      if (diamondMat) {
        const pcs = diamondMat.quantity || diamondMat.pcs || ''
        const carat = diamondMat.carat || diamondMat.weight || ''
        if (pcs || carat) {
          descLine2 = `${pcs ? pcs + 'PCS ' : ''}DIAMOND${carat ? ' ' + carat + ' CT' : ''}`
        }
      }

      this.$emit('select', {
        productNumber: data.productNumber,
        descriptionLine1: descLine1,
        descriptionLine2: descLine2,
        stockData: data
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.form-row {
  margin-bottom: 0;

  &.four-col {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  @media (max-width: 1024px) {
    &.four-col {
      grid-template-columns: 1fr 1fr;
    }
  }
}

.form-field {
  width: 100%;
}

input.form-control {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.875rem;

  &:focus {
    border-color: var(--base-font-color);
    box-shadow: none;
    outline: none;
  }
}
</style>
