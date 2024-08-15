<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <DataTable
      :totalRecords="data.total"
      :value="data.data"
      v-model:expandedRows="expnadData"
      dataKey="id"
      ref="dt"
      class="p-datatable-sm"
      scrollable
      :scrollHeight="`calc(100vh - ${headerHeightPx} - 90px)`"
      resizableColumns
      :paginator="true"
      :lazy="true"
      @page="handlePageChange"
      @sort="handlePageChangeSort"
      :rows="take"
      removableSort
      sortMode="multiple"
      :rowsPerPageOptions="[10, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink  CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      :currentPageReportTemplate="`เเสดงข้อมูล {first} - {last} จากทั้งหมด {totalRecords} รายการ`"
    >
      <Column field="name" header="พลอย/เพชร" style="min-width: 150px"> </Column>
      <Column field="code" header="รหัส" sortable style="min-width: 150px"> </Column>
      <Column field="groupName" header="หมวดหมู่" sortable style="min-width: 150px"> </Column>
      <Column field="size" header="ขนาด" sortable style="min-width: 150px"> </Column>
      <Column field="shape" header="รูปร่าง" sortable style="min-width: 150px"> </Column>
      <Column field="grade" header="เกรด" sortable style="min-width: 150px"> </Column>
      <Column field="quantity" header="จำนวน" sortable style="min-width: 150px">
        <template #body="slotProps">
          {{
            slotProps.data.quantity
              ? Number(slotProps.data.quantity).toFixed(3).toLocaleString()
              : '0.000'
          }}
        </template>
      </Column>
      <Column field="price" header="ราคา" sortable style="min-width: 150px">
        <template #body="slotProps">
          {{
            slotProps.data.price ? Number(slotProps.data.price).toFixed(2).toLocaleString() : '0.00'
          }}
        </template>
      </Column>
      <Column field="priceQty" header="ราคาต่อหน่วย" sortable style="min-width: 150px">
        <template #body="slotProps">
          {{
            slotProps.data.priceQty
              ? Number(slotProps.data.priceQty).toFixed(2).toLocaleString()
              : '0.00'
          }}
        </template>
      </Column>
      <Column field="unit" header="หน่วย" sortable style="min-width: 150px"> </Column>
      <Column field="unitCode" header="รหัสหน่วย" sortable style="min-width: 150px"> </Column>
      <Column field="remark1" header="หมายเหตุ-1" sortable style="min-width: 150px"> </Column>
      <!-- <Column field="remark2" header="หมายเหตุ-2" sortable style="min-width: 150px"> </Column> -->
    </DataTable>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-config.js'

export default {
  components: {
    loading,
    DataTable,
    Column
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    headerHeight: {
      type: Number,
      default: 0
    }
  },
  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
        this.fetchData()
      },
      deep: true
    }
  },
  computed: {
    //  ---------------- computed --------
    headerHeightPx() {
      console.log('headerHeightPx', this.headerHeight)
      return `${this.headerHeight}px`
    }
  },
  data() {
    return {
      isLoading: false,

      //--------- table ---------//
      totalRecords: 0,
      take: 10, //all
      skip: 0,
      //sortField: 'updateDate',
      //sortOrder: -1, // หรือ -1 สำหรับ descending
      sort: [],
      //sort: [],
      data: {},
      dataExcel: {},
      expnadData: [],
      form: null
    }
  },
  methods: {
    // ----------- table ----------- //
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => {
        return { field: item.field, dir: item.order === 1 ? 'asc' : 'desc' }
      })
      //console.log(e)
      this.fetchData()
    },
    handlePageChangeSort(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => {
        return { field: item.field, dir: item.order === 1 ? 'asc' : 'desc' }
      })
      this.fetchData()
    },

    // ----------- APIs ----------- //
    async fetchData() {
      try {
        this.isLoading = true

        const params = {
          take: this.take,
          skip: this.skip,
          sort: this.sort,
          search: {
            code: this.form.code ?? null,
            groupName: this.form.groupName ?? null,
            grade: this.form.grade ?? null,
            shape: this.form.shape ?? null,
            size: this.form.size ?? null
          }
        }
        console.log('params', params)
        const res = await api.jewelry.post('StockGem/SearchData', params)
        if (res) {
          this.data = { ...res }
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },

    // -------- helper function -------- //
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },
    stringToArray(str) {
      console.log('stringToArray', str)
      if (str && typeof str === 'string') {
        // ตัดช่องว่างหน้าและหลังสตริง
        str = str.trim()
        //console.log('stringToArray', str)

        // ถ้าไม่มีเครื่องหมายจุลภาค ให้คืนค่าเป็น array ที่มีสมาชิกเดียว
        if (!str.includes(',')) {
          return str ? [str] : []
        }

        // แยกด้วยเครื่องหมายจุลภาค, ตัดช่องว่าง, และกรองค่าว่างออก
        const res = str
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item !== '')
        return res
      } else {
        return []
      }
    }

    // -------- event -------- //
  },
  created() {
    console.log('created', this.modelForm)
    this.form = { ...this.modelForm }
    this.$nextTick(() => {
      this.fetchData()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.box-image-show {
  display: flex;
  gap: 5px;
}
</style>
