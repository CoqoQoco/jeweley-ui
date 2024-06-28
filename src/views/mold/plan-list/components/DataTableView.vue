<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <DataTable
      :totalRecords="data.total"
      :value="data.data"
      v-model:expandedRows="expnadData"
      dataKey="id"
      ref="dt"
      class="p-datatable-sm"
      scrollable
      scrollHeight="calc(100vh - 290px)"
      resizableColumns
      :paginator="true"
      :lazy="true"
      @page="handlePageChange"
      @sort="handlePageChangeSort"
      :rows="take"
      removableSort
      sortMode="multiple"
      :rowsPerPageOptions="[10, 30]"
      paginatorTemplate="FirstPageLink PrevPageLink  CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      :currentPageReportTemplate="`เเสดงข้อมูล {first} - {last} จากทั้งหมด {totalRecords} รายการ`"
    >
      <Column style="width: 50px">
        <template #body="slotProps">
          <div class="center-container">
            <button
              class="btn btn-sm btn btn-main"
              title="ตรวจสอบ"
              @click="viewplan(slotProps.data)"
            >
              <i class="bi bi-brush"></i>
            </button>
          </div>
        </template>
      </Column>
      <Column header="วันตั้งเเม่พิมพ์" sortable field="createDate" style="min-width: 150px">
        <template #body="prop">
          {{ formatDate(prop.data.createDate) }}
        </template>
      </Column>
      <Column
        header="เเก้ไขตั้งเเม่พิมพ์ล่าสุด"
        :sortable="true"
        field="updateDate"
        style="min-width: 150px"
      >
        <template #body="prop">
          {{ formatDate(prop.data.updateDate) }}
        </template>
      </Column>
      <Column
        header="รหัสตั้งเเม่พิมพ์"
        field="moldCode"
        sortable
        style="min-width: 150px"
      ></Column>
      <Column header="รูปตั้งเเม่พิมพ์" field="image" style="min-width: 150px">
        <template #body="slotProps">
          <div v-if="stringToArray(slotProps.data.image).length" class="box-image-show">
            <div v-for="(img, index) in stringToArray(slotProps.data.image)" :key="index">
              <imagePreview :imageName="img" type="PLANMOLD" :width="30" :height="30" />
            </div>
          </div>
        </template>
      </Column>
      <Column header="สถานะ" field="statusName" style="min-width: 150px">
        <template #body="prop">
          <div class="box-status-show">
            {{ prop.data.statusName }}
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-config.js'

export default {
  components: {
    loading,
    DataTable,
    Column,
    imagePreview
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
        this.fetchData()
      },
      deep: true
    }
  },
  data() {
    return {
      isLoading: false,

      //--------- table ---------//
      totalRecords: 0,
      take: 10, //all
      skip: 0,
      //sortField: 'updateDate',
      //sortOrder: -1, // หรือ -1 สำหรับ descending
      //sort: [{ field: 'updateDate', dir: 'desc' }],
      sort: [],
      data: {},
      dataExcel: {},
      expnadData: [],
      form: null
    }
  },
  methods: {
    // ----------- table ----------- //
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => {
        return { field: item.field, dir: item.order === 1 ? 'asc' : 'desc' }
      })
      //console.log(e)
      this.fetchData()
    },
    handlePageChangeSort(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => {
        return { field: item.field, dir: item.order === 1 ? 'asc' : 'desc' }
      })
      this.fetchData()
    },

    // ----------- APIs ----------- //
    async fetchData() {
      try {
        this.isLoading = true

        const params = {
          take: this.take,
          skip: this.skip,
          sort: this.sort,
          search: {
            createStart: this.form.createStart ? formatISOString(this.form.createStart) : null,
            createEnd: this.form.createEnd ? formatISOString(this.form.createEnd) : null,
            updateStart: this.form.updateStart ? formatISOString(this.form.updateStart) : null,
            updateEnd: this.form.updateEnd ? formatISOString(this.form.updateEnd) : null,
            moldCode: this.form.moldCode
          }
        }
        console.log('params', params)
        const res = await api.jewelry.post('Mold/PlanList', params)
        if (res) {
          this.data = { ...res }
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },

    // -------- helper function -------- //
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },
    stringToArray(str) {
      // ตัดช่องว่างหน้าและหลังสตริง
      str = str.trim()
      //console.log('stringToArray', str)

      // ถ้าไม่มีเครื่องหมายจุลภาค ให้คืนค่าเป็น array ที่มีสมาชิกเดียว
      if (!str.includes(',')) {
        return str ? [str] : []
      }

      // แยกด้วยเครื่องหมายจุลภาค, ตัดช่องว่าง, และกรองค่าว่างออก
      const res = str
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item !== '')
      return res
    },

    // -------- event -------- //
    viewplan(data) {
      console.log('viewplan', data)
      this.$router.push({ name: 'plan-data', params: { id: data.id } })
    }
  },
  created() {
    console.log('created', this.modelForm)
    this.form = { ...this.modelForm }
    this.$nextTick(() => {
      this.fetchData()
    })
  },
  mounted() {
    //console.log('mounted', this.modelForm)
    //this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
.box-status-show {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border-radius: 5px;
  color: var(--base-font-color);
  font-weight: bold;
  font-size: 12px;
  background-color: #f1c40f;
  width: 70%;
  height: 100%;
}
.box-image-show {
  display: flex;
  gap: 5px;
}
</style>
