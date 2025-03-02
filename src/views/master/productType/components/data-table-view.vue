<template>
  <div class="mt-2">
    <BaseDataTable
      :items="data.data"
      :totalRecords="data.total"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <!-- Action buttons template -->
      <template #actionsTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn btn-main" title="เเก้ไข" @click="onUpdate(data)">
            <i class="bi bi-brush"></i>
          </button>
        </div>
      </template>

      <template #woTextTemplate="{ data }">
        <div>
          {{ `${data.wo}-${data.woNumber}` }}
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

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import updateView from '../modal/update-view.vue'

export default {
  components: {
    BaseDataTable,
    updateView
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
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
          field: 'nameEn',
          header: 'ชื่อ EN',
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
          field: 'prefix',
          header: 'อักษรหน้าสินค้า',
          sortable: true,
          minWidth: '150px'
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
    async fetchDataByUpdate() {
      await this.fetchData()
      this.onCloseModal()
    },

    async fetchData() {
      this.data = await this.masterStore.fetchListMaster({
        skip: this.skip,
        take: this.take,
        sort: this.sort,
        form: this.form
      })
    },

    async fetchDataExport() {
      //console.log('fetchDataExport')
      await this.receiptProductionStore.fetchConfirmHistoryExport({
        sort: this.sort,
        formValue: this.form
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
