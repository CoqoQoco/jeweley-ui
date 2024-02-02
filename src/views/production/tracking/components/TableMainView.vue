<template>
  <div class="mt-2">
    <loading :isLoading="isLoading"></loading>
    <DataTable
      :totalRecords="data.total"
      :value="data.data"
      v-model:expandedRows="expnadData"
      dataKey="id"
      class="p-datatable-sm"
      scrollable
      scrollHeight="calc(100vh - 310px)"
      columnResizeMode="expand"
      resizableColumns
      :paginator="true"
      :lazy="true"
      @page="handlePageChange"
      :rows="take"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink  CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      :currentPageReportTemplate="`เเสดงข้อมูล {first} - {last} จากทั้งหมด {totalRecords} รายการ`"
    >
      <Column style="width: 80px">
        <template #body="slotProps">
          <div class="btn-action-container">
            <button
              class="btn btn-sm btn btn-main"
              title="โหมดเเก้ไข"
              @click="viewplan(slotProps.data)"
            >
              <i class="bi bi-brush"></i>
            </button>
            <button class="ml-1 btn btn-sm btn btn-dark" title="โหมดดูรายละเอียด">
              <i class="bi bi-clipboard2-data-fill"></i>
            </button>
          </div>
        </template>
      </Column>
      <Column field="wo" header="W.O." style="min-width: 100px">
        <template #body="slotProps">
          {{ `${slotProps.data.wo}-${slotProps.data.woNumber}` }}
        </template>
      </Column>
      <Column field="mold" header="เเม่พิมพ์" style="min-width: 100px"></Column>
      <Column field="status" header="สถานะใบงาน" style="min-width: 150px">
        <template #body="slotProps">
          <div
            class="custom-tag-status text-center"
            style="width: 100px"
            :class="getStatusSeverity(slotProps.data.status)"
            @click="onUpdateStatus(slotProps)"
          >
            {{ slotProps.data.statusName }}
          </div>
        </template>
      </Column>
      <Column field="tbtProductionPlanImage" header="รูปสินค้า" style="min-width: 150px">
        <template #body="slotProps">
          <div class="image-container">
            <loading :isLoading="isLoadingImage"></loading>
            <!-- <img :src="fetchIamge(slotProps)" alt="Preview Image" /> -->
            <imagePreview :imageName="slotProps.data.mold" :type="mold"></imagePreview>
          </div>
        </template>
      </Column>
      <Column header="รหัสสินค้า" field="productNumber" style="min-width: 100px"></Column>
      <Column header="รหัสลูกค้า" field="customerNumber" style="min-width: 100px"></Column>
      <Column header="วันสร้างใบสินค้า" field="createDate" style="min-width: 100px">
        <template #body="prop">
          {{ formatDate(prop.data.createDate) }}
        </template>
      </Column>
      <Column header="วันส่งงานลูกค้า" field="requestDate" style="min-width: 100px">
        <template #body="prop">
          {{ formatDate(prop.data.requestDate) }}
        </template>
      </Column>
      <!-- <template #expansion="slotProps">
        <div class="p-3">
          <h6 style="color: var(--base-font-color)">
            <span class="mr-2"><i class="bi bi-gem"></i></span>
            <span>ส่วนประกอบสินค้า</span>
          </h6>
          <tableExpand v-model:formValue="slotProps.data"></tableExpand>
          <DataTable
            class="expnad-table-container"
            :value="slotProps.data.tbtProductionPlanMaterial"
            showGridlines
          >
            <Column header="รายการ" field="material"></Column>
            <Column header="ประเภท" field="materialType"></Column>
            <Column header="รูปร่าง" field="materialShape"></Column>
            <Column header="ขนาด" field="materialSize"></Column>
            <Column header="จำนวน" field="materialQty"></Column>
            <Column header="หมายเหตุ" field="materialRemark"></Column>
          </DataTable>
        </div>
      </template> -->
    </DataTable>
  </div>
</template>
<script>
import { defineAsyncComponent } from 'vue'
//import tableMain from '@/components/table/HtmlTable.vue'
import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs.js'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

//prime table
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import api from '@/axios/axios-config.js'

const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

export default {
  components: {
    DataTable,
    Column,
    loading,
    imagePreview
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    formValue: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isLoading: false,
      isLoadingImage: false,
      isShowUpdateStatusModal: false,
      orderplan: 'ORDERPLAN',
      mold: 'MOLD',

      // table
      totalRecords: 0,
      take: 10, //all
      skip: 0,
      data: {},
      expnadData: [],

      //test
      urlImg: null,

      modelUpdateStatus: {},

      //master
      masterStatus: []
    }
  },
  computed: {
    isData() {
      return this.modelValue.length ? false : true
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
  methods: {
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchData()
    },

    // ----- tag ------ //
    getStatusSeverity(status) {
      switch (status) {
        case 9999:
          return 'bg-danger bg-gradient'
        case 100:
          return 'bg-success bg-gradient'
        case 10:
          return 'bg-dark bg-gradient'
        case 50:
        case 55:
        case 60:
        case 70:
        case 80:
        case 85:
        case 90:
        case 95:
          return 'bg-primary bg-gradient text-light'
      }
    },

    // ------ helper ------//
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },

    // ----- Api ----- //
    async fetchData() {
      try {
        this.isLoading = true
        this.data = {}
        //console.log(this.formValue)
        const param = {
          take: this.take,
          skip: this.skip,
          search: {
            start: this.formValue.start ? formatISOString(this.formValue.start) : null,
            end: this.formValue.end ? formatISOString(this.formValue.end) : null,
            text: this.formValue.text
          }
        }
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanSearch', param)
        if (res) {
          this.data = { ...res }
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchIamge(item) {
      if (item.data.tbtProductionPlanImage && item.data.tbtProductionPlanImage.length) {
        try {
          const param = {
            imageName: item.data.tbtProductionPlanImage[0].path
          }

          const res = await api.jewelry.get('FileExtension/GetPlanImage', param)
          const response = `data:image/png;base64,${res}`
          return response
        } catch (error) {
          console.log(error)
          return null
        }
      }
    },
    async fetchMaterStatus() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('ProductionPlan/GetProductionPlanStatus')
        if (res) {
          this.masterStatus = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },

    // ----- update status ----- //
    closeModalUpdatestatus() {
      this.isShowUpdateStatusModal = false
    },
    onUpdateStatus(item) {
      this.isShowUpdateStatusModal = true
      this.modelUpdateStatus = { ...item }
    },
    async fetchDataByupdateStatus() {
      //console.log(e)
      this.isShowUpdateStatusModal = false
      await this.fetchData()
    },

    // ---- view plan ---- //
    viewplan(item) {
      //console.log(item.id)
      const id = item.id
      window.open(`/plan-order-tracking-update/${id}`, '_blank')
      //this.$router.push({ name: 'plan-order-tracking-detail', params: { id: 123 } })
    }
  },
  created() {
    this.fetchMaterStatus()
    this.fetchData()
  },
  async mounted() {
    //this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/table-data.scss';

.custom-tag-status {
  padding: 10px;
  --x: 50%;
  --y: 50%;
  position: relative;
  appearance: none;
  //padding: 1em 1em;
  color: white;
  cursor: pointer;
  outline: none;
  border-radius: 10px;

  // The magic
  border: 2px solid transparent;
  //   background:
  //     linear-gradient(#000, #000) padding-box,
  //     radial-gradient(farthest-corner at var(--x) var(--y), #00c9a7, #845ec2) border-box;
}

.btn-link:hover {
  color: var(--base-color) !important;
  text-decoration: none !important;
}
.expnad-table-container {
  .p-datatable thead th {
    background-color: var(--base-color) !important;
    color: #ffffff;
    //font-weight: bold;
  }
}
</style>
