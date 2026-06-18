<template>
  <modal
    :showModal="visible"
    width="90%"
    :isShowActionPart="true"
    @closeModal="onClose"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">
        <i class="bi bi-list-ul mr-2"></i>{{ $t('view.sale.costStock.planList') }}
      </span>
    </template>

    <template #content>
      <div class="px-3 pb-3">
        <DataTableWithPaging
          :items="planList"
          :totalRecords="totalRecords"
          :perPage="perPage"
          :columns="columns"
          dataKey="running"
          :scrollHeight="'calc(100vh - 350px)'"
          @page="onPageChange"
          @sort="onSortChange"
          :selectionMode="true"
          selectionType="single"
          v-model:itemsSelection="selectedPlan"
        >
          <template #statusNameTemplate="{ data }">
            <span
              class="badge"
              :class="{
                'badge-warning': data.statusId === 1,
                'badge-success': data.statusId === 2,
                'badge-danger': data.statusId === 3
              }"
            >
              {{ data.statusName }}
            </span>
          </template>

          <template #createDateTemplate="{ data }">
            {{ formatDate(data.createDate) }}
          </template>

          <template #updateDateTemplate="{ data }">
            {{ data.updateDate ? formatDate(data.updateDate) : '-' }}
          </template>
        </DataTableWithPaging>
      </div>
    </template>

    <template #action>
      <button class="btn btn-sm btn-outline-main mr-2" @click="onClose">
        <i class="bi bi-x-circle mr-1"></i>
        {{ $t('common.btn.close') }}
      </button>
      <button
        class="btn btn-main btn-sm"
        @click="onSelectPlan"
        :disabled="selectedPlan.length === 0"
      >
        <i class="bi bi-check-circle mr-1"></i>
        {{ $t('view.sale.costStock.selectPlan') }}
      </button>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import DataTableWithPaging from '@/components/prime-vue/DataTableWithPaging.vue'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { formatDate } from '@/services/utils/dayjs.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'StockCostPlanModal',

  components: {
    modal,
    DataTableWithPaging
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    stockNumber: {
      type: String,
      default: null
    }
  },

  emits: ['update:visible', 'plan-selected'],

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore, formatDate }
  },

  data() {
    return {
      planList: [],
      totalRecords: 0,
      perPage: 10,
      skip: 0,
      sort: [],
      selectedPlan: [],

    }
  },

  computed: {
    columns() {
      return [
        {
          field: 'running',
          header: this.$t('view.sale.costStock.planNo'),
          sortable: true,
          width: '150px'
        },
        {
          field: 'stockNumber',
          header: this.$t('view.sale.costStock.stockNumber'),
          sortable: true,
          width: '150px'
        },
        {
          field: 'statusName',
          header: this.$t('common.field.status'),
          sortable: true,
          width: '120px'
        },
        {
          field: 'remark',
          header: this.$t('common.field.remark'),
          sortable: false,
          width: '200px'
        },
        {
          field: 'createBy',
          header: this.$t('view.sale.costStock.createBy'),
          sortable: true,
          width: '120px'
        },
        {
          field: 'createDate',
          header: this.$t('view.sale.costStock.createDate'),
          sortable: true,
          width: '150px'
        },
        {
          field: 'updateBy',
          header: this.$t('view.sale.costStock.updateBy'),
          sortable: true,
          width: '120px'
        },
        {
          field: 'updateDate',
          header: this.$t('view.sale.costStock.updateDate'),
          sortable: true,
          width: '150px'
        }
      ]
    }
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.fetchPlans()
      }
    }
  },

  methods: {
    async fetchPlans() {
      const response = await this.productStore.fetchListStockCostPlan({
        take: this.perPage,
        skip: this.skip,
        sort: this.sort,
        formValue: {
          stockNumber: this.stockNumber || undefined,
          isActive: true,
          statusId: 10
        }
      })

      if (response && response.data) {
        this.planList = response.data
        this.totalRecords = response.total
      }
    },

    onPageChange(event) {
      this.skip = event.first
      this.perPage = event.rows
      this.fetchPlans()
    },

    onSortChange(event) {
      this.skip = event.first
      this.perPage = event.rows
      this.sort = event.multiSortMeta || []
      this.fetchPlans()
    },

    onSelectPlan() {
      if (this.selectedPlan.length > 0) {
        this.$emit('plan-selected', this.selectedPlan[0])
        this.onClose()
      }
    },

    onClose() {
      this.selectedPlan = []
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;

  &.badge-warning {
    background-color: var(--base-warning);
    color: #000;
  }

  &.badge-success {
    background-color: var(--base-green);
    color: #fff;
  }

  &.badge-danger {
    background-color: var(--base-red);
    color: #fff;
  }
}
</style>
