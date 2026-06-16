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
            class="btn btn-sm btn-main"
            title="โหมดเเก้ไข"
            @click="UpdatePlanGold(rowData)"
          >
            <i class="bi bi-brush"></i>
          </button>
          <button
            class="ml-1 btn btn-sm btn-dark"
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
// External
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-helper.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

// Local
import moldalUpdate from './update-view.vue'
import modalView from './data-view.vue'

export default {
  mixins: [dataTablePaging],

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
      handler() {
        this.form = { ...this.modelForm }
        this.resetPaging()
      },
      deep: true
    }
  },

  data() {
    return {
      isShowMoldalUpdate: false,
      isShowModalView: false,
      data: {},
      dataExcel: {},
      form: null,
      masterGold: [],
      masterGoldSize: []
    }
  },

  computed: {
    modelUpdate() {
      return this._modelUpdate || {}
    },
    columns() {
      return [
        {
          field: 'actions',
          header: '',
          sortable: false,
          minWidth: '100px'
        },
        {
          field: 'bookNo',
          header: this.$t('view.production.planTrackingGold.colBookNo'),
          sortable: true
        },
        {
          field: 'no',
          header: this.$t('view.production.planTrackingGold.colNo'),
          sortable: true,
          minWidth: '50px'
        },
        {
          field: 'runningNumber',
          header: this.$t('view.production.planTrackingGold.colRunningNumber'),
          sortable: true
        },
        {
          field: 'assignDate',
          header: this.$t('view.production.planTrackingGold.colAssignDate'),
          sortable: true,
          format: 'date'
        },
        {
          field: 'goldName',
          header: this.$t('view.production.planTrackingGold.colGoldName'),
          sortable: true
        },
        {
          field: 'goldSizeName',
          header: this.$t('view.production.planTrackingGold.colGoldSizeName'),
          sortable: true
        },
        {
          field: 'cost',
          header: this.$t('view.production.planTrackingGold.colCost'),
          sortable: true,
          format: 'decimal2'
        },
        {
          field: 'zill',
          header: this.$t('view.production.planTrackingGold.colZill'),
          sortable: true
        },
        {
          field: 'zillQty',
          header: this.$t('view.production.planTrackingGold.colZillQty'),
          sortable: true,
          format: 'number'
        },
        {
          field: 'goldReceipt',
          header: this.$t('view.production.planTrackingGold.colGoldReceipt'),
          sortable: true
        },
        {
          field: 'assignBy',
          header: this.$t('view.production.planTrackingGold.colAssignBy'),
          sortable: true
        },
        {
          field: 'receiveBy',
          header: this.$t('view.production.planTrackingGold.colReceiveBy'),
          sortable: true
        },
        {
          field: 'remark',
          header: this.$t('common.field.remark'),
          sortable: true
        }
      ]
    }
  },

  methods: {
    // -------- helper function -------- //
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },

    // -------- modal update -------- //
    UpdatePlanGold(e) {
      this._modelUpdate = { ...e }
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
      this._modelUpdate = { ...e }
      this.isShowModalView = true
    },
    onCloseFormView() {
      this.isShowModalView = false
    },

    // --------- APIs ---------//
    async fetchData() {
      if (!this.form) return
      this.data = {}
      const param = {
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        search: {
          bookNo: this.form.bookNo ?? null,
          no: this.form.no ?? null,
          text: this.form.text ?? null,
          runningNumber: this.form.runningNumber ?? null,
          createStart: this.form.createStart ? formatISOString(this.form.createStart) : null,
          createEnd: this.form.createEnd ? formatISOString(this.form.createEnd) : null
        }
      }
      const res = await api.jewelry.post('ProductionPlanCost/ListGoldCost', param)
      if (res) {
        this.data = { ...res }
      }
    },

    async fetchMasterGold() {
      const res = await api.jewelry.get('Master/MasterGold')
      if (res) {
        this.masterGold = [...res]
      }
    },

    async fetchMasterGoldSize() {
      const res = await api.jewelry.get('Master/MasterGoldSize')
      if (res) {
        this.masterGoldSize = [...res]
      }
    }
  },

  created() {
    this.form = { ...this.modelForm }
    this.$nextTick(() => {
      this.fetchMasterGold()
      this.fetchMasterGoldSize()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
