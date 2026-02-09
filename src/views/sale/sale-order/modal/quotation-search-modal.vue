<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'90%'" :fitHeight="true">
      <template v-slot:content>
        <div class="title-text-lg-header mb-2">
          <span>เลือกใบเสนอราคา</span>
        </div>
        
        <!-- Search Form -->
        <div class="filter-container-searchBar">
          <form @submit.prevent="searchQuotations">
            <div class="form-col-container">
              <div>
                <span class="title-text">เลขที่ใบเสนอราคา</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="searchForm.number"
                  placeholder="EX: QUO-2025-001"
                />
              </div>
            </div>

            <dialogView
              :isShow="showDialogs.dialog"
              @closeDialog="closeDialog"
              @search="dialogSearch"
              txtHeader="ค้นหาเพิ่มเติม"
            >
              <template #content>
                <div class="form-col-container">
                  <div>
                    <span class="title-text">ชื่อลูกค้า</span>
                    <input
                      :class="['form-control bg-input']"
                      type="text"
                      v-model.trim="searchForm.customerName"
                      placeholder="ชื่อลูกค้า"
                    />
                  </div>

                  <div>
                    <span class="title-text">สกุลเงิน</span>
                    <input
                      :class="['form-control bg-input']"
                      type="text"
                      v-model.trim="searchForm.currency"
                      placeholder="EX: USD, THB"
                    />
                  </div>

                  <div>
                    <span class="title-text">ผู้สร้าง</span>
                    <input
                      :class="['form-control bg-input']"
                      type="text"
                      v-model.trim="searchForm.createBy"
                      placeholder="ชื่อผู้สร้าง"
                    />
                  </div>
                </div>

                <div class="form-col-container mt-2">
                  <div>
                    <span class="title-text">วันที่สร้าง</span>
                    <div class="flex-group">
                      <Calendar
                        class="w-100"
                        v-model="searchForm.createDateStart"
                        :max-date="searchForm.createDateEnd"
                        showIcon
                        :manualInput="false"
                        placeholder="เริ่มต้น"
                        dateFormat="dd/mm/yy"
                      />
                      <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                      <Calendar
                        class="w-100"
                        v-model="searchForm.createDateEnd"
                        :min-date="searchForm.createDateStart"
                        showIcon
                        :manualInput="false"
                        placeholder="สิ้นสุด"
                        dateFormat="dd/mm/yy"
                      />
                    </div>
                  </div>

                  <div>
                    <span class="title-text">วันที่ใบเสนอราคา</span>
                    <div class="flex-group">
                      <Calendar
                        class="w-100"
                        v-model="searchForm.quotationDateStart"
                        :max-date="searchForm.quotationDateEnd"
                        showIcon
                        :manualInput="false"
                        placeholder="เริ่มต้น"
                        dateFormat="dd/mm/yy"
                      />
                      <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                      <Calendar
                        class="w-100"
                        v-model="searchForm.quotationDateEnd"
                        :min-date="searchForm.quotationDateStart"
                        showIcon
                        :manualInput="false"
                        placeholder="สิ้นสุด"
                        dateFormat="dd/mm/yy"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </dialogView>

            <div class="btn-submit-container">
              <button class="btn btn-sm btn-main mr-2" type="submit" title="ค้นหา" :disabled="loading">
                <span><i class="bi bi-search"></i></span>
              </button>
              <button
                class="btn btn-sm btn-sub-main mr-2"
                type="button"
                title="เพิ่มเติม"
                @click="onShowDialog"
              >
                <span><i class="bi bi-zoom-in"></i></span>
              </button>
              <button class="btn btn-sm btn-dark mr-2" type="button" @click="clearSearch" title="ล้าง">
                <span><i class="bi bi-x-circle"></i></span>
              </button>
            </div>
          </form>
        </div>

        <!-- Results Table -->
        <div class="mt-2">
          <BaseDataTable
            :items="quotations"
            :totalRecords="totalRecords"
            dataKey="number"
            :columns="columns"
            :perPage="take"
            :scrollHeight="'calc(100vh - 450px)'"
            class="base-data-table"
            @page="handlePageChange"
            @sort="handleSortChange"
          >
            <template #actionTemplate="{ data }">
              <div class="btn-action-container">
                <button
                  class="btn btn-sm btn-success"
                  @click="selectQuotation(data)"
                  title="เลือกใบเสนอราคานี้"
                >
                  <i class="bi bi-check-circle mr-1"></i>
                  เลือก
                </button>
              </div>
            </template>

            <template #statusTemplate="{ data }">
              <div class="status-container">
                <span :class="getStatusClass(data.status)">
                  {{ getStatusText(data.status) }}
                </span>
              </div>
            </template>

            <template #dateTemplate="{ data }">
              <div>
                {{ formatDate(data.date) }}
              </div>
            </template>

            <template #createDateTemplate="{ data }">
              <div>
                {{ formatDateTime(data.createDate) }}
              </div>
            </template>

            <template #currencyRateTemplate="{ data }">
              <div class="text-right">
                {{ Number(data.currencyRate || 0).toFixed(2) }}
              </div>
            </template>

            <template #markupTemplate="{ data }">
              <div class="text-right">
                {{ Number(data.markUp || 0).toFixed(2) }}%
              </div>
            </template>

            <template #discountTemplate="{ data }">
              <div class="text-right">
                {{ Number(data.discount || 0).toFixed(2) }}%
              </div>
            </template>

            <template #freightTemplate="{ data }">
              <div class="text-right">
                {{ data.freight ? Number(data.freight).toFixed(2) : '-' }}
              </div>
            </template>

            <template #customerTemplate="{ data }">
              <div>
                <strong>{{ data.customerName }}</strong>
                <br>
                <small class="text-muted">{{ data.customerPhone }}</small>
              </div>
            </template>
          </BaseDataTable>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import Calendar from 'primevue/calendar'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { usrQuotationApiStore } from '@/stores/modules/api/sale/quotation-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import { formatDecimal } from '@/services/utils/decimal.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

export default {
  name: 'QuotationSearchModal',

  components: {
    modal,
    Calendar,
    dialogView,
    BaseDataTable
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  emits: ['closeModal', 'select'],

  setup() {
    const quotationStore = usrQuotationApiStore()
    return { quotationStore }
  },

  computed: {
    isShowModal() {
      return this.isShow
    }
  },

  watch: {
    isShow(newVal) {
      if (newVal) {
        this.loadQuotations()
      }
    }
  },

  data() {
    return {
      loading: false,
      quotations: [],
      totalRecords: 0,
      take: 10,
      skip: 0,
      sort: [],
      searchForm: {
        number: '',
        customerName: '',
        currency: '',
        createBy: '',
        createDateStart: null,
        createDateEnd: null,
        quotationDateStart: null,
        quotationDateEnd: null
      },
      showDialogs: {
        dialog: false
      },
      columns: [
        {
          field: 'action',
          header: 'การดำเนินการ',
          width: '120px',
          sortable: false
        },
        {
          field: 'number',
          header: 'เลขที่ใบเสนอราคา',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'running',
          header: 'เลขที่รัน',
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'customerName',
          header: 'ชื่อลูกค้า',
          sortable: true,
          minWidth: '200px',
          template: 'customerTemplate'
        },
        {
          field: 'currency',
          header: 'สกุลเงิน',
          sortable: true,
          minWidth: '80px'
        },
        {
          field: 'currencyRate',
          header: 'อัตราแลกเปลี่ยน',
          sortable: true,
          minWidth: '120px',
          template: 'currencyRateTemplate'
        },
        {
          field: 'markUp',
          header: 'Markup (%)',
          sortable: true,
          minWidth: '100px',
          template: 'markupTemplate'
        },
        {
          field: 'discount',
          header: 'ส่วนลด (%)',
          sortable: true,
          minWidth: '100px',
          template: 'discountTemplate'
        },
        {
          field: 'freight',
          header: 'ค่าขนส่ง',
          sortable: true,
          minWidth: '100px',
          template: 'freightTemplate'
        },
        {
          field: 'date',
          header: 'วันที่ใบเสนอราคา',
          sortable: true,
          minWidth: '140px',
          template: 'dateTemplate'
        },
        {
          field: 'createDate',
          header: 'วันที่สร้าง',
          sortable: true,
          minWidth: '140px',
          template: 'createDateTemplate'
        },
        {
          field: 'createBy',
          header: 'ผู้สร้าง',
          sortable: true,
          minWidth: '120px'
        }
      ]
    }
  },

  methods: {
    async loadQuotations() {
      try {
        this.loading = true
        
        await this.quotationStore.fetchList({
          take: this.take,
          skip: this.skip,
          sort: this.sort,
          formValue: this.searchForm
        })

        console.log(this.quotationStore.dataList)
        
        this.quotations = this.quotationStore.dataList.data
        this.totalRecords = this.quotationStore.dataList.total
      } catch (error) {
        console.error('Error loading quotations:', error)
        this.quotations = []
        this.totalRecords = 0
      } finally {
        this.loading = false
      }
    },

    async searchQuotations() {
      this.take = 10
      this.skip = 0
      await this.loadQuotations()
    },

    dialogSearch() {
      this.showDialogs.dialog = false
      this.searchQuotations()
    },

    clearSearch() {
      this.searchForm = {
        number: '',
        customerName: '',
        currency: '',
        createBy: '',
        createDateStart: null,
        createDateEnd: null,
        quotationDateStart: null,
        quotationDateEnd: null
      }
      this.loadQuotations()
    },

    onShowDialog() {
      this.showDialogs.dialog = true
    },

    closeDialog() {
      this.showDialogs.dialog = false
    },

    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.loadQuotations()
    },

    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => ({
        field: item.field,
        dir: item.order === 1 ? 'asc' : 'desc'
      }))
      this.loadQuotations()
    },

    selectQuotation(quotation) {
      this.$emit('select', quotation)
      this.closeModal()
    },

    closeModal() {
      this.$emit('closeModal')
    },

    formatDate(date) {
      return formatDate(date)
    },

    formatDateTime(date) {
      return formatDateTime(date)
    },

    formatCurrency(amount) {
      return formatDecimal(amount, 2)
    },

    getStatusClass(status) {
      const statusClasses = {
        'draft': 'badge badge-secondary',
        'pending': 'badge badge-warning',
        'confirmed': 'badge badge-success',
        'rejected': 'badge badge-danger',
        'expired': 'badge badge-dark'
      }
      return statusClasses[status] || 'badge badge-secondary'
    },

    getStatusText(status) {
      const statusText = {
        'draft': 'ร่าง',
        'pending': 'รอการยืนยัน',
        'confirmed': 'ยืนยันแล้ว',
        'rejected': 'ปฏิเสธ',
        'expired': 'หมดอายุ'
      }
      return statusText[status] || 'ไม่ทราบสถานะ'
    }
  },

  async mounted() {
    if (this.isShow) {
      await this.loadQuotations()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/custom-style/standard-data-table.scss';

.btn-action-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-container {
  text-align: center;
}

.badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  
  &.badge-secondary {
    background-color: #6c757d;
    color: white;
  }
  
  &.badge-warning {
    background-color: #ffc107;
    color: #212529;
  }
  
  &.badge-success {
    background-color: #28a745;
    color: white;
  }
  
  &.badge-danger {
    background-color: #dc3545;
    color: white;
  }
  
  &.badge-dark {
    background-color: #343a40;
    color: white;
  }
}

.font-weight-bold {
  font-weight: 600;
}

.text-right {
  text-align: right;
}

.text-muted {
  color: #6c757d !important;
}

.text-center {
  text-align: center;
}
</style>