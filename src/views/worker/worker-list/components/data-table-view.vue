<template>
  <div class="mt-2">
    <BaseDataTable
      :items="workerStore.dataSearch"
      :totalRecords="workerStore.dataSearchTotalRecord"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <!-- Action buttons template -->
      <template #actionsTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn btn-main mr-2" title="เเก้ไข" @click="onUpdate(data)">
            <i class="bi bi-database-fill-gear"></i>
          </button>
          <button class="btn btn-sm btn btn-main" title="ค่าเเรง" @click="onGoWages(data)">
            <i class="bi bi-wallet-fill"></i>
          </button>
        </div>
      </template>

      <template #isActiveTemplate="{ data }">
        <div :class="getStatusSeverity(data.isActive)">
          {{ getStatusName(data.isActive) }}
        </div>
      </template>
    </BaseDataTable>

    <updateView
      :isShow="isShowUpdate"
      :modelUpdate="dataUpdate"
      @closeModal="onCloseModal"
      @fetch="fetchDataByUpdate"
    ></updateView>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { usePlanWorkerApiStore } from '@/stores/modules/api/worker/plan-worker-store.js'

import updateView from '../modal/update-view.vue'

export default {
  components: {
    BaseDataTable,
    updateView
  },

  setup() {
    const workerStore = usePlanWorkerApiStore()
    return { workerStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
      required: true
    },
    modelFormExport: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  computed: {
    form() {
      return this.modelForm || {}
    }
  },

  watch: {
    async modelForm() {
      //console.log(this.modelForm)
      this.take = 10
      this.skip = 0
      await this.fetchData()
    },
    async modelFormExport() {
      //console.log(this.modelForm)
      await this.fetchDataExport()
    }
  },

  data() {
    return {
      take: 10,
      skip: 0,
      sort: [],
      columns: [
        {
          field: 'actions',
          header: '',
          sortable: false,
          width: '50px'
        },
        {
          field: 'code',
          header: 'รหัส',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'nameTh',
          header: 'ชื่อ TH',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'nameEn',
          header: 'ชื่อ EN',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'typeName',
          header: 'แผนกช่าง',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'createDate',
          header: 'สร้างข้อมูล',
          sortable: true,
          format: 'datetime',
          minWidth: '150px'
        },
        {
          field: 'isActive',
          header: 'สถานะ',
          sortable: false,
          width: '130px'
        }
      ],

      data: [],

      isShowUpdate: false,
      dataUpdate: {}
    }
  },

  methods: {
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

    onCloseModal() {
      this.isShowUpdate = false
      this.dataUpdate = {}
    },
    onUpdate(e) {
      this.dataUpdate = { ...e }
      //console.log('onUpdated', this.dataUpdate)
      this.isShowUpdate = true
    },

    onGoWages(item) {
      const id = item.code
      window.open(`/worker-daily-wages/${id}`, '_blank')
    },

    async fetchDataByUpdate() {
      await this.fetchData()
      this.onCloseModal()
    },

    async fetchData() {
      await this.workerStore.fetchSearch({
        skip: this.skip,
        take: this.take,
        sort: this.sort,
        formValue: this.form
      })
    },

    // async fetchDataExport() {
    //   //console.log('fetchDataExport')
    //   await this.receiptProductionStore.fetchConfirmHistoryExport({
    //     sort: this.sort,
    //     formValue: this.form
    //   })
    // }

    getStatusSeverity(status) {
      return status ? 'box-status-success' : 'box-status-disable'
    },
    getStatusName(status) {
      return status ? 'เปิดใช้งาน' : 'ปิดใช้งาน'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
