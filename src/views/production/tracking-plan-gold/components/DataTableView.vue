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
      scrollHeight="calc(100vh - 240px)"
      resizableColumns
      :paginator="true"
      :lazy="true"
      @page="handlePageChange"
      @sort="handlePageChangeSort"
      :rows="take"
      removableSort
      sortMode="multiple"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink  CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      :currentPageReportTemplate="`เเสดงข้อมูล {first} - {last} จากทั้งหมด {totalRecords} รายการ`"
    >
      <Column style="min-width: 100px">
        <template #body="slotProps">
          <div class="btn-action-container">
            <button
              class="btn btn-sm btn btn-main"
              title="โหมดเเก้ไข"
              @click="UpdatePlanGold(slotProps.data)"
            >
              <i class="bi bi-brush"></i>
            </button>
            <button
              class="ml-1 btn btn-sm btn btn-dark"
              title="โหมดดูรายละเอียด"
              @click="ViewPlanGold(slotProps.data)"
            >
              <i class="bi bi-clipboard2-data-fill"></i>
            </button>
          </div>
        </template>
      </Column>
      <Column field="bookNo" header="เล่มที่" style="min-width: 150px"> </Column>
      <Column field="no" header="เลขที่" style="min-width: 50px"> </Column>
      <Column field="runningNumber" header="หมายเลขลำดับ" style="min-width: 150px"> </Column>
      <Column header="วันที่ออกใบเบิก" field="requestDate" style="min-width: 150px">
        <template #body="prop">
          {{ formatDate(prop.data.assignDate) }}
        </template>
      </Column>
      <Column field="goldName" header="ประเภททอง" style="min-width: 150px"> </Column>
      <Column field="goldSizeName" header="เปอร์เซ็นทอง" style="min-width: 150px"> </Column>
      <Column field="cost" header="ราคาทอง" style="min-width: 150px"> </Column>
      <Column field="zill" header="ซิล" style="min-width: 150px"> </Column>
      <Column field="zillQty" header="จำนวนซิล" style="min-width: 150px"> </Column>
      <Column field="goldReceipt" header="สูตรผสมทอง" style="min-width: 150px"> </Column>
      <Column field="assignBy" header="ผู้เบิกทอง" style="min-width: 150px"> </Column>
      <Column field="receiveBy" header="ผู้รับทอง" style="min-width: 150px"> </Column>
      <Column field="remark" header="รายละเอียด" style="min-width: 100px"> </Column>
    </DataTable>
    <moldalUpdate
      :isShow="isShowMoldalUpdate"
      :modelMasterGold="masterGold"
      :modelMasterGoldSize="masterGoldSize"
      :modelValue="modelUpdate"
      @fetch="fetchFormUpdate"
      @closeModal="onCloseFormUpdate"
    >
    </moldalUpdate>
    <modalView
      :isShow="isShowModalView"
      :modelMasterGold="masterGold"
      :modelMasterGoldSize="masterGoldSize"
      :modelValue="modelUpdate"
      @closeModal="onCloseFormView"
    >
    </modalView>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-config.js'

import moldalUpdate from './UpdateView.vue'
import modalView from './DataView.vue'

export default {
  components: {
    loading,
    DataTable,
    Column,
    moldalUpdate,
    modalView
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
        this.fetchData()
      },
      deep: true
    }
  },
  data() {
    return {
      isLoading: false,
      isShowMoldalUpdate: false,
      isShowModalView: false,

      //--------- table ---------//
      totalRecords: 0,
      take: 10, //all
      skip: 0,
      //sortField: 'updateDate',
      //sortOrder: -1, // หรือ -1 สำหรับ descending
      //sort: [{ field: 'updateDate', dir: 'desc' }],
      sort: [],
      data: {},
      dataExcel: {},
      expnadData: [],

      form: null,
      masterGold: [],
      masterGoldSize: [],
      modelUpdate: {}
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

    // -------- helper function -------- //
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },

    // -------- modal update -------- //
    UpdatePlanGold(e) {
      this.modelUpdate = { ...e }
      this.isShowMoldalUpdate = true
    },
    fetchFormUpdate() {
      this.isShowMoldalUpdate = false
      this.fetchData()
    },
    onCloseFormUpdate() {
      this.isShowMoldalUpdate = false
    },

    // -------- modal view -------- //
    ViewPlanGold(e) {
      this.modelUpdate = { ...e }
      this.isShowModalView = true
    },
    onCloseFormView() {
      this.isShowModalView = false
    },

    // --------- APIs ---------//
    async fetchData() {
      try {
        this.isLoading = true
        this.data = {}
        //console.log(this.formValue)
        const param = {
          take: this.take,
          skip: this.skip,
          search: {
            text: this.form.text,
            runningNumber: this.form.runningNumber,
            createStart: this.form.createStart ? formatISOString(this.form.createStart) : null,
            createEnd: this.form.createEnd ? formatISOString(this.form.createEnd) : null
          }
        }
        const res = await api.jewelry.post('ProductionPlanCost/ListGoldCost', param)
        if (res) {
          this.data = { ...res }
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterGold() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGold')
        if (res) {
          this.masterGold = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterGoldSize() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGoldSize')
        if (res) {
          this.masterGoldSize = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  },
  created() {
    this.form = { ...this.modelForm }
    this.$nextTick(() => {
      this.fetchMasterGold()
      this.fetchMasterGoldSize()
      this.fetchData()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
