<template>
  <div class="mt-2">
  
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
      <Column field="image" header="รูปสินค้า" style="min-width: 100px">
        <template #body="slotProps">
          <div class="image-container">
            <loading :isLoading="isLoadingImage"></loading>
            <!-- <img :src="fetchIamge(slotProps)" alt="Preview Image" /> -->
            <imagePreview :imageName="slotProps.data.mold" :type="mold"></imagePreview>
          </div>
        </template>
      </Column>
      <Column field="wo" header="เลขที่ใบงาน" style="min-width: 150px">
        <template #body="slotProps">
          {{ `${slotProps.data.wo}${slotProps.data.woNumber}` }}
        </template>
      </Column>
      <Column field="status" header="สถานะงาน" style="min-width: 150px">
        <template #body="slotProps">
          {{ slotProps.data.wagesStatus === 100 ? `สำเร็จ` : `ติดตามระหว่างผลิต` }}
        </template>
      </Column>
      <Column header="ช่าง" field="workerCode" style="min-width: 150px">
        <template #body="slotProps">
          {{ `${slotProps.data.workerCode}-${slotProps.data.workerName}` }}
        </template>
      </Column>
      <Column header="วันที่ส่งงาน" field="jobDate" style="min-width: 150px">
        <template #body="prop">
          {{ formatDate(prop.data.jobDate) }}
        </template>
      </Column>
      <Column header="รหัสสินค้า" field="productNumber" style="min-width: 150px"></Column>
      <Column header="เเผนกงาน" field="statusName" style="min-width: 150px"></Column>
      <Column header="รายละเอียด" field="desc" style="min-width: 150px">
        <template #body="slotProps">
          {{
            `${slotProps.data.gold} ${
              slotProps.data.description ? `[${slotProps.data.description}]` : ``
            }`
          }}
        </template>
      </Column>
      <Column header="จำนวนจ่าย" field="goldQtySend" style="min-width: 150px"></Column>
      <Column header="น้ำหนักจ่าย" field="goldWeightSend" style="min-width: 150px"></Column>
      <Column header="จำนวนรับ" field="goldQtyCheck" style="min-width: 150px"></Column>
      <Column header="น้ำหนักรับ" field="goldWeightCheck" style="min-width: 150px"></Column>
      <!-- <Column header="ราคาต่อหน่วย" field="wages" style="min-width: 150px">
        <template #body="slotProps">
          <div>
            {{
              `${
                slotProps.data.wages
                  ? Number(slotProps.data.wages).toFixed(2).toLocaleString()
                  : Number(0).toFixed(2).toLocaleString()
              }`
            }}
          </div>
        </template>
      </Column>
      <Column header="ราคา" field="totalWages" style="min-width: 150px">
        <template #body="slotProps">
          <div>
            {{
              `${
                slotProps.data.totalWages
                  ? Number(slotProps.data.totalWages).toFixed(2).toLocaleString()
                  : Number(0).toFixed(2).toLocaleString()
              }`
            }}
          </div>
        </template>
      </Column> -->
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



//prime table
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import api from '@/axios/axios-helper.js'
import { getAzureBlobUrl } from '@/config/azure-storage-config.js'

const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

export default {
  components: {
    DataTable,
    Column,
  
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
    },
    masterStatusValue: {
      type: Array,
      default: () => []
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

      modelUpdateStatus: {}

      //master
      //masterStatus: []
    }
  },
  computed: {
    isData() {
      return this.modelValue.length ? false : true
    },
    masterStatus() {
      return this.masterStatusValue
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
        case 95:
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
        console.log(this.formValue)
        const param = {
          take: this.take,
          skip: this.skip,
          sort: this.sort,
          search: {
            createStart: this.formValue?.start ? formatISOString(this.formValue.start) : null,
            createEnd: this.formValue?.end ? formatISOString(this.formValue.end) : null,
            text: this.formValue?.text
          }
        }
        const res = await api.jewelry.post('Worker/TrackingWorkerRequest', param)
        if (res) {
          this.data = { ...res }
          //console.log('summery', summery)
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
          // Build Azure Blob URL for production plan image
          const imagePath = item.data.tbtProductionPlanImage[0].path
          const blobPath = `ProductionPlan/${imagePath}`
          return getAzureBlobUrl(blobPath)
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
    //this.fetchMaterStatus()
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
