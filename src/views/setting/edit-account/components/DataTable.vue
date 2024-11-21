<template>
  <div class="mt-2">
    <!-- @view="viewplan" -->
    <BaseDataTable
      :items="data.data"
      :totalRecords="data.total"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn btn-green" @click="view(data)">
            <i class="bi bi-search"></i>
          </button>
          <!-- <button class="ml-1 btn btn-sm btn btn-dark" title="โหมดดูรายละเอียด">
              <i class="bi bi-clipboard2-data-fill"></i>
            </button> -->
        </div>
      </template>

      <template #statusTemplate="{ data }">
        <div :class="getStatusSeverity(data)">
          {{ getStatusName(data) }}
        </div>
      </template>
      <template #targetStatusTemplate="{ data }">
        <div style="width: 150px" :class="getStatusSeverity(data.targetStatus)">
          {{ data.targetStatusName }}
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
//import { defineAsyncComponent } from 'vue'
//import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { useUserApiStore } from '@/stores/modules/api/user/user-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  components: {
    BaseDataTable
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({}), // ให้ default เป็น empty object แทน
      required: true
    },
    modelFormExport: {
      type: Object,
      default: () => ({})
    },
    formValueExport: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      take: 10,
      skip: 0,
      sort: [],
      data: {},

      // Columns Configuration
      columns: [
        {
          field: 'action',
          header: '',
          sortable: false,
          width: '50px', // กำหนดความกว้างแน่นอนสำหรับคอลัมน์ action
          minWidth: '50px'
        },
        {
          field: 'username',
          header: 'ชื่อบัญชีผู้ใช้งาน',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'firstName',
          header: 'ชื่อ',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'lastName',
          header: 'นามสกุล',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'createdDate',
          header: 'วันที่ลงทะเบียน',
          sortable: true,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'status',
          header: 'สถานะ',
          sortable: false,
          width: '100px'
        }
      ]
    }
  },

  setup() {
    const userStore = useUserApiStore()
    return { userStore }
  },

  computed: {
    form() {
      return this.modelForm || {}
    }
  },

  watch: {
    async modelForm() {
      await this.fetchData()
    },
    async modelFormExport() {
      //await this.fetchDataExport()
    }
  },

  methods: {
    // ----- data table hnadle
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

    // ---- APIs
    async fetchData() {
      const res = await this.userStore.fetchDataList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        form: this.form
      })

      if (res) {
        this.data = { ...res }
      }
    },
    // async fetchDataExport() {
    //   await this.userStore.fetchDataTransferExport({
    //     sort: this.sort,
    //     form: this.form,
    //     masterStatus: this.planStatus
    //   })
    // },

    // handle page
    view(data) {
      //this.$emit('view', data)
      this.$router.push({ name: 'edit-account-view', params: { id: data.id } })
    },
    getStatusSeverity(data) {
      if (data.isActive) {
        return 'box-status-success'
      }
      if (data.isNew) {
        return 'box-status-process'
      }
      return 'box-status-disable'
    },
    getStatusName(data) {
      if (data.isActive) {
        return 'ใช้งาน'
      }
      if (data.isNew) {
        return 'รออนุมัติ'
      }
      return 'ไม่ใช้งาน'
    },
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.notification {
  display: inline-flex;
  align-items: center;
  //background-color: #ffe6e6; /* ส้มอ่อน */
  //padding: 4px 8px;
  //border-radius: 4px;
}

.overdue-tag {
  background-color: #ff4d4d; /* สีแดง */
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: 4px;
  font-size: 12px;
}
</style>
