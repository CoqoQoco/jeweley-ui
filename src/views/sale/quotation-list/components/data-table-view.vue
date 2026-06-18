<template>
  <div class="mt-2">
    <!-- Merge Toolbar -->
    <div v-if="selectedQuotations.length >= 2" class="merge-toolbar">
      <span class="merge-info">
        <i class="bi bi-check2-square mr-1"></i>
        {{ $t('view.sale.quotationList.selectedItems', { count: selectedQuotations.length }) }}
      </span>
      <button class="btn btn-sm btn-main ml-2" @click="onMergeClick">
        <i class="bi bi-diagram-2 mr-1"></i>
        {{ $t('view.sale.quotationList.mergeCount', { count: selectedQuotations.length }) }}
      </button>
      <button class="btn btn-sm btn-outline-main ml-2" @click="selectedQuotations = []">
        {{ $t('common.btn.cancel') }}
      </button>
    </div>

    <BaseDataTable
      :items="quotationStore.dataList.data"
      :totalRecords="quotationStore.dataList.total"
      dataKey="number"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 380px)'"
      class="base-data-table"
      :selectionMode="true"
      selectionType="multiple"
      v-model:itemsSelection="selectedQuotations"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button
            class="btn btn-sm btn-green"
            :title="$t('common.btn.view')"
            @click="onView(data)"
          >
            <i class="bi bi-eye"></i>
          </button>
        </div>
      </template>

      <template #statusTemplate>
        <div class="status-container">
          <span class="badge badge-success">{{ $t('view.sale.quotationList.statusSuccess') }}</span>
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
    </BaseDataTable>

    <!-- Merge Modal -->
    <mergeModal
      v-if="showMergeModal"
      :isShow="showMergeModal"
      :quotations="mergeQuotationsData"
      @close="onMergeClose"
      @merge-done="onMergeDone"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { usrQuotationApiStore } from '@/stores/modules/api/sale/quotation-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

const mergeModal = defineAsyncComponent(() => import('./merge-quotation-modal.vue'))

export default {
  name: 'QuotationListDataTableView',

  components: {
    BaseDataTable,
    mergeModal
  },

  mixins: [dataTablePaging],

  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  setup() {
    const quotationStore = usrQuotationApiStore()
    return { quotationStore }
  },

  data() {
    return {
      selectedQuotations: [],
      showMergeModal: false,
      mergeQuotationsData: []
    }
  },

  computed: {
    form() {
      return this.modelForm || {}
    },
    columns() {
      return [
        { field: 'action', header: '', width: '50px', sortable: false },
        { field: 'number', header: this.$t('view.sale.quotationList.number'), sortable: true, minWidth: '150px' },
        { field: 'running', header: this.$t('view.sale.quotationList.running'), sortable: true, minWidth: '120px' },
        { field: 'customerName', header: this.$t('view.sale.quotationList.customerName'), sortable: true, minWidth: '180px' },
        { field: 'customerPhone', header: this.$t('common.field.phone'), sortable: true, minWidth: '120px' },
        { field: 'customerEmail', header: this.$t('common.field.email'), sortable: true, minWidth: '150px' },
        { field: 'currency', header: this.$t('view.sale.quotationList.currency'), sortable: true, minWidth: '80px' },
        { field: 'currencyRate', header: this.$t('view.sale.quotationList.currencyRate'), sortable: true, minWidth: '120px', template: 'currencyRateTemplate' },
        { field: 'markUp', header: this.$t('view.sale.quotationList.markup'), sortable: true, minWidth: '100px', template: 'markupTemplate' },
        { field: 'discount', header: this.$t('view.sale.quotationList.discount'), sortable: true, minWidth: '100px', template: 'discountTemplate' },
        { field: 'freight', header: this.$t('view.sale.quotationList.freight'), sortable: true, minWidth: '100px', template: 'freightTemplate' },
        { field: 'date', header: this.$t('view.sale.quotationList.quotationDate'), sortable: true, minWidth: '140px', template: 'dateTemplate' },
        { field: 'createDate', header: this.$t('view.sale.quotationList.createDate'), sortable: true, minWidth: '140px', template: 'createDateTemplate' },
        { field: 'createBy', header: this.$t('view.sale.quotationList.createBy'), sortable: true, minWidth: '120px' },
        { field: 'remark', header: this.$t('common.field.remark'), sortable: true, minWidth: '150px' }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    }
  },

  methods: {
    // Action handlers
    onEdit(data) {
      // Navigate to edit quotation
      this.$router.push({
        path: '/sale-quotation',
        query: { number: data.number }
      })
    },

    onView(data) {
      // Navigate to view quotation
      this.$router.push({
        path: '/sale-quotation',
        query: { number: data.number, mode: 'view' }
      })
    },

    // API Methods
    async fetchData() {
      await this.quotationStore.fetchList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.form
      })
    },

    // Merge quotation methods
    async onMergeClick() {
      const results = await Promise.all(
        this.selectedQuotations.map((q) =>
          this.quotationStore.fetchGet({ formValue: { number: q.number } })
        )
      )
      this.mergeQuotationsData = results.filter((r) => r)
      this.showMergeModal = true
    },

    onMergeClose() {
      this.showMergeModal = false
      this.mergeQuotationsData = []
    },

    onMergeDone(newNumber) {
      this.showMergeModal = false
      this.selectedQuotations = []
      this.mergeQuotationsData = []
      this.$router.push({ path: '/sale-quotation', query: { number: newNumber } })
    },

    // Format helpers
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },

    formatDate(date) {
      return date ? formatDate(date) : ''
    }
  },

  async mounted() {
    await this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form';

.merge-toolbar {
  display: flex;
  align-items: center;
  padding: var(--sp-sm) var(--sp-md);
  margin-bottom: var(--sp-sm);
  background: var(--color-highlight-bg);
  border: 1px solid var(--base-font-color);
  border-radius: var(--radius-sm);

  .merge-info {
    font-size: var(--fs-sm);
    font-weight: 500;
    color: var(--base-font-color);
  }
}

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
  font-size: var(--fs-sm);
  border-radius: var(--radius-sm);
}

.badge-success {
  background-color: var(--base-green);
  color: white;
}
</style>