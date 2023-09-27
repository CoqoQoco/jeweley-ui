<template>
  <div class="table-container">
    <loading :isLoading="isLoading"></loading>

    <!--  ----- prime ng table ----- -->
    <DataTable
      :totalRecords="data.total"
      :value="data.data"
      v-model:expandedRows="expnadData"
      dataKey="id"
      class="p-datatable-sm custom-table"
      scrollable
      scrollHeight="calc(100vh - 320px)"
      columnResizeMode="expand"
      resizableColumns
      :paginator="true"
      @page="handlePageChange"
      :rows="take"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      :currentPageReportTemplate="`{first} to {last} of {totalRecords}`"
    >
      <Column expander style="width: 10px" />
      <Column style="width: 80px">
        <template #body="slotProps">
          <div class="col-btn-container">
            <!-- <div
              class="btn btn-sm btn-warning w-50 mr-1"
              title="ดูรายละเอียด"
              @click="onView(item)"
              disabled
            >
              <i class="bi bi-gem"></i>
            </div> -->
            <pdf class="btn btn-sm btn-info w-100" :modelValue="slotProps.data"></pdf>
          </div>
        </template>
      </Column>
      <Column field="wo" header="W.O.">
        <template #body="slotProps">
          {{ `${slotProps.data.wo}-${slotProps.data.woNumber}` }}
        </template>
      </Column>
      <!-- <Column field="woNumber" header="ลำดับ"></Column> -->
      <Column field="mold" header="เเม่พิมพ์"></Column>
      <Column field="status" header="สถานะใบงาน" style="min-width: 100px">
        <template #body="slotProps">
          <!-- <div class="btn btn-sm btn-danger"></div> -->
          <div
            class="btn btn-sm"
            :class="getStatusSeverity(slotProps.data.status)"
            @click="onUpdateStatus(slotProps)"
          >
            {{ slotProps.data.statusNavigation.nameTh }}
          </div>
        </template>
      </Column>
      <Column field="tbtProductionPlanImage" header="รูปสินค้า">
        <template #body="slotProps">
          <div class="image-container">
            <loading :isLoading="isLoadingImage"></loading>
            <!-- <img :src="fetchIamge(slotProps)" alt="Preview Image" /> -->
            <imagePreview
              :imageName="slotProps.data.tbtProductionPlanImage[0].path"
              :type="orderplan"
            ></imagePreview>
          </div>
        </template>
      </Column>
      <Column header="หมายเลขสินค้า" field="productNumber"></Column>
      <Column header="รายละเอียดสินค้า" field="productDetail"></Column>
      <Column header="หมายเลขลูกค้า" field="customerNumber"></Column>
      <Column header="วันส่งงานลูกค้า" field="requestDate">
        <template #body="prop">
          {{ formatDate(prop.data.requestDate) }}
        </template>
      </Column>
      <!-- <Column header="หมายเหตุ" field="remark">
        <template #body="prop">
          <td class="custom-remark">
            <label>{{ prop.data.remark }}</label>
          </td>
        </template>
      </Column> -->
      <template #expansion="slotProps">
        <div class="p-3">
          <!-- <h6 style="color: var(--base-font-color)">
            <span class="mr-2"><i class="bi bi-gem"></i></span>
            <span>ส่วนประกอบสินค้า</span>
          </h6> -->
          <tableExpand v-model:formValue="slotProps.data"></tableExpand>
          <!-- <DataTable
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
          </DataTable> -->
        </div>
      </template>
    </DataTable>
    <modalUpdateStatus
      :isShowModal="isShowUpdateStatusModal"
      :modelValue="modelUpdateStatus"
      :masterStatus="masterStatus"
      @closeModal="closeModalUpdatestatus"
      @fetchData="fetchDataByupdateStatus"
    ></modalUpdateStatus>
  </div>
</template>
<script>
//import tableMain from '@/components/table/HtmlTable.vue'
import { formatDate, formatDateTime, formatISOString } from '@/utils/moment'
import loading from '@/components/overlay/loading-overlay.vue'

//prime table
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
//import Tag from 'primevue/tag'
import api from '@/axios/axios-config.js'
//import ColumnGroup from 'primevue/columngroup' // optional
//import Row from 'primevue/row'

import imagePreview from '@/components/image/PreviewImage.vue'
import pdf from '@/components/pdf-make/SavePDFOrderPlan.vue'

import modalUpdateStatus from '../components/ModalUpdateStatus.vue'
import tableExpand from '../components/TableExpnad.vue'

export default {
  components: {
    DataTable,
    Column,
    loading,
    imagePreview,
    pdf,
    //Tag,
    modalUpdateStatus,
    //ColumnGroup,
    //Row
    tableExpand
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

      // table
      totalRecords: 100,
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
      //this.take = 10
      //this.skip = 0
      await this.fetchData()
    }
  },
  methods: {
    // ----- table ----- //
    onColReorder() {
      //this.$toast.add({ severity: 'success', summary: 'Column Reordered', life: 3000 })
    },
    onRowReorder(event) {
      this.products = event.value
      //this.$toast.add({ severity: 'success', summary: 'Rows Reordered', life: 3000 })
    },
    handlePageChange(e) {
      console.log('page change')
      console.log(e)
    },

    // ----- tag ------ //
    getStatusSeverity(status) {
      switch (status) {
        case 9999:
          return 'btn-danger'
        case 100:
          return 'btn-success'
        case 10:
          return 'btn-info'
        case 50:
        case 60:
        case 70:
        case 80:
        case 90:
          return 'btn-warning'
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
          //this.data = [...res.data]
          this.data = { ...res }
        }
        //console.log(this.data)
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchIamge(item) {
      //console.log(item.data.tbtProductionPlanImage[0].path)

      if (item.data.tbtProductionPlanImage && item.data.tbtProductionPlanImage.length) {
        try {
          const param = {
            imageName: item.data.tbtProductionPlanImage[0].path
          }

          // let options = {
          //   headers: {
          //     'Content-Type': `application/json`
          //   }
          // }
          const res = await api.jewelry.get('FileExtension/GetPlanImage', param)
          //console.log(res)

          // const blob = await res.blob()
          // const objectUrl = URL.createObjectURL(blob)
          // //this.dataSrc = objectUrl
          // console.log(objectUrl)

          //const data = await res.json()
          //const response = `data:image/jpeg;base64,${res}`
          const response = `data:image/png;base64,${res}`
          //console.log(response)
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
          //this.data = [...res.data]
          this.masterStatus = [...res]
        }
        //console.log(this.data)
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
    }
  },
  async created() {
    await this.fetchMaterStatus()
    await this.fetchData()
  },
  async mounted() {
    //this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
.table-container {
  margin-top: 10px;
}
.custom-table {
  button {
    i {
      font-size: 12px;
    }
  }
}
.custom-remark {
  white-space: nowrap !important;
  text-overflow: ellipsis !important;
}

.btn-link:hover {
  color: var(--base-color) !important;
  text-decoration: none !important;
}
.image-container {
  //height: 100px;
  //width: 150px;
}
.expnad-table-container {
  .p-datatable thead th {
    background-color: var(--base-color) !important;
    color: #ffffff;
    //font-weight: bold;
  }
}
.col-btn-container {
  display: flex;
  justify-content: center;
}
.status-container {
  //width: 100%;
}
</style>
