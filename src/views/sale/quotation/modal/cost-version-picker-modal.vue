<template>
  <modal :showModal="isShowModal" @closeModal="onCancel" width="1000px">
    <template v-slot:content>
      <div class="p-3">
        <div class="title-text-lg mb-3">
          <span><i class="bi bi-clock-history mr-2"></i></span>
          <span>เลือกสินค้าจากรายการตีราคา</span>
        </div>

        <!-- Search Form -->
        <div class="mb-3">
          <form @submit.prevent="onSearch">
            <div class="form-col-sm-container">
              <div>
                <span class="title-text">เลขที่ผลิต</span>
                <input
                  class="form-control bg-input"
                  type="text"
                  v-model.trim="searchForm.stockNumber"
                  placeholder="ค้นหาเลขที่ผลิต"
                />
              </div>
              <div>
                <span class="title-text">ใบตีราคา</span>
                <input
                  class="form-control bg-input"
                  type="text"
                  v-model.trim="searchForm.running"
                  placeholder="ค้นหาใบตีราคา"
                />
              </div>
              <div>
                <span class="title-text">ผู้สร้าง</span>
                <input
                  class="form-control bg-input"
                  type="text"
                  v-model.trim="searchForm.createBy"
                  placeholder="ค้นหาผู้สร้าง"
                />
              </div>
              <div class="d-flex align-items-end gap-1">
                <button class="btn btn-sm btn-green" type="submit">
                  <i class="bi bi-search mr-1"></i>ค้นหา
                </button>
                <button class="btn btn-sm btn-secondary" type="button" @click="onClearSearch">
                  <i class="bi bi-x-circle mr-1"></i>ล้าง
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Cost Version Table -->
        <div class="cost-version-table-container" style="max-height: 500px; overflow-y: auto">
          <BaseDataTable
            :items="data.data"
            :totalRecords="data.total"
            :columns="columns"
            :perPage="take"
            :scrollHeight="'400px'"
            @page="handlePageChange"
            @sort="handleSortChange"
          >
            <template #actionTemplate="{ data }">
              <div class="text-center">
                <button
                  class="btn btn-sm btn-green"
                  @click="onSelectItem(data)"
                  title="เลือก"
                >
                  <i class="bi bi-check-circle"></i>
                  <span class="ml-1">เลือก</span>
                </button>
              </div>
            </template>

            <template #stockNumberTemplate="{ data }">
              <span class="stock-link">{{ data.stockNumber }}</span>
            </template>

            <template #createDateTemplate="{ data }">
              {{ formatDateTime(data.createDate) }}
            </template>

            <template #totalPriceTemplate="{ data }">
              <div class="text-right">
                {{ formatCurrency(getTotalPrice(data)) }}
              </div>
            </template>

            <template #currencyUnitTemplate="{ data }">
              {{ data.currencyUnit || '' }}
            </template>
          </BaseDataTable>
        </div>

        <div class="d-flex justify-content-end mt-4">
          <button class="btn btn-sm btn-dark" @click="onCancel">
            <span><i class="bi bi-x-circle"></i></span>
            <span class="ml-2">ยกเลิก</span>
          </button>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { formatDecimal } from '@/services/utils/decimal.js'
import dayjs from 'dayjs'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'CostVersionPickerModal',

  components: {
    modal,
    BaseDataTable
  },

  props: {
    showModal: { type: Boolean, default: false }
  },

  emits: ['closeModal', 'itemSelected'],

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  data() {
    return {
      isShowModal: this.showModal,
      searchForm: {
        stockNumber: '',
        running: '',
        createBy: ''
      },
      data: { data: [], total: 0 },
      take: 20,
      skip: 0,
      sort: [{ field: 'createDate', dir: 'desc' }],

      columns: [
        {
          field: 'action',
          header: '',
          width: '80px',
          sortable: false
        },
        {
          field: 'stockNumber',
          header: 'เลขที่ผลิต',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'running',
          header: 'ใบตีราคา',
          sortable: true,
          width: '140px'
        },
        {
          field: 'createDate',
          header: 'วันที่',
          sortable: true,
          width: '140px'
        },
        {
          field: 'createBy',
          header: 'ผู้สร้าง',
          sortable: true,
          width: '120px'
        },
        {
          field: 'totalPrice',
          header: 'ราคารวม',
          sortable: false,
          width: '120px'
        },
        {
          field: 'currencyUnit',
          header: 'สกุลเงิน',
          sortable: false,
          width: '80px'
        }
      ]
    }
  },

  watch: {
    showModal(val) {
      this.isShowModal = val
      if (val) {
        this.resetForm()
        this.fetchData()
      }
    },
    isShowModal(val) {
      if (!val) this.$emit('closeModal')
    }
  },

  methods: {
    async onSearch() {
      this.skip = 0
      await this.fetchData()
    },

    onClearSearch() {
      this.searchForm = { stockNumber: '', running: '', createBy: '' }
      this.skip = 0
      this.fetchData()
    },

    onSelectItem(version) {
      this.$emit('itemSelected', version)
      this.isShowModal = false
    },

    onCancel() {
      this.isShowModal = false
    },

    resetForm() {
      this.searchForm = { stockNumber: '', running: '', createBy: '' }
      this.skip = 0
      this.sort = [{ field: 'createDate', dir: 'desc' }]
    },

    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchData()
    },

    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => ({
        field: item.field,
        dir: item.order === 1 ? 'asc' : 'desc'
      }))
      this.fetchData()
    },

    async fetchData() {
      const res = await this.productStore.fetchListCostVersion({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.searchForm
      })
      if (res) {
        this.data = { ...res }
      }
    },

    getTotalPrice(item) {
      if (!item.prictransection || !Array.isArray(item.prictransection)) return 0
      return item.prictransection.reduce((sum, t) => sum + (t.totalPrice || 0), 0)
    },

    formatDateTime(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    formatCurrency(value) {
      if (value === null || value === undefined || value === '') return '-'
      return formatDecimal(Number(value), 2)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.title-text-lg {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--base-font-color);
  display: flex;
  align-items: center;
}

.cost-version-table-container {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
}

.stock-link {
  color: var(--base-font-color);
  font-weight: 600;
  cursor: default;
}

.gap-1 {
  gap: 4px;
}
</style>
