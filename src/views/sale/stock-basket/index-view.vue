<template>
  <div class="app-container">
    <!-- Search Form -->
    <div class="card-container">
      <div class="card-header">
        <h6 class="mb-0">{{ $t('view.sale.stockBasket.title') }}</h6>
      </div>
      <div class="card-body">
        <div class="form-col-container">
          <div>
            <span class="title-text">{{ $t('view.sale.stockBasket.basketNumber') }}</span>
            <InputTextGeneric
              v-model="form.basketNumber"
              :trim="true"
              :placeholder="$t('view.sale.stockBasket.basketNumber')"
            />
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.stockBasket.basketName') }}</span>
            <InputTextGeneric
              v-model="form.basketName"
              :trim="true"
              :placeholder="$t('view.sale.stockBasket.basketName')"
            />
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.stockBasket.status') }}</span>
            <DropdownGeneric
              :modelValue="form.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('view.sale.stockBasket.statusAll')"
              :showClear="true"
              @update:modelValue="form.status = $event"
            />
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.stockBasket.responsible') }}</span>
            <InputTextGeneric
              v-model="form.responsible"
              :trim="true"
              :placeholder="$t('view.sale.stockBasket.responsible')"
            />
          </div>
        </div>

        <div class="d-flex mt-3">
          <ButtonGeneric variant="green" icon="bi-search" :label="$t('common.btn.search')" @click="onSearch" />
          <ButtonGeneric variant="dark" icon="bi-x-circle" :label="$t('common.btn.clear')" class="ml-2" @click="onClear" />
          <ButtonGeneric variant="main" icon="bi-plus-circle" :label="$t('view.sale.stockBasket.createBasket')" class="ml-auto" @click="onCreate" />
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card-container mt-3">
      <div class="card-body">
        <BaseDataTable
          :items="dataList.data"
          :totalRecords="dataList.total"
          :columns="columns"
          :perPage="take"
          :paginator="true"
          @page="handlePageChange"
          @sort="handleSortChange"
        >
          <template #statusNameTemplate="{ data }">
            <span :class="getStatusBadgeClass(data.status)">
              {{ data.statusName }}
            </span>
          </template>

          <template #actionTemplate="{ data }">
            <button
              class="btn btn-sm btn-green"
              @click="onView(data)"
              :title="$t('common.btn.view')"
            >
              <i class="bi bi-eye"></i>
            </button>
          </template>
        </BaseDataTable>
      </div>
    </div>
  </div>
</template>

<script>
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { useStockBasketApiStore } from '@/stores/modules/api/sale/stock-basket-store.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const interfaceForm = {
  basketNumber: null,
  basketName: null,
  status: null,
  responsible: null
}

export default {
  name: 'StockBasketIndexView',

  components: {
    BaseDataTable,
    InputTextGeneric,
    DropdownGeneric,
    ButtonGeneric
  },

  mixins: [dataTablePaging],

  data() {
    return {
      form: { ...interfaceForm },
      dataList: { data: [], total: 0 }
    }
  },

  setup() {
    const store = useStockBasketApiStore()
    return { store }
  },

  computed: {
    statusOptions() {
      return [
        { value: 1, label: this.$t('view.sale.stockBasket.statusPending') },
        { value: 2, label: this.$t('view.sale.stockBasket.statusApproved') },
        { value: 4, label: this.$t('view.sale.stockBasket.statusClosed') }
      ]
    },

    columns() {
      return [
        { field: 'basketNumber', header: this.$t('view.sale.stockBasket.basketNumber'), minWidth: '140px', sortable: true },
        { field: 'basketName', header: this.$t('view.sale.stockBasket.basketName'), minWidth: '160px', sortable: true },
        { field: 'eventDate', header: this.$t('view.sale.stockBasket.eventDate'), minWidth: '110px', format: 'date', sortable: true },
        { field: 'responsible', header: this.$t('view.sale.stockBasket.responsible'), minWidth: '130px', sortable: true },
        { field: 'totalItems', header: this.$t('view.sale.stockBasket.totalItems'), minWidth: '110px', align: 'right', sortable: true },
        { field: 'statusName', header: this.$t('view.sale.stockBasket.status'), minWidth: '120px', sortable: false },
        { field: 'createDate', header: this.$t('view.sale.stockBasket.createDate'), minWidth: '110px', format: 'date', sortable: true },
        { field: 'action', header: '', minWidth: '80px', sortable: false }
      ]
    }
  },

  async created() {
    await this.fetchData()
  },

  methods: {
    async fetchData() {
      this.dataList = await this.store.fetchList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.form
      })
    },

    async onSearch() {
      this.resetPaging()
    },

    onClear() {
      this.form = { ...interfaceForm }
      this.resetPaging()
    },

    onCreate() {
      this.$router.push('/sale/stock-basket/new')
    },

    onView(data) {
      this.$router.push('/sale/stock-basket/' + data.running)
    },

    getStatusBadgeClass(status) {
      const map = {
        0: 'badge badge-secondary',
        1: 'badge badge-warning',
        2: 'badge badge-info',
        3: 'badge badge-success',
        4: 'badge badge-dark'
      }
      return map[status] || 'badge badge-secondary'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
</style>
