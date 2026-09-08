<template>
  <modal :showModal="isShowModal" @closeModal="onCancel" width="1000px">
    <template v-slot:content>
      <div>
        <div class="title-text-lg mb-3">
          <span><i class="bi bi-clock-history mr-2"></i></span>
          <span>{{ $t('view.sale.costStock.selectFromAppraisal') }}</span>
        </div>

        <!-- Search Form -->
        <div class="mb-3">
          <form @submit.prevent="onSearch">
            <div class="form-col-sm-container">
              <div>
                <span class="title-text">{{ $t('view.sale.costStock.stockNumber') }}</span>
                <InputTextGeneric
                  v-model="searchForm.stockNumber"
                  :trim="true"
                  :placeholder="$t('view.sale.costStock.placeholder.stockNumber')"
                  :bgInput="true"
                />
              </div>
              <div>
                <span class="title-text">{{ $t('view.sale.costStock.appraisalNo') }}</span>
                <InputTextGeneric
                  v-model="searchForm.running"
                  :trim="true"
                  :placeholder="$t('view.sale.costStock.placeholder.appraisalNo')"
                  :bgInput="true"
                />
              </div>
              <div>
                <span class="title-text">{{ $t('view.sale.costStock.createBy') }}</span>
                <InputTextGeneric
                  v-model="searchForm.createBy"
                  :trim="true"
                  :placeholder="$t('view.sale.costStock.placeholder.createBy')"
                  :bgInput="true"
                />
              </div>
              <div class="d-flex align-items-end gap-1">
                <button class="btn btn-sm btn-green" type="submit">
                  <i class="bi bi-search mr-1"></i>{{ $t('common.btn.search') }}
                </button>
                <button class="btn btn-sm btn-dark ml-2" type="button" @click="onClearSearch">
                  <i class="bi bi-x-circle mr-1"></i>{{ $t('common.btn.clear') }}
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Pull Group Selector -->
        <div class="pull-groups-container mb-3">
          <span class="title-text d-block mb-2">{{ $t('view.sale.costStock.pullSections') }}</span>
          <div class="pull-groups-row">
            <CheckboxGeneric
              v-for="opt in pullGroupOptions"
              :key="opt.code"
              v-model="pullGroups"
              :value="opt.code"
              :binary="false"
              :label="opt.name"
            />
          </div>
          <div class="responsive-text-note mb-0 mt-2">{{ $t('view.sale.costStock.pullSectionsHint') }}</div>
        </div>

        <!-- Cost Version Table -->
        <div class="cost-version-table-container" style="max-height: 500px; overflow-y: auto">
          <BaseDataTable
            :items="data.data"
            :totalRecords="data.total"
            :columns="columns"
            :perPage="take"
            :scrollHeight="'400px'"
            @page="handlePageChange"
            @sort="handleSortChange"
          >
            <template #actionTemplate="{ data }">
              <div class="text-center">
                <button
                  class="btn btn-sm btn-green"
                  :disabled="pullGroups.length === 0"
                  @click="onSelectItem(data)"
                  :title="$t('common.btn.select')"
                >
                  <i class="bi bi-check-circle"></i>
                  <span class="ml-1">{{ $t('common.btn.select') }}</span>
                </button>
              </div>
            </template>

            <template #stockNumberTemplate="{ data }">
              <span class="stock-link">{{ data.stockNumber }}</span>
            </template>

            <template #createDateTemplate="{ data }">
              {{ formatDateTime(data.createDate) }}
            </template>

            <template #totalPriceTemplate="{ data }">
              <div class="text-right">
                {{ formatCurrency(getTotalPrice(data)) }}
              </div>
            </template>

            <template #currencyUnitTemplate="{ data }">
              {{ data.currencyUnit || '' }}
            </template>
          </BaseDataTable>
        </div>

        <div class="d-flex justify-content-end mt-4">
          <button class="btn btn-sm btn-dark" @click="onCancel">
            <span><i class="bi bi-x-circle"></i></span>
            <span class="ml-2">{{ $t('common.btn.cancel') }}</span>
          </button>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { formatDecimal } from '@/services/utils/decimal.js'
import dayjs from 'dayjs'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'CostVersionPickerModal',

  components: {
    modal,
    BaseDataTable,
    InputTextGeneric,
    CheckboxGeneric
  },

  props: {
    showModal: { type: Boolean, default: false }
  },

  // itemSelected: (version, pullGroups) — pullGroups = array ของ group code ที่ติ๊กไว้ตอนกด "เลือก"
  emits: ['closeModal', 'itemSelected'],

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  data() {
    return {
      isShowModal: this.showModal,
      searchForm: {
        stockNumber: '',
        running: '',
        createBy: ''
      },
      data: { data: [], total: 0 },
      take: 20,
      skip: 0,
      sort: [{ field: 'createDate', dir: 'desc' }],
      pullGroups: ['Gold', 'Gem']
    }
  },

  computed: {
    pullGroupOptions() {
      return [
        { code: 'Gold', name: this.$t('view.sale.costStock.group.gold') },
        { code: 'Gem', name: this.$t('view.sale.costStock.group.material') },
        { code: 'Worker', name: this.$t('view.sale.costStock.group.worker') },
        { code: 'Embed', name: this.$t('view.sale.costStock.group.embed') },
        { code: 'ETC', name: this.$t('view.sale.costStock.group.etc') }
      ]
    },

    columns() {
      return [
        {
          field: 'action',
          header: '',
          width: '80px',
          sortable: false
        },
        {
          field: 'stockNumber',
          header: this.$t('view.sale.costStock.stockNumber'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'running',
          header: this.$t('view.sale.costStock.appraisalNo'),
          sortable: true,
          width: '140px'
        },
        {
          field: 'createDate',
          header: this.$t('view.sale.costStock.date'),
          sortable: true,
          width: '140px'
        },
        {
          field: 'createBy',
          header: this.$t('view.sale.costStock.createBy'),
          sortable: true,
          width: '120px'
        },
        {
          field: 'totalPrice',
          header: this.$t('view.sale.costStock.totalPrice'),
          sortable: false,
          width: '120px'
        },
        {
          field: 'currencyUnit',
          header: this.$t('view.sale.costStock.currencyUnit'),
          sortable: false,
          width: '80px'
        }
      ]
    }
  },

  watch: {
    showModal(val) {
      this.isShowModal = val
      if (val) {
        this.resetForm()
        this.fetchData()
      }
    },
    isShowModal(val) {
      if (!val) this.$emit('closeModal')
    }
  },

  methods: {
    async onSearch() {
      this.skip = 0
      await this.fetchData()
    },

    onClearSearch() {
      this.searchForm = { stockNumber: '', running: '', createBy: '' }
      this.skip = 0
      this.fetchData()
    },

    onSelectItem(version) {
      this.$emit('itemSelected', version, [...this.pullGroups])
      this.isShowModal = false
    },

    onCancel() {
      this.isShowModal = false
    },

    resetForm() {
      this.searchForm = { stockNumber: '', running: '', createBy: '' }
      this.skip = 0
      this.sort = [{ field: 'createDate', dir: 'desc' }]
      this.pullGroups = ['Gold', 'Gem']
    },

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

    async fetchData() {
      const res = await this.productStore.fetchListCostVersion({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.searchForm
      })
      if (res) {
        this.data = { ...res }
      }
    },

    getTotalPrice(item) {
      if (!item.prictransection || !Array.isArray(item.prictransection)) return 0
      return item.prictransection.reduce((sum, t) => sum + (t.totalPrice || 0), 0)
    },

    formatDateTime(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    formatCurrency(value) {
      if (value === null || value === undefined || value === '') return '-'
      return formatDecimal(Number(value), 2)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.title-text-lg {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--base-font-color);
  display: flex;
  align-items: center;
}

.pull-groups-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--sp-md) var(--sp-lg);
  background-color: var(--color-highlight-bg);
}

.pull-groups-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-md);
}

.cost-version-table-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-card-bg);
}

.stock-link {
  color: var(--base-font-color);
  font-weight: 600;
  cursor: default;
}

.gap-1 {
  gap: 4px;
}
</style>
