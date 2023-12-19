<template>
  <div class="mt-2">
    <loading :isLoading="isLoading"></loading>
    <DataTable
      :totalRecords="data.total"
      :value="data.data"
      dataKey="code"
      class="p-datatable-sm"
      scrollable
      scrollHeight="calc(100vh - 305px)"
      resizableColumns
      :paginator="true"
      :lazy="true"
      @page="handlePageChange"
      :rows="take"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink  CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      :currentPageReportTemplate="`เเสดงข้อมูล {first} - {last} จากทั้งหมด {totalRecords} รายการ`"
    >
      <Column field="code" header="รหัสพนักงาน"> </Column>
      <Column field="typeName" header="แผนก"> </Column>
      <Column field="nameTh" header="ชื่อพนักงาน (TH)"> </Column>
      <Column field="nameEn" header="ชื่อพนักงาน (EN)"> </Column>
      <Column field="isActive" header="สถานะ">
        <template #body="slotProps">
          {{ `${slotProps.data.isActive === true ? `เปิดใช้งาน` : `ปิดใช้งาน`}` }}
        </template>
      </Column>
      <Column header="วันสร้างข้อมูล" field="createDate">
        <template #body="prop">
          {{ formatDate(prop.data.createDate) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import api from '@/axios/axios-config.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

export default {
  components: {
    DataTable,
    Column,
    loading
  },
  props: {
    formValue: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    async formValue() {
      //console.log(this.formValue)
      this.take = 10
      this.skip = 0
      await this.fetchData()
    }
  },
  data() {
    return {
      // --- flag --- //
      isLoading: false,

      // table
      totalRecords: 0,
      take: 10, //all
      skip: 0,
      data: {}
    }
  },
  methods: {
    // ------ helper ------//
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },

    // --- APIs --- //
    async fetchData() {
      try {
        this.isLoading = true
        this.data = {}
        //console.log(this.formValue)
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
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },

    // --- table --- //
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
