<template>
  <div class="app-container">
    <!-- Search Form -->
    <div class="card-container">
      <div class="card-header">
        <h6 class="mb-0">ค้นหาตะกร้าสินค้า</h6>
      </div>
      <div class="card-body">
        <div class="form-col-container">
          <div>
            <span class="title-text">เลขที่ตะกร้า</span>
            <input
              class="form-control"
              type="text"
              v-model.trim="form.basketNumber"
              placeholder="เลขที่ตะกร้า"
            />
          </div>
          <div>
            <span class="title-text">ชื่องาน/บูท</span>
            <input
              class="form-control"
              type="text"
              v-model.trim="form.basketName"
              placeholder="ชื่องาน/บูท"
            />
          </div>
          <div>
            <span class="title-text">สถานะ</span>
            <select class="form-control" v-model="form.status">
              <option :value="null">ทั้งหมด</option>
              <option :value="0">Draft</option>
              <option :value="1">รออนุมัติ</option>
              <option :value="2">อนุมัติแล้ว</option>
              <option :value="3">CheckedOut</option>
              <option :value="4">ปิด</option>
            </select>
          </div>
          <div>
            <span class="title-text">ผู้รับผิดชอบ</span>
            <input
              class="form-control"
              type="text"
              v-model.trim="form.responsible"
              placeholder="ผู้รับผิดชอบ"
            />
          </div>
        </div>

        <div class="d-flex mt-3 gap-2">
          <button class="btn btn-sm btn-green" @click="onSearch">
            <i class="bi bi-search"></i>
            <span class="ml-1">ค้นหา</span>
          </button>
          <button class="btn btn-sm btn-outline-main" @click="onClear">
            <i class="bi bi-x-circle"></i>
            <span class="ml-1">ล้าง</span>
          </button>
          <button class="btn btn-sm btn-main ml-auto" @click="onCreate">
            <i class="bi bi-plus-circle"></i>
            <span class="ml-1">สร้างตะกร้าใหม่</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card-container mt-3">
      <div class="card-body">
        <BaseDataTable
          :items="dataList.data"
          :totalRecords="dataList.total"
          :columns="columns"
          :perPage="take"
          :paginator="true"
          @page="handlePageChange"
          @sort="handleSortChange"
        >
          <template #statusNameTemplate="{ data }">
            <span :class="getStatusBadgeClass(data.status)">
              {{ data.statusName }}
            </span>
          </template>

          <template #actionTemplate="{ data }">
            <button
              class="btn btn-sm btn-green"
              @click="onView(data)"
              title="ดู/แก้ไข"
            >
              <i class="bi bi-eye"></i>
            </button>
          </template>
        </BaseDataTable>
      </div>
    </div>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { useStockBasketApiStore } from '@/stores/modules/api/sale/stock-basket-store.js'

const interfaceForm = {
  basketNumber: null,
  basketName: null,
  status: null,
  responsible: null
}

export default {
  name: 'StockBasketIndexView',

  components: {
    BaseDataTable
  },

  data() {
    return {
      form: { ...interfaceForm },
      dataList: { data: [], total: 0 },
      take: 10,
      skip: 0,
      sort: [],

      columns: [
        { field: 'basketNumber', header: 'เลขที่ตะกร้า', minWidth: '140px', sortable: true },
        { field: 'basketName', header: 'ชื่องาน/บูท', minWidth: '160px', sortable: true },
        { field: 'eventDate', header: 'วันที่งาน', minWidth: '110px', format: 'date', sortable: true },
        { field: 'responsible', header: 'ผู้รับผิดชอบ', minWidth: '130px', sortable: true },
        { field: 'totalItems', header: 'จำนวนสินค้า', minWidth: '110px', align: 'right', sortable: true },
        { field: 'statusName', header: 'สถานะ', minWidth: '120px', sortable: false },
        { field: 'createDate', header: 'วันที่สร้าง', minWidth: '110px', format: 'date', sortable: true },
        { field: 'action', header: '', minWidth: '80px', sortable: false }
      ]
    }
  },

  setup() {
    const store = useStockBasketApiStore()
    return { store }
  },

  async created() {
    await this.fetchData()
  },

  methods: {
    async fetchData() {
      this.dataList = await this.store.fetchList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.form
      })
    },

    async onSearch() {
      this.skip = 0
      await this.fetchData()
    },

    onClear() {
      this.form = { ...interfaceForm }
      this.skip = 0
      this.fetchData()
    },

    onCreate() {
      this.$router.push('/sale/stock-basket/new')
    },

    onView(data) {
      this.$router.push('/sale/stock-basket/' + data.running)
    },

    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchData()
    },

    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta
        ? e.multiSortMeta.map((item) => ({
            field: item.field,
            dir: item.order === 1 ? 'asc' : 'desc'
          }))
        : []
      this.fetchData()
    },

    getStatusBadgeClass(status) {
      const map = {
        0: 'badge badge-secondary',
        1: 'badge badge-warning',
        2: 'badge badge-info',
        3: 'badge badge-success',
        4: 'badge badge-dark'
      }
      return map[status] || 'badge badge-secondary'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.gap-2 {
  gap: 8px;
}
</style>
