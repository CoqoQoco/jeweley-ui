<template>
  <div>
    <BaseDataTable
      :items="data.data"
      :totalRecords="data.total"
      :columns="columns"
      :perPage="take"
      :rowsPerPageOptions="[10, 30]"
      :scrollHeight="'calc(100vh - 290px)'"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #statusTemplate="{ data: rowData }">
        <div class="d-flex">
          <div class="mr-2">
            <button
              class="btn btn-sm btn btn-main"
              title="ตรวจสอบ"
              @click="viewplan(rowData)"
            >
              <i class="bi bi-search"></i>
            </button>
          </div>
          <div class="box-status-show mr-2" :class="getBoxStatus(rowData.status)">
            {{ rowData.statusName }}
          </div>
          <div
            v-if="getPermissonNext(rowData)"
            class="box-status-next"
            @click="onShowCreatePlan(rowData)"
          >
            <span><i class="bi bi-brush mr-2"></i></span>
            <span>{{ rowData.nextStatusName }}</span>
          </div>
        </div>
      </template>

      <template #imageTemplate="{ data: rowData }">
        <div v-if="stringToArray(getImgUrl(rowData)).length" class="box-image-show">
          <div v-for="(img, index) in stringToArray(getImgUrl(rowData))" :key="index">
            <imagePreview
              :imageName="img"
              :type="getImgType(rowData)"
              :width="30"
              :height="30"
            />
          </div>
        </div>
      </template>
    </BaseDataTable>

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
      @refresh="refreshPage"
    ></createCastingSilver>
    <createCasting
      :isShow="isShow.isShowCastingCreate"
      :modelValue="update"
      @closeModal="oncloseCreatePlan"
      @refresh="refreshPage"
    ></createCasting>
    <createCutting
      :isShow="isShow.isShowCuttingCreate"
      :modelValue="update"
      @closeModal="oncloseCreatePlan"
      @refresh="refreshPage"
    ></createCutting>
    <createStore
      :isShow="isShow.isShowStoreCreate"
      :modelValue="update"
      @closeModal="oncloseCreatePlan"
      @refresh="refreshPage"
    ></createStore>
    <newCreateStore
      :isShow="isShow.isShowNewStoreCreate"
      :modelValue="update"
      @closeModal="oncloseCreatePlan"
      @refresh="refreshPage"
    ></newCreateStore>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { formatISOString } from '@/services/utils/dayjs.js'
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
const newCreateStore = defineAsyncComponent(() =>
  import('@/views/mold/components/create/new-store-view.vue')
)

const interfaceIsShow = {
  isShowResinCreate: false,
  isShowCastingSilverCreate: false,
  isShowCastingCreate: false,
  isShowCuttingCreate: false,
  isShowStoreCreate: false,
  isShowNewStoreCreate: false
}

export default {
  components: {
    BaseDataTable,
    imagePreview,
    createResin,
    createCastingSilver,
    createCasting,
    createCutting,
    createStore,
    newCreateStore
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
      isShow: { ...interfaceIsShow },
      columns: [
        { field: 'status', header: 'สถานะปัจจุบัน/สถานะลำดับถัดไป', sortable: true, minWidth: '180px' },
        { field: 'moldCode', header: 'รหัสตั้งเเม่พิมพ์', sortable: true, minWidth: '150px' },
        { field: 'code', header: 'รหัสเเม่พิมพ์', sortable: true, minWidth: '150px' },
        { field: 'catagoryName', header: 'ประเภทเเม่พิมพ์', sortable: true, minWidth: '150px' },
        { field: 'image', header: 'รูปเเม่พิมพ์', sortable: false, minWidth: '150px' },
        { field: 'createDate', header: 'วันตั้งเเม่พิมพ์', sortable: true, minWidth: '150px', format: 'date' },
        { field: 'updateDate', header: 'เเก้ไขตั้งเเม่พิมพ์ล่าสุด', sortable: true, minWidth: '150px', format: 'date' }
      ],

      //--------- table ---------//
      take: 10,
      skip: 0,
      sort: [{ field: 'updateDate', dir: 'desc' }],
      data: {},
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
      this.fetchData()
    },
    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => {
        return { field: item.field, dir: item.order === 1 ? 'asc' : 'desc' }
      })
      this.fetchData()
    },

    // ----------- APIs ----------- //
    async fetchData() {
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
      const res = await api.jewelry.post('Mold/PlanList', params)
      if (res) {
        this.data = { ...res }
      }
    },

    // -------- helper function -------- //
    stringToArray(str) {
      if (str && typeof str === 'string') {
        str = str.trim()
        if (!str.includes(',')) {
          return str ? [str] : []
        }
        return str
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item !== '')
      }
      return []
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
    getImgType(data) {
      switch (data.status) {
        case 10:
          return 'PLANMOLDDESIGN'
        case 20:
          return 'PLANMOLDRESIN'
        case 30:
          return 'PLANMOLDCASTINGSILVER'
        case 40:
          return 'PLANMOLDCASTING'
        case 50:
          return 'PLANMOLDCUTTING'
        case 60:
          return 'MOLD'
        default:
          return null
      }
    },
    getPermissonNext(data) {
      const allowNext = [10, 20, 30, 40, 50]
      return allowNext.includes(data.status)
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
      this.$router.push({ name: 'plan-data', params: { id: data.id } })
    },
    oncloseCreatePlan() {
      this.isShow = { ...interfaceIsShow }
    },
    refreshPage() {
      this.fetchData()
      this.oncloseCreatePlan()
    },
    onShowCreatePlan(item) {
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
        if (item.isNewProcess) {
          this.isShow.isShowNewStoreCreate = true
        } else {
          this.isShow.isShowStoreCreate = true
        }
      }
    }
  },
  created() {
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
