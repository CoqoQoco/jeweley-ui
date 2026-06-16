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
      <template #actionsTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn-main mr-2" :title="$t('view.worker.workerList.btnEdit')" @click="onUpdate(data)">
            <i class="bi bi-database-fill-gear"></i>
          </button>
          <button class="btn btn-sm btn-main" :title="$t('view.worker.workerList.btnWages')" @click="onGoWages(data)">
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
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { usePlanWorkerApiStore } from '@/stores/modules/api/worker/plan-worker-store.js'

import updateView from '../modal/update-view.vue'

export default {
  components: {
    BaseDataTable,
    updateView
  },

  mixins: [dataTablePaging],

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
    },
    columns() {
      return [
        {
          field: 'actions',
          header: '',
          sortable: false,
          width: '50px'
        },
        {
          field: 'code',
          header: this.$t('view.worker.workerList.colCode'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'nameTh',
          header: this.$t('view.worker.workerList.colNameTh'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'nameEn',
          header: this.$t('view.worker.workerList.colNameEn'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'typeName',
          header: this.$t('view.worker.workerList.colDept'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'createDate',
          header: this.$t('view.worker.workerList.colCreateDate'),
          sortable: true,
          format: 'datetime',
          minWidth: '150px'
        },
        {
          field: 'isActive',
          header: this.$t('view.worker.workerList.colStatus'),
          sortable: false,
          width: '130px'
        }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    }
  },

  data() {
    return {
      isShowUpdate: false,
      dataUpdate: {}
    }
  },

  methods: {
    onCloseModal() {
      this.isShowUpdate = false
      this.dataUpdate = {}
    },
    onUpdate(e) {
      this.dataUpdate = { ...e }
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

    getStatusSeverity(status) {
      return status ? 'box-status-success' : 'box-status-disable'
    },
    getStatusName(status) {
      return status
        ? this.$t('view.worker.workerList.statusActive')
        : this.$t('view.worker.workerList.statusInactive')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
