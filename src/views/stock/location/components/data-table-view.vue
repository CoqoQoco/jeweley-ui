<template>
  <div class="mt-2">
    <BaseDataTable
      :items="locationStore.dataSearch.data"
      :totalRecords="locationStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      dataKey="code"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn-green" title="แก้ไข" @click="onEdit(data)">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-red ml-2" title="ลบ" @click="onDelete(data)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </template>

      <template #typeTemplate="{ data }">
        <span>{{ getTypeLabel(data.type) }}</span>
      </template>

      <template #isSalesPointTemplate="{ data }">
        <span :class="data.isSalesPoint ? 'badge-yes' : 'badge-no'">
          {{ data.isSalesPoint ? $t('view.stock.location.yes') : $t('view.stock.location.no') }}
        </span>
      </template>

      <template #isTemporaryTemplate="{ data }">
        <span :class="data.isTemporary ? 'badge-temp' : 'badge-no'">
          {{ data.isTemporary ? $t('view.stock.location.yes') : $t('view.stock.location.no') }}
        </span>
      </template>

      <template #isActiveTemplate="{ data }">
        <span :class="data.isActive ? 'badge-active' : 'badge-inactive'">
          {{ data.isActive ? $t('view.stock.location.active') : $t('view.stock.location.inactive') }}
        </span>
      </template>
    </BaseDataTable>

    <upsertView
      :isShow="isShowUpsert"
      :modelData="dataEdit"
      @closeModal="onCloseModal"
      @fetch="fetchDataByUpsert"
    />
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import upsertView from '../modal/upsert-view.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'LocationDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable,
    upsertView
  },

  setup() {
    const locationStore = useStockLocationApiStore()
    return { locationStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    triggerCreate: {
      type: Boolean,
      default: false
    }
  },

  emits: ['createHandled'],

  computed: {
    typeOptions() {
      return [
        { value: 'WAREHOUSE', label: this.$t('view.stock.location.warehouse') },
        { value: 'SHOWROOM', label: this.$t('view.stock.location.showroom') },
        { value: 'BRANCH', label: this.$t('view.stock.location.branch') },
        { value: 'TEMP', label: this.$t('view.stock.location.temp') }
      ]
    },
    columns() {
      return [
        { field: 'action', header: '', sortable: false, width: '100px' },
        { field: 'code', header: this.$t('view.stock.location.code'), sortable: true, minWidth: '100px' },
        { field: 'nameTh', header: this.$t('view.stock.location.name'), sortable: true, minWidth: '160px' },
        { field: 'type', header: this.$t('view.stock.location.locType'), sortable: false, minWidth: '100px' },
        { field: 'isSalesPoint', header: this.$t('view.stock.location.isSalesPoint'), sortable: false, minWidth: '80px', align: 'center' },
        { field: 'isTemporary', header: this.$t('view.stock.location.isTemporary'), sortable: false, minWidth: '90px', align: 'center' },
        { field: 'isActive', header: this.$t('view.stock.location.isActive'), sortable: false, minWidth: '90px', align: 'center' }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    },
    triggerCreate(val) {
      if (val) {
        this.dataEdit = null
        this.isShowUpsert = true
        this.$emit('createHandled')
      }
    }
  },

  data() {
    return {
      isShowUpsert: false,
      dataEdit: null
    }
  },

  methods: {
    getTypeLabel(type) {
      const found = this.typeOptions.find((o) => o.value === type)
      return found ? found.label : type
    },

    onEdit(data) {
      this.dataEdit = { ...data }
      this.isShowUpsert = true
    },

    onDelete(data) {
      confirmThenSubmit(
        this.$t('view.stock.location.deleteConfirm', { name: data.nameTh, code: data.code }),
        this.$t('view.stock.location.confirmDelete'),
        async () => {
          await this.locationStore.remove(data.code)
          success(this.$t('view.stock.location.deleteSuccess'))
          await this.fetchData()
        }
      )
    },

    onCloseModal() {
      this.isShowUpsert = false
      this.dataEdit = null
    },

    async fetchDataByUpsert() {
      await this.fetchData()
      this.onCloseModal()
    },

    async fetchData() {
      await this.locationStore.fetchDataSearch({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.modelForm
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.btn-action-container {
  display: flex;
  align-items: center;
}

%badge-base {
  padding: 2px var(--sp-sm);
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
}

.badge-yes {
  @extend %badge-base;
  background: #d4edda;
  color: #155724;
}

.badge-no {
  @extend %badge-base;
  background: #f8f9fa;
  color: #6c757d;
}

.badge-temp {
  @extend %badge-base;
  background: #fff3cd;
  color: #856404;
}

.badge-active {
  @extend %badge-base;
  background: #d4edda;
  color: #155724;
}

.badge-inactive {
  @extend %badge-base;
  background: #f8d7da;
  color: #721c24;
}
</style>
