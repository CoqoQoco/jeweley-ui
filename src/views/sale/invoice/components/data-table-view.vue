<template>
  <div class="mt-2">
    <BaseDataTable
      :items="invoiceStore.dataList.data"
      :totalRecords="invoiceStore.dataList.total"
      dataKey="invoiceNumber"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 360px)'"
      :defaultSortMeta="[{ field: 'createDate', order: -1 }]"
      class="base-data-table"
      :rowClass="getRowClass"
      @page="handlePageChange"
      @sort="handleSortChange"
      @row-click="onRowClick"
    >
      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn-green" :title="$t('common.field.action')" @click="onView(data)">
            <i class="bi bi-eye"></i>
          </button>
        </div>
      </template>

      <template #statusTemplate="{ data }">
        <div class="status-container">
          <span :class="getStatusBadgeClass(data.status)">{{ data.statusName }}</span>
        </div>
      </template>

      <template #createDateTemplate="{ data }">
        <div>
          {{ formatDateTime(data.createDate) }}
        </div>
      </template>

      <template #deliveryDateTemplate="{ data }">
        <div>
          {{ formatDate(data.deliveryDate) }}
        </div>
      </template>

      <template #currencyUnitTemplate="{ data }">
        <div class="status-container">
          <span v-if="isForeignCurrencyUnit(data)" class="badge badge-currency-foreign">{{ getCurrencyUnit(data) }}</span>
          <span v-else>{{ getCurrencyUnit(data) }}</span>
        </div>
      </template>

      <template #grandTotalRoundedTemplate="{ data }">
        <div class="text-right">{{ formatMoney(data.grandTotalRounded) }}</div>
      </template>

      <template #paidAmountTemplate="{ data }">
        <div class="text-right">{{ formatMoney(data.paidAmount) }}</div>
      </template>

      <template #outstandingAmountTemplate="{ data }">
        <div class="text-right">{{ formatMoney(data.outstandingAmount) }}</div>
      </template>

      <template #paymentStatusTemplate="{ data }">
        <div class="status-container">
          <span
            v-if="getPaymentStatusValue(data)"
            :class="getPaymentStatusBadgeClass(data)"
          >
            {{ getPaymentStatusLabel(data) }}
          </span>
          <span v-else>-</span>
        </div>
      </template>

      <template #overdueDaysTemplate="{ data }">
        <div class="status-container">
          <span v-if="getOverdueDays(data) === null">-</span>
          <span v-else :class="getOverdueBadgeClass(data)">{{ getOverdueDays(data) }}</span>
        </div>
      </template>

      <template #ownerUsernameTemplate="{ data }">
        <div>{{ data.ownerUsername || '-' }}</div>
      </template>

      <template #saleChannelNameTemplate="{ data }">
        <div>{{ data.saleChannelName || '-' }}</div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
// External dependencies
import dayjs from 'dayjs'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import { formatNumber, isForeignCurrency } from '@/services/utils/decimal.js'
import { getPaymentStatus } from '@/services/utils/payment-status.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import activeRowHighlight from '@/composables/useActiveRowHighlight.js'

// Local components
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'InvoiceListDataTableView',

  components: {
    BaseDataTable
  },

  mixins: [dataTablePaging, activeRowHighlight],

  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  setup() {
    const invoiceStore = useInvoiceApiStore()
    return { invoiceStore }
  },

  data() {
    return {
      activeRowIdField: 'invoiceNumber',
      activeRowStorage: 'active-row-invoice-list-dk'
    }
  },

  computed: {
    form() {
      return this.modelForm || {}
    },

    columns() {
      return [
        {
          field: 'action',
          header: '',
          width: '50px',
          sortable: false
        },
        {
          field: 'invoiceNumber',
          header: this.$t('view.sale.invoice.invoiceNumber'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'customerCode',
          header: this.$t('view.sale.invoice.customerCode'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'customerName',
          header: this.$t('view.sale.invoice.customerName'),
          sortable: true,
          minWidth: '180px'
        },
        {
          field: 'status',
          header: this.$t('view.sale.invoice.status'),
          sortable: true,
          minWidth: '100px',
          template: 'statusTemplate'
        },
        {
          field: 'createDate',
          header: this.$t('view.sale.invoice.createDate'),
          sortable: true,
          minWidth: '140px',
          template: 'createDateTemplate'
        },
        {
          field: 'createBy',
          header: this.$t('view.sale.invoice.createBy'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'deliveryDate',
          header: this.$t('view.sale.invoice.deliveryDate'),
          sortable: true,
          minWidth: '140px',
          template: 'deliveryDateTemplate'
        },
        {
          field: 'remark',
          header: this.$t('view.sale.invoice.remark'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'currencyUnit',
          header: this.$t('view.sale.invoice.currencyUnitCol'),
          sortable: true,
          minWidth: '100px',
          template: 'currencyUnitTemplate'
        },
        {
          field: 'grandTotalRounded',
          header: this.$t('view.sale.invoice.grandTotalCol'),
          sortable: false,
          align: 'right',
          minWidth: '130px',
          template: 'grandTotalRoundedTemplate'
        },
        {
          field: 'paidAmount',
          header: this.$t('view.sale.invoice.paidAmountCol'),
          sortable: false,
          align: 'right',
          minWidth: '130px',
          template: 'paidAmountTemplate'
        },
        {
          field: 'outstandingAmount',
          header: this.$t('view.sale.invoice.outstandingAmountCol'),
          sortable: false,
          align: 'right',
          minWidth: '130px',
          template: 'outstandingAmountTemplate'
        },
        {
          field: 'paymentStatus',
          header: this.$t('view.sale.invoice.paymentStatusLabel'),
          sortable: false,
          minWidth: '120px',
          template: 'paymentStatusTemplate'
        },
        {
          field: 'overdueDays',
          header: this.$t('view.sale.invoice.overdueDaysLabel'),
          sortable: false,
          minWidth: '110px',
          template: 'overdueDaysTemplate'
        },
        {
          field: 'ownerUsername',
          header: this.$t('view.sale.invoice.ownerUsernameLabel'),
          sortable: false,
          minWidth: '130px',
          template: 'ownerUsernameTemplate'
        },
        {
          field: 'saleChannelName',
          header: this.$t('view.sale.invoice.saleChannelLabel'),
          sortable: false,
          minWidth: '130px',
          template: 'saleChannelNameTemplate'
        }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    }
  },

  methods: {
    onView(data) {
      this.setActiveRow(data)
      this.$router.push({
        path: '/invoice-detail',
        query: { invoiceNumber: data.invoiceNumber }
      })
    },

    getStatusBadgeClass(status) {
      const statusClasses = {
        1: 'badge badge-status-pending',
        2: 'badge badge-status-info',
        3: 'badge badge-status-success',
        4: 'badge badge-status-danger'
      }
      return statusClasses[status] || 'badge badge-status-default'
    },

    getCurrencyUnit(data) {
      return data.currencyUnit || 'THB'
    },

    isForeignCurrencyUnit(data) {
      return isForeignCurrency(this.getCurrencyUnit(data))
    },

    async fetchData() {
      await this.invoiceStore.fetchList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.form
      })
      this.scrollToActiveRow()
    },

    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },

    formatDate(date) {
      return date ? formatDate(date) : ''
    },

    formatMoney(value) {
      return formatNumber(value, 2)
    },

    // สถานะชำระ: คำนวณจากยอดเงินเท่านั้น (getPaymentStatus) ห้ามใช้ paymentName ตัดสิน
    getPaymentStatusValue(data) {
      return getPaymentStatus(data.grandTotalRounded, data.deposit, data.paidAmount)
    },

    getPaymentStatusLabel(data) {
      const status = this.getPaymentStatusValue(data)
      const labelMap = {
        paid: this.$t('view.sale.invoice.paymentStatusPaid'),
        partial: this.$t('view.sale.invoice.paymentStatusPartial'),
        unpaid: this.$t('view.sale.invoice.paymentStatusUnpaid')
      }
      return labelMap[status] || '-'
    },

    getPaymentStatusBadgeClass(data) {
      const status = this.getPaymentStatusValue(data)
      const classMap = {
        paid: 'badge badge-payment-paid',
        partial: 'badge badge-payment-partial',
        unpaid: 'badge badge-payment-unpaid'
      }
      return classMap[status] || 'badge badge-status-default'
    },

    // จำนวนวันที่เลยกำหนด: คำนวณที่หน้าจอจาก dueDate (fallback เป็น createDate สำหรับใบเก่า)
    // คืน null เมื่อยังไม่ถึงกำหนด — ห้ามเดาว่าเลยกำหนดถ้าไม่มีข้อมูลอ้างอิงวันที่เลย
    getOverdueDays(data) {
      const referenceDate = data.dueDate || data.createDate
      if (!referenceDate) return null

      const diffDays = dayjs().startOf('day').diff(dayjs(referenceDate).startOf('day'), 'day')
      return diffDays > 0 ? diffDays : null
    },

    getOverdueBadgeClass(data) {
      const days = this.getOverdueDays(data)
      if (days === null) return ''
      if (days <= 7) return 'badge badge-overdue-low'
      if (days <= 30) return 'badge badge-overdue-mid'
      return 'badge badge-overdue-high'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form';

.btn-action-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-container {
  text-align: center;
}

.badge {
  padding: var(--sp-xs) var(--sp-sm);
  font-size: var(--fs-sm);
  border-radius: var(--radius-sm);
}

.badge-status-success {
  background-color: var(--base-green);
  color: white;
}

.badge-status-pending {
  background-color: var(--base-warning);
  color: #212529;
}

.badge-status-info {
  background-color: #17a2b8;
  color: white;
}

.badge-status-danger {
  background-color: var(--base-red);
  color: white;
}

.badge-status-default {
  background-color: #6c757d;
  color: white;
}

.badge-currency-foreign {
  background-color: transparent;
  border: 1px solid var(--base-font-color);
  color: var(--base-font-color);
}

.badge-payment-paid {
  background-color: var(--base-green);
  color: white;
}

.badge-payment-partial {
  background-color: var(--base-warning);
  color: #212529;
}

.badge-payment-unpaid {
  background-color: var(--base-red);
  color: white;
}

.badge-overdue-low {
  background-color: var(--base-warning);
  color: #212529;
}

.badge-overdue-mid {
  background-color: transparent;
  border: 1px solid var(--base-red);
  color: var(--base-red);
}

.badge-overdue-high {
  background-color: var(--base-red);
  color: white;
}
</style>
