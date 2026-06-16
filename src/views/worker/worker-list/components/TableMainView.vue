<template>
  <div class="mt-2">
    <BaseDataTable
      :items="data.data || []"
      :totalRecords="data.total || 0"
      :columns="columns"
      :perPage="take"
      :paginator="true"
      @page="handlePageChange"
    >
      <template #actionsTemplate="{ data: row }">
        <div class="btn-action-container">
          <button
            class="btn btn-sm btn-main"
            title="ตรวจสอบค่าแรง"
            @click="viewWorkerWages(row)"
          >
            <i class="bi bi-wallet2"></i>
          </button>
          <button
            class="btn btn-sm btn-main ml-2"
            title="แก้ไขข้อมูลพนักงาน"
            @click="UpdateWorker(row)"
          >
            <i class="bi bi-pencil"></i>
          </button>
        </div>
      </template>
      <template #isActiveTemplate="{ data: row }">
        {{ row.isActive === true ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import api from '@/axios/axios-helper.js'
import { formatDate } from '@/services/utils/dayjs.js'

export default {
  components: {
    BaseDataTable
  },
  props: {
    formValue: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    async formValue() {
      this.take = 10
      this.skip = 0
      await this.fetchData()
    }
  },
  data() {
    return {
      totalRecords: 0,
      take: 10,
      skip: 0,
      data: {},
      columns: [
        { field: 'actions', header: '', sortable: false, width: '80px' },
        { field: 'code', header: 'รหัสพนักงาน', minWidth: '120px' },
        { field: 'typeName', header: 'แผนก', minWidth: '100px' },
        { field: 'nameTh', header: 'ชื่อพนักงาน (TH)', minWidth: '140px' },
        { field: 'nameEn', header: 'ชื่อพนักงาน (EN)', minWidth: '140px' },
        { field: 'isActive', header: 'สถานะ', sortable: false, minWidth: '100px' },
        { field: 'createDate', header: 'วันสร้างข้อมูล', minWidth: '120px', format: 'date' }
      ]
    }
  },
  methods: {
    formatDate(date) {
      return formatDate(date)
    },
    viewWorkerWages(item) {
      const id = item.code
      window.open(`/worker-daily-wages/${id}`, '_blank')
    },
    UpdateWorker(item) {
      this.$emit('updateWorker', item)
    },

    async fetchData() {
      const params = {
        take: this.take,
        skip: this.skip,
        search: {
          text: this.formValue.text,
          type: this.formValue.type,
          active: this.formValue.active
        }
      }
      const res = await api.jewelry.post('Worker/Search', params)
      if (res) {
        this.data = { ...res }
      }
    },

    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchData()
    }
  },
  mounted() {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped></style>
