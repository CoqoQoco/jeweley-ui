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
          {{ data.isSalesPoint ? 'ใช่' : 'ไม่' }}
        </span>
      </template>

      <template #isTemporaryTemplate="{ data }">
        <span :class="data.isTemporary ? 'badge-temp' : 'badge-no'">
          {{ data.isTemporary ? 'ใช่' : 'ไม่' }}
        </span>
      </template>

      <template #isActiveTemplate="{ data }">
        <span :class="data.isActive ? 'badge-active' : 'badge-inactive'">
          {{ data.isActive ? 'ใช้งาน' : 'ปิด' }}
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

import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'
import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'

const TYPE_OPTIONS = [
  { value: 'WAREHOUSE', label: 'คลัง' },
  { value: 'SHOWROOM', label: 'โชว์รูม' },
  { value: 'BRANCH', label: 'สาขา' },
  { value: 'TEMP', label: 'ชั่วคราว' }
]

export default {
  name: 'LocationDataTableView',

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

  watch: {
    async modelForm() {
      this.take = 10
      this.skip = 0
      await this.fetchData()
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
      take: 10,
      skip: 0,
      sort: [],
      columns: [
        { field: 'action', header: '', sortable: false, width: '100px' },
        { field: 'code', header: 'รหัส', sortable: true, minWidth: '100px' },
        { field: 'nameTh', header: 'ชื่อ', sortable: true, minWidth: '160px' },
        { field: 'type', header: 'ประเภท', sortable: false, minWidth: '100px' },
        { field: 'isSalesPoint', header: 'จุดขาย', sortable: false, minWidth: '80px', align: 'center' },
        { field: 'isTemporary', header: 'ชั่วคราว', sortable: false, minWidth: '90px', align: 'center' },
        { field: 'isActive', header: 'สถานะ', sortable: false, minWidth: '90px', align: 'center' }
      ],
      isShowUpsert: false,
      dataEdit: null
    }
  },

  methods: {
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

    getTypeLabel(type) {
      const found = TYPE_OPTIONS.find((o) => o.value === type)
      return found ? found.label : type
    },

    onEdit(data) {
      this.dataEdit = { ...data }
      this.isShowUpsert = true
    },

    onDelete(data) {
      confirmSubmit(
        `ต้องการลบ "${data.nameTh}" (${data.code}) หรือไม่?`,
        'ยืนยันการลบ',
        async () => {
          await this.locationStore.remove(data.code)
          success('ลบสำเร็จ')
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

.badge-yes {
  background: #d4edda;
  color: #155724;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.badge-no {
  background: #f8f9fa;
  color: #6c757d;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.badge-temp {
  background: #fff3cd;
  color: #856404;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.badge-active {
  background: #d4edda;
  color: #155724;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.badge-inactive {
  background: #f8d7da;
  color: #721c24;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}
</style>
