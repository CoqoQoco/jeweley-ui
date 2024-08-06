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
      scrollHeight="calc(100vh - 290px)"
      resizableColumns
      :paginator="true"
      :lazy="true"
      @page="handlePageChange"
      @sort="handlePageChangeSort"
      :rows="take"
      removableSort
      sortMode="multiple"
      :rowsPerPageOptions="[10, 30]"
      paginatorTemplate="FirstPageLink PrevPageLink  CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      :currentPageReportTemplate="`เเสดงข้อมูล {first} - {last} จากทั้งหมด {totalRecords} รายการ`"
    >
      <Column>
        <template #body="slotProps">
          <div>
            <button
              class="btn btn-sm btn-green"
              title="คืนเเม่พิมพ์"
              @click="showModalReturn(slotProps.data)"
            >
              <i class="bi bi-arrow-bar-down"></i>
            </button>
          </div>
        </template>
      </Column>
      <Column header="กำหนดคืน" field="returnDateSet" sortable style="min-width: 150px">
        <template #body="prop">
          <div class="notification">
            <span>{{ formatDate(prop.data.returnDateSet) }}</span>
            <span v-if="prop.data.isOverReturn && !prop.data.isSetReturn" class="overdue-tag"
              >เกินกำหนด</span
            >
            <span v-if="prop.data.isSetReturn" class="duedate-tag">กำหนดคืนวันนี้</span>
          </div>
        </template>
      </Column>
      <Column header="หมายเลขลำดับ" field="running" sortable style="min-width: 150px"></Column>
      <Column header="เเม่พิมพ์" field="mold" sortable style="min-width: 150px"></Column>
      <!-- <Column header="กำหนดคืน" field="returnDateSet" sortable style="min-width: 150px">
        <template #body="prop">
          <div class="notification">
            <span>{{ formatDate(prop.data.returnDateSet) }}</span>
            <span v-if="prop.data.isOverReturn && !prop.data.isSetReturn" class="overdue-tag"
              >เกินกำหนด</span
            >
            <span v-if="prop.data.isSetReturn" class="duedate-tag">กำหนดคืนวันนี้</span>
          </div>
        </template>
      </Column> -->
      <Column header="วันที่เบิก" field="checkOutDate" sortable style="min-width: 150px">
        <template #body="prop">
          {{ formatDate(prop.data.checkOutDate) }}
        </template>
      </Column>
      <Column header="ผู้เบิก" field="checkOutName" sortable style="min-width: 150px"></Column>
      <Column
        header="คำอธิบายเบิก"
        field="checkOutDescription"
        sortable
        style="min-width: 150px"
      ></Column>
    </DataTable>

    <modalReturn
      :isShow="isShowReturn"
      :modelValue="returnModel"
      @closeModal="closeModalReturn"
      @fetch="fetchDataByReturn"
    ></modalReturn>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
//const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-config.js'

import modalReturn from './ReturnView.vue'

export default {
  components: {
    loading,
    DataTable,
    Column,
    modalReturn
    //imagePreview
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }

        console.log('watch modelForm', val)

        this.fetchData()
      },
      deep: true
    }
  },
  data() {
    return {
      isLoading: false,
      isLoadingImage: false,
      isShowReturn: false,

      //--------- table ---------//
      totalRecords: 0,
      take: 10, //all
      skip: 0,
      //sortField: 'updateDate',
      //sortOrder: -1, // หรือ -1 สำหรับ descending
      sort: [{ field: 'updateDate', dir: 'desc' }],
      //sort: [],
      data: {},
      dataExcel: {},
      expnadData: [],
      form: null,

      //--------- dataUpdate ---------//
      returnModel: {}
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
            text: this.form.text ?? null,
            checkOutDateStart: this.form.checkOutDateStart
              ? formatISOString(this.form.checkOutDateStart)
              : null,
            checkOutDateEnd: this.form.checkOutDateEnd
              ? formatISOString(this.form.checkOutDateEnd)
              : null,
            returnDateStart: this.form.returnDateStart
              ? formatISOString(this.form.returnDateStart)
              : null,
            returnDateEnd: this.form.returnDateEnd ? formatISOString(this.form.returnDateEnd) : null
          }
        }
        console.log('params', params)
        const res = await api.jewelry.post('StockMold/SearchCheckOutList', params)
        if (res) {
          this.data = null
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
    },
    getImgUrl(data) {
      switch (data.status) {
        case 10:
          return data.imgDesign ?? []
        case 20:
          return data.imgResin ?? []
        case 30:
          return data.imgCastingSilver ?? []
        case 40:
          return data.imgCasting ?? []
        case 50:
          return data.imgCutting ?? []
        case 60:
          return data.imgStore ?? []
        default:
          return []
      }
    },
    getImgPath(data) {
      switch (data.status) {
        case 10:
          return 'Images/MoldPlanDesign'
        case 20:
          return 'Images/MoldPlanResin'
        case 30:
          return 'Images/MoldPlanCastingSilver'
        case 40:
          return 'Images/MoldPlanCasting'
        case 50:
          return 'Images/MoldPlanCutting'
        case 60:
          return 'Images/Mold'
        default:
          return null
      }
    },

    // -------- event -------- //
    showModalReturn(data) {
      this.returnModel = { ...data }
      this.isShowReturn = true
    },
    closeModalReturn() {
      this.returnModel = {}
      this.isShowReturn = false
    },
    fetchDataByReturn() {
      this.isShowReturn = false
      this.fetchData()

      // เเก้ปัญหา image ไม่เปลี่ยน
      // setTimeout(() => {
      //   window.location.reload()
      // }, 100) // ปรับเวลาตามความเหมาะสม
    }
  },
  created() {
    //console.log('created', this.modelForm)
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

.notification {
  display: inline-flex;
  align-items: center;
  //background-color: #ffe6e6; /* ส้มอ่อน */
  //padding: 4px 8px;
  //border-radius: 4px;
}

.overdue-tag {
  background-color: #ff4d4d; /* สีแดง */
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: 4px;
  font-size: 12px;
}
.duedate-tag {
  background-color: #038387; /* สีแดง */
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: 4px;
  font-size: 12px;
}
</style>
