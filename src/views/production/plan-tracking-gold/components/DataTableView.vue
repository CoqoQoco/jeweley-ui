<template>
  <div>
    <BaseDataTable
      :items="data.data"
      :totalRecords="data.total"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <!-- Action buttons template -->
      <template #actionsTemplate="{ data: rowData }">
        <div class="btn-action-container">
          <button
            class="btn btn-sm btn btn-main"
            title="โหมดเเก้ไข"
            @click="UpdatePlanGold(rowData)"
          >
            <i class="bi bi-brush"></i>
          </button>
          <button
            class="ml-1 btn btn-sm btn btn-dark"
            title="โหมดดูรายละเอียด"
            @click="ViewPlanGold(rowData)"
          >
            <i class="bi bi-clipboard2-data-fill"></i>
          </button>
        </div>
      </template>
    </BaseDataTable>
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
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-helper.js'

import moldalUpdate from './UpdateView.vue'
import modalView from './DataView.vue'

export default {
  components: {
    BaseDataTable,
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
      modelUpdate: {},

      columns: [
        {
          field: 'actions',
          header: '',
          sortable: false,
          minWidth: '100px'
        },
        {
          field: 'bookNo',
          header: 'เล่มที่',
          sortable: true
        },
        {
          field: 'no',
          header: 'เลขที่',
          sortable: true,
          minWidth: '50px'
        },
        {
          field: 'runningNumber',
          header: 'หมายเลขลำดับ',
          sortable: true
        },
        {
          field: 'assignDate',
          header: 'วันที่ออกใบเบิก',
          sortable: true,
          format: 'date'
        },
        {
          field: 'goldName',
          header: 'ประเภททอง',
          sortable: true
        },
        {
          field: 'goldSizeName',
          header: 'เปอร์เซ็นทอง',
          sortable: true
        },
        {
          field: 'cost',
          header: 'ราคาทอง',
          sortable: true,
          format: 'decimal2'
        },
        {
          field: 'zill',
          header: 'ซิล',
          sortable: true
        },
        {
          field: 'zillQty',
          header: 'จำนวนซิล',
          sortable: true,
          format: 'number'
        },
        {
          field: 'goldReceipt',
          header: 'สูตรผสมทอง',
          sortable: true
        },
        {
          field: 'assignBy',
          header: 'ผู้เบิกทอง',
          sortable: true
        },
        {
          field: 'receiveBy',
          header: 'ผู้รับทอง',
          sortable: true
        },
        {
          field: 'remark',
          header: 'รายละเอียด',
          sortable: true
        }
      ]
    }
  },
  methods: {
    // ----------- table ----------- //
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
          sort: this.sort,
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
