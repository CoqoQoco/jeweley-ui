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
      <Column
        header="สถานะปัจจุบัน/สถานะลำดับถัดไป"
        sortable
        field="status"
        style="min-width: 180px"
      >
        <template #body="slotProps">
          <div class="d-flex">
            <div class="mr-2">
              <button
                class="btn btn-sm btn btn-main"
                title="ตรวจสอบ"
                @click="viewplan(slotProps.data)"
              >
                <i class="bi bi-search"></i>
              </button>
            </div>
            <div class="box-status-show mr-2" :class="getBoxStatus(slotProps.data.status)">
              {{ slotProps.data.statusName }}
            </div>
            <di
              v-if="getPermissonNext(slotProps.data)"
              class="box-status-next"
              @click="onShowCreatePlan(slotProps.data)"
            >
              <span> <i class="bi bi-brush mr-2"></i></span>
              <span> {{ slotProps.data.nextStatusName }}</span>
            </di>
          </div>
        </template>
      </Column>
      <!-- <Column header="สถานะลำดับถัดไป" sortable field="nextStatus" style="width: 180px">
        <template #body="prop">
          <div class="box-status-next">
            {{ prop.data.nextStatusName }}
          </div>
        </template>
      </Column> -->
      <Column header="รหัสตั้งเเม่พิมพ์" field="moldCode" sortable style="min-width: 150px">
      </Column>
      <Column header="รหัสเเม่พิมพ์" field="code" sortable style="min-width: 150px"> </Column>
      <Column
        header="ประเภทเเม่พิมพ์"
        field="catagoryName"
        sortable
        style="min-width: 150px"
      ></Column>
      <Column header="รูปเเม่พิมพ์" field="image" style="min-width: 150px">
        <template #body="slotProps">
          <div v-if="stringToArray(getImgUrl(slotProps.data)).length" class="box-image-show">
            <div v-for="(img, index) in stringToArray(getImgUrl(slotProps.data))" :key="index">
              <imagePreview
                :imageName="img"
                type="PATH"
                :path="getImgPath(slotProps.data)"
                :width="30"
                :height="30"
              />
            </div>
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
    </DataTable>

    <createResin
      :isShow="isShow.isShowResinCreate"
      :modelValue="update"
      @closeModal="oncloseCreatePlan"
      @refresh="refreshPage"
    ></createResin>
    <createCastingSilver
      :isShow="isShow.isShowCastingSilverCreate"
      :modelValue="update"
      @closeModal="oncloseCreatePlan"
    ></createCastingSilver>
    <createCasting
      :isShow="isShow.isShowCastingCreate"
      :modelValue="update"
      @closeModal="oncloseCreatePlan"
    ></createCasting>
    <createCutting
      :isShow="isShow.isShowCuttingCreate"
      :modelValue="update"
      @closeModal="oncloseCreatePlan"
    ></createCutting>
    <createStore
      :isShow="isShow.isShowStoreCreate"
      :modelValue="update"
      @closeModal="oncloseCreatePlan"
    ></createStore>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-helper.js'

const createResin = defineAsyncComponent(() =>
  import('@/views/mold/components/create/ResinView.vue')
)
const createCastingSilver = defineAsyncComponent(() =>
  import('@/views/mold/components/create/CastingOfSilverView.vue')
)
const createCasting = defineAsyncComponent(() =>
  import('@/views/mold/components/create/CastingView.vue')
)
const createCutting = defineAsyncComponent(() =>
  import('@/views/mold/components/create/CuttingView.vue')
)
const createStore = defineAsyncComponent(() =>
  import('@/views/mold/components/create/StoreView.vue')
)

//const createResin = () => import('@views/mold/components/create/ResinView.vue')
//import createResin from '@views/mold/components/create/ResinView.vue'

const interfaceIsShow = {
  isShowResinCreate: false,
  isShowCastingSilverCreate: false,
  isShowCastingCreate: false,
  isShowCuttingCreate: false,
  isShowStoreCreate: false
}

export default {
  components: {
    loading,
    DataTable,
    Column,
    imagePreview,
    createResin,
    createCastingSilver,
    createCasting,
    createCutting,
    createStore
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
      isShow: { ...interfaceIsShow },

      //--------- table ---------//
      totalRecords: 0,
      take: 10, //all
      skip: 0,
      //sortField: 'updateDate',
      //sortOrder: -1, // หรือ -1 สำหรับ descending
      sort: [{ field: 'updateDate', dir: 'desc' }],
      //sort: [],
      data: {},
      dataExcel: {},
      expnadData: [],
      form: null,

      //--------- dataUpdate ---------//
      update: {}
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

        console.log('fetchData req', this.form)

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
      console.log('stringToArray', str)
      if (str && typeof str === 'string') {
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
      } else {
        return []
      }
    },
    getImgUrl(data) {
      switch (data.status) {
        case 10:
          return data.imgDesign ?? []
        case 20:
          return data.imgResin ?? []
        case 30:
          return data.imgCastingSilver ?? []
        case 40:
          return data.imgCasting ?? []
        case 50:
          return data.imgCutting ?? []
        case 60:
          return data.imgStore ?? []
        default:
          return []
      }
    },
    getImgPath(data) {
      switch (data.status) {
        case 10:
          return 'Images/MoldPlanDesign'
        case 20:
          return 'Images/MoldPlanResin'
        case 30:
          return 'Images/MoldPlanCastingSilver'
        case 40:
          return 'Images/MoldPlanCasting'
        case 50:
          return 'Images/MoldPlanCutting'
        case 60:
          return 'Images/Mold'
        default:
          return null
      }
    },
    getPermissonNext(data) {
      const allowNext = [10, 20, 30, 40, 50]
      return allowNext.includes(data.status)
    },
    getMeltingStatus(status) {
      if (status === 500) {
        return true
      }
      return false
    },
    getBoxStatus(status) {
      if (status === 60) {
        return 'box-status-success'
      }
      if (status === 500) {
        return 'box-status-process'
      }
      return 'box-status-show'
    },

    // -------- event -------- //
    viewplan(data) {
      console.log('viewplan', data)
      this.$router.push({ name: 'plan-data', params: { id: data.id } })
    },
    oncloseCreatePlan() {
      this.isShow = { ...interfaceIsShow }
      //this.fetchData()
    },
    refreshPage() {
      setTimeout(() => {
        window.location.reload()
      }, 100) // ปรับเวลาตามความเหมาะสม
    },
    onShowCreatePlan(item) {
      console.log('onShowCreatePlan', item)
      this.update = { ...item }
      if (item.nextStatus === 20) {
        this.isShow.isShowResinCreate = true
      }
      if (item.nextStatus === 30) {
        this.isShow.isShowCastingSilverCreate = true
      }
      if (item.nextStatus === 40) {
        this.isShow.isShowCastingCreate = true
      }
      if (item.nextStatus === 50) {
        this.isShow.isShowCuttingCreate = true
      }
      if (item.nextStatus === 60) {
        this.isShow.isShowStoreCreate = true
      }
    }
  },
  created() {
    console.log('created', this.modelForm)
    this.form = { ...this.modelForm }
    this.$nextTick(() => {
      this.fetchData()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.box-image-show {
  display: flex;
  gap: 5px;
}
</style>
