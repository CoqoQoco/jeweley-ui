<template>
  <div class="app-container">
    <loading :isLoading="isLoading"> </loading>
    <div class="filter-container">
      <pageTitle
        title="ข้อมูลเบิกผสมทอง"
        description="ข้อมูลเบิกผสมทอง เพิ่ม/เเก้ไข เเละรายละเอียดต่างๆ"
        :isShowBtnClose="false"
        isShowRightSlot
      >
      </pageTitle>
      <form @submit.prevent="onSearch">
        <div class="search-bar-container">
          <div>
            <span class="text-title">ค้นหาใบผสมทอง</span>
            <div class="input-group input-group-inner">
              <input
                id="inputStockID"
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.text"
                placeholder="พิมพ์บางอย่างเพื่อค้นหา"
              />
              <div class="input-group-append">
                <span class="input-group-text">
                  <i class="bi bi-upc-scan text-main-color"></i>
                </span>
              </div>
            </div>
          </div>
          <div>
            <!-- <span class="text-title">ค้นหาใบผสมทอง</span>
            <div class="input-group input-group-inner">
              <input
                id="inputStockID"
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.text"
                placeholder="พิมพ์บางอย่างเพื่อค้นหา"
              />
              <div class="input-group-append">
                <span class="input-group-text">
                  <i class="bi bi-upc-scan text-main-color"></i>
                </span>
              </div>
            </div> -->
          </div>
          <div>
            <!-- <span class="text-title">ค้นหาใบผสมทอง</span>
            <div class="input-group input-group-inner">
              <input
                id="inputStockID"
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.text"
                placeholder="พิมพ์บางอย่างเพื่อค้นหา"
              />
              <div class="input-group-append">
                <span class="input-group-text">
                  <i class="bi bi-upc-scan text-main-color"></i>
                </span>
              </div>
            </div> -->
          </div>
          <div class="btn-container">
            <button type="submit" class="btn btn-sm btn-main mr-2">
              <span class="mr-2">
                <i class="bi bi-search"></i>
              </span>
              <span>ค้นหา</span>
            </button>
            <button type="button" @click="onClear" class="btn btn-sm btn-dark mr-2">
              <span class="mr-2">
                <i class="bi bi-x-circle"></i>
              </span>
              <span>ล้างคำค้นหา</span>
            </button>
            <button type="button" @click="onShowFormAddGoldCost" class="btn btn-sm btn-warning">
              <span class="mr-2">
                <i class="bi bi-plus"></i>
              </span>
              <span>เพิ่มข้อมูลผสมทอง</span>
            </button>
          </div>
        </div>
      </form>
    </div>
    <FormCreate
      :isShow="isShowFormAddGoldCost"
      :masterGold="masterGold"
      :masterGoldSize="masterGoldSize"
      @fetch="fetchFormAddGoldCost"
      @closeModal="onCloseFormAddGoldCost"
    >
    </FormCreate>
    <FormUpdate
      :isShow="isShowFormUpdateGoldCost"
      :masterGold="masterGold"
      :masterGoldSize="masterGoldSize"
      :modelValue="modelUpdate"
      @fetch="fetchFormUpdateGoldCost"
      @closeModal="onCloseFormUpdateGoldCost"
    >
    </FormUpdate>
    <FormView
      :isShow="isShowFormViewGoldCost"
      :masterGold="masterGold"
      :masterGoldSize="masterGoldSize"
      :modelValue="modelUpdate"
      @closeModal="onCloseFormViewGoldCost"
    >
    </FormView>
    <DataTable
      :totalRecords="data.total"
      :value="data.data"
      v-model:expandedRows="expnadData"
      dataKey="id"
      class="p-datatable-sm mt-2"
      scrollable
      scrollHeight="calc(100vh - 310px)"
      columnResizeMode="expand"
      resizableColumns
      :paginator="true"
      :lazy="true"
      @page="handlePageChange"
      :rows="take"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink  CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      :currentPageReportTemplate="`เเสดงข้อมูล {first} - {last} จากทั้งหมด {totalRecords} รายการ`"
    >
      <Column style="width: 100px">
        <template #body="slotProps">
          <div class="btn-action-container">
            <button
              class="btn btn-sm btn btn-main"
              title="โหมดเเก้ไข"
              @click="UpdateCost(slotProps.data)"
            >
              <i class="bi bi-brush"></i>
            </button>
            <button
              class="ml-1 btn btn-sm btn btn-dark"
              title="โหมดดูรายละเอียด"
              @click="ViewCost(slotProps.data)"
            >
              <i class="bi bi-clipboard2-data-fill"></i>
            </button>
          </div>
        </template>
      </Column>
      <Column field="bookNo" header="เล่มที่" style="width: 80px"> </Column>
      <Column field="no" header="เลขที่" style="width: 80px"> </Column>
      <Column field="runningNumber" header="หมายเลขลำดับ" style="width: 100px"> </Column>
      <Column header="วันที่ออกใบเบิก" field="requestDate" style="width: 100px">
        <template #body="prop">
          {{ formatDate(prop.data.assignDate) }}
        </template>
      </Column>
      <Column field="goldName" header="ประเภททอง" style="width: 100px"> </Column>
      <Column field="goldSizeName" header="เปอร์เซ็นทอง" style="width: 100px"> </Column>
      <Column field="goldReceipt" header="สูตรผสมทอง" style="width: 150px"> </Column>
      <Column field="assignBy" header="ผู้เบิกทอง" style="width: 150px"> </Column>
      <Column field="receiveBy" header="ผู้รับทอง" style="width: 150px"> </Column>
      <Column field="remark" header="รายละเอียด" style="min-width: 100px"> </Column>
    </DataTable>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import api from '@/axios/axios-config.js'

import FormCreate from './components/FormCreate.vue'
import FormUpdate from './components/FormUpdate.vue'
import FormView from './components/FormView.vue'

const interfaceForm = {
  text: null
}
export default {
  components: {
    loading,
    pageTitle,
    FormCreate,
    DataTable,
    Column,
    FormUpdate,
    FormView
  },
  data() {
    return {
      // --- flag --- //
      isLoading: false,
      isShowFormAddGoldCost: false,
      isShowFormUpdateGoldCost: false,
      isShowFormViewGoldCost: false,
      // --- form --- //
      form: {
        ...interfaceForm
      },
      masterGold: [],
      masterGoldSize: [],
      modelUpdate: {},

      // table
      totalRecords: 0,
      take: 10, //all
      skip: 0,
      data: {},
      expnadData: []
    }
  },
  methods: {
    // ---- controller ----- //
    onSearch() {
      this.fetchData()
    },
    onClear() {},
    onShowFormAddGoldCost() {
      this.isShowFormAddGoldCost = true
    },
    onCloseFormAddGoldCost() {
      this.isShowFormAddGoldCost = false
    },
    fetchFormAddGoldCost() {
      this.isShowFormAddGoldCost = false
      this.fetchData()
    },
    UpdateCost(e) {
      this.modelUpdate = { ...e }
      this.onShowFormUpdateGoldCost()
    },
    ViewCost(e) {
      this.modelUpdate = { ...e }
      this.isShowFormViewGoldCost = true
    },
    onShowFormUpdateGoldCost() {
      this.isShowFormUpdateGoldCost = true
    },
    onCloseFormUpdateGoldCost() {
      this.isShowFormUpdateGoldCost = false
    },
    fetchFormUpdateGoldCost() {
      this.isShowFormUpdateGoldCost = false
      this.fetchData()
    },
    onCloseFormViewGoldCost() {
      this.isShowFormViewGoldCost = false
    },

    // ----- table -------- //
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchData()
    },

    //  -------- APIs --------- //
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
    },
    async fetchData() {
      try {
        this.isLoading = true
        this.data = {}
        //console.log(this.formValue)
        const param = {
          take: this.take,
          skip: this.skip,
          search: {
            text: this.form.text
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

    // ------ helper ------//
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    }
  },
  created() {
    this.fetchMasterGold()
    this.fetchMasterGoldSize()
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/search-bar.scss';

.search-bar-container {
  display: grid;
  grid-template-columns: 3fr 3fr 3fr 5fr;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
