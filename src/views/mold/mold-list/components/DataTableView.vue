<template>
  <div>
    <BaseDataTable
      :items="data.data"
      :totalRecords="data.total"
      :columns="columns"
      @page="handlePageChange"
      @sort="handlePageChangeSort"
      :perPage="take"
      :rowsPerPageOptions="[10, 30]"
    >
      <!-- Custom Column Templates -->
      <template #imageTemplate="slotProps">
        <div class="image-container">
          <div>
            <imagePreview
              :imageName="slotProps.data.code"
              type="MOLD"
              :width="25"
              :height="25"
            ></imagePreview>
          </div>
          <div class="ml-2" v-if="slotProps.data.imageDraft1">
            <imagePreview
              :imageName="`${slotProps.data.code}-Sub`"
              type="MOLD"
              :width="25"
              :height="25"
            ></imagePreview>
          </div>
        </div>
      </template>

      <template #statusTemplate="slotProps">
        <div class="d-flex">
          <div
            class="box-status-show mr-2"
            :class="slotProps.data.status === 1 ? 'box-status-success' : 'box-status-show'"
          >
            {{ getMoldStatus(slotProps.data.status) }}
          </div>
          <button
            :class="[
              'btn btn-sm mr-1',
              slotProps.data.status !== 1 ? 'btn-secondary' : 'btn-green'
            ]"
            title="เบิกเเม่พิมพ์"
            @click="showModalPicking(slotProps.data)"
            :disabled="slotProps.data.status !== 1"
          >
            <i class="bi bi-arrow-bar-up"></i>
          </button>
          <button
            class="btn btn-sm btn btn-warning mr-1"
            title="เเก้ไข"
            @click="showModalUpdate(slotProps.data)"
          >
            <i class="bi bi-brush"></i>
          </button>
          <button
            :class="['btn btn-sm', slotProps.data.planId ? 'btn-main' : 'btn-secondary']"
            title="ตรวจสอบ"
            @click="viewplan(slotProps.data)"
            :disabled="!slotProps.data.planId"
          >
            <i class="bi bi-search"></i>
          </button>
        </div>
      </template>
    </BaseDataTable>

    <modalUpdate
      :isShow="isShowUpdate"
      :modelValue="update"
      @closeModal="closeModalUpdate"
      @fetch="fetchDataByUpdate"
    ></modalUpdate>
    <modalPicking
      :isShow="isShowPicking"
      :modelValue="picking"
      @closeModal="closeModalPicking"
      @fetch="fetchDataByPicking"
    ></modalPicking>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-helper.js'

import modalUpdate from './UpdateView.vue'
import modalPicking from './PickingView.vue' // ยังไม่ได้ใช้
export default {
  components: {
    BaseDataTable,
    imagePreview,
    modalUpdate,
    modalPicking
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
      isLoadingImage: false,
      isShowUpdate: false,
      isShowPicking: false,

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

      columns: [
        {
          field: 'image',
          header: '',
          //width: '80px',
          sortable: false
        },
        {
          field: 'status',
          header: 'สถานะ',
          width: '150px',
          sortable: true
        },
        {
          field: 'code',
          header: 'รหัส',
          width: '150px',
          sortable: true
        },
        {
          field: 'category',
          header: 'ประเภท',
          width: '150px',
          sortable: true
        },
        {
          field: 'moldBy',
          header: 'ช่างขึ้นพิมพ์',
          width: '150px',
          sortable: true
        },
        {
          field: 'reModelMold',
          header: 'แปลงแบบ',
          width: '150px',
          sortable: true
        },
        {
          field: 'description',
          header: 'รายละเอียด',
          sortable: false
        }
      ],

      //--------- dataUpdate ---------//
      update: {},
      picking: {}
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
            text: this.form.text ?? null
          }
        }
        console.log('params', params)
        const res = await api.jewelry.post('Mold/SearchMold', params)
        if (res) {
          this.data = null
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
    getMoldStatus(status) {
      switch (status) {
        case 1:
          return 'จัดเก็บคลัง'
        case 2:
          return 'อยู่ระหว่างเบิกพิมพ์'
        default:
          return 'ไม่ทราบสถานะ'
      }
    },

    // -------- event -------- //
    showModalUpdate(data) {
      this.update = { ...data }
      this.isShowUpdate = true
    },
    closeModalUpdate() {
      this.update = {}
      this.isShowUpdate = false
    },
    fetchDataByUpdate() {
      this.isShowUpdate = false

      // เเก้ปัญหา image ไม่เปลี่ยน
      setTimeout(() => {
        window.location.reload()
      }, 100) // ปรับเวลาตามความเหมาะสม
    },
    viewplan(data) {
      console.log('viewplan', data)
      this.$router.push({ name: 'plan-data', params: { id: data.planId } })
    },
    showModalPicking(data) {
      this.picking = { ...data }
      this.isShowPicking = true
    },
    closeModalPicking() {
      this.picking = {}
      this.isShowPicking = false
    },
    fetchDataByPicking() {
      this.isShowPicking = false
      this.fetchData()

      // เเก้ปัญหา image ไม่เปลี่ยน
      // setTimeout(() => {
      //   window.location.reload()
      // }, 100) // ปรับเวลาตามความเหมาะสม
    }
  },
  created() {
    //console.log('created', this.modelForm)
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
.image-container {
  display: flex;
  justify-content: start;
  align-items: center;
  margin-left: 4px;
}
</style>
