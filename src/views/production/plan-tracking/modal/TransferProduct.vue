<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.production.planTracking.transferProductTitle') }}</span>
      </template>
      <template #content>
        <form @submit.prevent="onSubmit">
          <div class="filter-container-highlight">
            <div class="form-col-container">
              <div class="d-flex justify-content-between">
                <div class="vertical-center-container desc-text-white">
                  <span>
                    {{ `${$t('view.production.planTracking.transferProductTitle')}[${$t('view.production.planTracking.transferProductSuccess')}]: ${statusTransfer ? statusTransfer.nameTh : ''}` }}
                  </span>
                  <span class="ml-2 bi bi-arrow-right"></span>
                  <span class="ml-2">
                    {{ $t('view.production.planTracking.transferToWarehouse') }}
                  </span>
                </div>
                <div>
                  <span class="mr-5 desc-text-white">
                    {{ `${$t('view.production.planTracking.totalItems')} ${planSearchStore.dataPlanTransfer.total} ${$t('view.production.planTracking.transferLimitUnit')}` }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-2">
            <div class="form-col-container mt-1">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>

            <div class="mt-2">
              <BaseDataTable
                :items="planSearchStore.dataPlanTransfer.data"
                :totalRecords="planSearchStore.dataPlanTransfer.total"
                :columns="columns"
                dataKey="id"
                scrollHeight="350px"
                :selectionMode="true"
                :paginator="false"
                :itemsSelection="selectedValue"
                @update:itemsSelection="selectedValue = $event"
              >
                <!-- WO Template -->
                <template #woTemplate="{ data }">
                  {{ `${data.wo}-${data.woNumber}` }}
                </template>

                <!-- Last Update Status Template -->
                <template #lastUpdateStatusTemplate="{ data }">
                  <div class="notification">
                    <span>{{ formatDate(data.lastUpdateStatus) }}</span>
                  </div>
                </template>

                <!-- Request Date Template -->
                <template #requestDateTemplate="{ data }">
                  <div class="notification">
                    <span>{{ formatDate(data.requestDate) }}</span>
                    <span v-if="data.isOverPlan" class="overdue-tag">{{ $t('view.production.planTracking.overdue') }}</span>
                  </div>
                </template>

                <!-- Create Date Template -->
                <template #createDateTemplate="{ data }">
                  {{ formatDate(data.createDate) }}
                </template>
              </BaseDataTable>
            </div>

            <div class="filter-container mt-1">
              <div class="d-flex justify-content-between vertical-center-container">
                <div class="title-text">
                  <span>{{
                    `${$t('view.production.planTracking.selectedItems')} ${selectedValue.length} ${$t('view.production.planTracking.maxItems')} ${this.allowItem} ${$t('view.production.planTracking.maxItemsUnit')}`
                  }}</span>
                </div>
                <div class="d-flex justify-content-between vertical-center-container">
                  <div class="check-excel-container">
                    <CheckboxGeneric v-model="form.isExportReceipt" :binary="true" />
                    <span class="ml-2">{{ $t('view.production.planTracking.exportReceipt') }}</span>
                  </div>
                  <button
                    :class="[
                      'btn btn-sm ml-2',
                      selectedValue.length > 0 ? 'btn-main' : 'btn-outline-main'
                    ]"
                    :disabled="!selectedValue.length > 0"
                    type="submit"
                  >
                    <span><i class="bi bi-cart-check-fill"></i></span>
                    <span class="ml-2">{{ $t('view.production.planTracking.transferProduct') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

// External
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { usePlanSearchApiStore } from '@/stores/modules/api/plan-search-store.js'
import { usePlanUpdateApiStore } from '@/stores/modules/api/plan-update-store.js'
import { usrStockProductReceiptApiStore } from '@/stores/modules/api/stock/product-receipt-api.js'
import { warning, confirmSubmit } from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

// Local
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceForm = {
  formerStatus: null,
  targetStatus: 100,
  name: null,
  isExportReceipt: true,
  job: []
}

const interfaceVal = {
  isTargetStatus: false
}

export default {
  components: {
    modal,
    BaseDataTable,
    CheckboxGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    },
    modelValue: {
      type: Object,
      default: () => ({})
    },
    stausTransferValue: {
      type: Number,
      required: true,
      default: () => 0
    },
    masterStatusValue: {
      type: Array,
      required: true,
      default: () => []
    }
  },

  data() {
    return {
      selectedValue: [],
      form: {
        ...interfaceForm
      },
      val: { ...interfaceVal },
      allowItem: 100
    }
  },

  setup() {
    const planSearchStore = usePlanSearchApiStore()
    const planUpdateStore = usePlanUpdateApiStore()
    const stockProductReceiptStore = usrStockProductReceiptApiStore()
    return { planSearchStore, planUpdateStore, stockProductReceiptStore }
  },

  computed: {
    isShowModal() {
      return this.isShow
    },
    model() {
      return this.modelValue
    },
    masterStatus() {
      return this.masterStatusValue
    },
    statusTransfer() {
      return this.masterStatusValue.find((item) => item.id === this.stausTransferValue) || null
    },
    columns() {
      return [
        {
          field: 'wo',
          header: this.$t('view.production.planTracking.colWo'),
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'mold',
          header: this.$t('view.production.planTracking.colMold'),
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'lastUpdateStatus',
          header: this.$t('view.production.planTracking.colStatusDate'),
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'requestDate',
          header: this.$t('view.production.planTracking.colRequestDate'),
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'productNumber',
          header: this.$t('view.production.planTracking.colProductCode'),
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'productTypeName',
          header: this.$t('view.production.planTracking.colProductType'),
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'productQty',
          header: this.$t('view.production.planTracking.colProductQty'),
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'gold',
          header: this.$t('view.production.planTracking.colGoldColor'),
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'goldSize',
          header: this.$t('view.production.planTracking.colGoldType'),
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'customerNumber',
          header: this.$t('view.production.planTracking.colCustomerCode'),
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'customerName',
          header: this.$t('view.production.planTracking.colCustomerName'),
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'customerTypeName',
          header: this.$t('view.production.planTracking.colCustomerType'),
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'createDate',
          header: this.$t('view.production.planTracking.colCreateDate'),
          minWidth: '150px',
          format: 'date',
          sortable: false
        }
      ]
    },
    allowSelectStatus() {
      return this.masterStatus.filter((item) => item.id === 100)
    }
  },

  watch: {
    'form.targetStatus'() {
      if (this.form.targetStatus) {
        this.val.isTargetStatus = false
      }
    }
  },

  methods: {
    closeModal() {
      this.selectedValue = []
      this.form = { ...interfaceForm }
      this.$emit('closeModal')
    },

    onSubmit() {
      if (this.validateForm()) {
        confirmSubmit('', this.$t('view.production.planTracking.confirmTransferProduct'), async () => {
          await this.submit()
        })
      }
    },

    validateForm() {
      let isValid = true
      if (!this.form.targetStatus) {
        this.val.isTargetStatus = true
        isValid = false
      }

      let statusNotAllow = [49, 54, 55, 59, 69, 79, 84, 85, 94, 500]
      if (statusNotAllow.includes(this.form.targetStatus)) {
        warning(this.$t('view.production.planTracking.cannotTransfer'), '', () => {
          isValid = false
        })
      }
      return isValid
    },

    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },

    formatDate(date) {
      return formatDate(date)
    },

    getStatusName(statusId) {
      return this.masterStatus.find((item) => item.id === statusId)?.nameTh || ''
    },

    async submit() {
      const res = await this.planUpdateStore.submitTransfer({
        formerStatus: this.stausTransferValue,
        targetStatus: 100,
        transferBy: this.form.name,
        selectedItems: this.selectedValue
      })

      if (res && res.success) {
        if (res.receiptNumber && this.form.isExportReceipt) {
          const form = {
            recieptStart: null,
            recieptEnd: null,
            receiptNumber: res.receiptNumber
          }
          const sort = [
            {
              field: 'wo',
              dir: 'asc'
            },
            {
              field: 'woNumber',
              dir: 'asc'
            }
          ]
          await this.stockProductReceiptStore.fetchDataSearchExport({
            sort: sort,
            form: form,
            title: `${this.$t('view.production.planTracking.transferTitle')}_${res.receiptNumber}`
          })
        }

        this.selectedValue = []
        this.form = { ...interfaceForm }

        this.$emit('closeModal', 'fetch')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/responsive-style/web';

.card { background: #ffffff !important; }

.notification {
  display: inline-flex;
  align-items: center;
}

.overdue-tag {
  background-color: var(--base-red);
  color: white;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  margin-left: 4px;
  font-size: var(--fs-sm);
}

.text-custom {
  font-size: 20px;
}
.check-excel-container {
  display: flex;
  align-items: center;
}
</style>
