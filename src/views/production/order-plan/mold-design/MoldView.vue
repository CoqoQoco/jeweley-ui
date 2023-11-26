<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <pageTitle
      title="ออกเเบบ สร้างเเม่พิมพ์"
      description="ข้อมูลออกเเบบ สร้างเเม่พิมพ์ เเละรายละเอียดต่างๆ"
      :isShowBtnClose="false"
      isShowRightSlot
    >
      <!-- <template v-slot:rightSlot>
        <div class="mr-2 p-1 w-50 text-center bg-dark text-white" style="height: 31px" disable>
          สถานะ : {{ statusName }}
        </div>
        <pdf class="btn btn-sm btn-info w-50" :modelValue="data" :matValue="mat"></pdf>
      </template> -->
    </pageTitle>
    <form @submit.prevent="onSearch">
      <div class="filter-container mb-3">
        <!-- first row -->
        <div class="row form-group">
          <div class="col-md-8">
            <label>คำค้นหา</label>
            <input
              type="text"
              style="width: 30rem"
              class="form-control"
              placeholder="คำค้นหา ... รหัส ประเภท รายละเอียด"
              v-model="form.text"
            />
          </div>
          <div class="col-md-4 btn-container">
            <button class="btn btn-sm btn-main mr-2" type="submit">
              <span class="mr-2"><i class="bi bi-search"></i></span>
              <span>ค้นหา</span>
            </button>
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear">
              <span class="mr-2"><i class="bi bi-x-circle"></i></span>
              <span>ล้างค้นหา</span>
            </button>
            <button class="btn btn-sm btn-warning" type="button" @click="showModalAddMold">
              <span class="mr-2"><i class="bi bi-gem"></i></span>
              <span>สร้างเเม่พิมพ์</span>
            </button>
          </div>
        </div>
        <!-- <div class="row form-group">
          <div class="col-md-12 btn-container">
            <button class="btn btn-sm btn-main mr-2">
              <span class="mr-2"><i class="bi bi-search"></i></span>
              <span>ค้นหา</span>
            </button>
            <button class="btn btn-sm btn-dark">
              <span class="mr-2"><i class="bi bi-x-circle"></i></span>
              <span>ล้างคำค้นหา</span>
            </button>
          </div>
        </div> -->
      </div>
    </form>
    <DataTable
      :totalRecords="totalRecords"
      :value="data"
      dataKey="id"
      class="p-datatable-sm custom-table"
      scrollable
      scrollHeight="calc(100vh - 320px)"
      columnResizeMode="expand"
      resizableColumns
      :paginator="true"
      :lazy="true"
      @page="handlePageChange"
      :rows="take"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      :currentPageReportTemplate="`{first} to {last} of {totalRecords}`"
    >
      <!-- <Column expander style="width: 10px" /> -->
      <!-- <Column style="width: 200px">
        <template #body="slotProps">
          <div class="col-btn-container">
            <button class="btn btn-sm btn btn-main" @click="viewplan(slotProps.data)">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </template>
      </Column> -->
      <Column header="รหัส" field="code" style="width: 200px"></Column>
      <Column header="ประเภท" field="category" style="width: 200px"></Column>
      <Column field="tbtProductionPlanImage" header="รูปเเม่พิมพ์" style="width: 300px">
        <template #body="slotProps">
          <div class="image-container">
            <loading :isLoading="isLoadingImage"></loading>
            <!-- <img :src="fetchIamge(slotProps)" alt="Preview Image" /> -->
            <imagePreview :imageName="slotProps.data.image" type="MOLD"></imagePreview>
          </div>
        </template>
      </Column>
      <Column header="รายละเอียด" field="description"></Column>
    </DataTable>
    <modalCreate
      :isShowModal="isShowModalAddMold"
      @closeModal="closeModalCreate"
      @fetch="fetchDataByCreate"
    >
    </modalCreate>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

//import DataView from 'primevue/dataview'
//import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions'
//import Card from 'primevue/card'
import api from '@/axios/axios-config.js'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

import modalCreate from './components/ModalCreate.vue'
export default {
  components: {
    pageTitle,
    loading,
    modalCreate,
    //DataView,
    //DataViewLayoutOptions
    //Card
    imagePreview,
    DataTable,
    Column
  },
  data() {
    return {
      isLoading: false,
      isShowModalAddMold: false,
      isLoadingImage: false,
      form: {
        text: null
      },

      //data grid
      totalRecords: 0,
      take: 10, //0 all
      skip: 0,
      data: [],

      layout: 'grid',
      width: 200,
      height: 200
    }
  },
  methods: {
    // ------ internal -------- //
    onClear() {
      this.form = {
        text: null
      }
    },
    handlePageChange(e) {
      //console.log('page change')
      //console.log(e)

      this.skip = e.first
      this.take = e.rows
      this.fetchData()
    },
    // ------ modalAddMold ------- //
    showModalAddMold() {
      this.isShowModalAddMold = true
    },
    closeModalCreate() {
      this.isShowModalAddMold = false
    },
    fetchDataByCreate() {
      this.isShowModalAddMold = false
      this.fetchData()
    },
    // ------ api -------- //
    onSearch() {
      this.fetchData()
    },
    async fetchData() {
      try {
        this.isLoading = true

        const param = {
          take: this.take,
          skip: this.skip,
          search: {
            text: this.form.text ?? null
          }
        }

        const res = await api.jewelry.post('Mold/SearchMold', param)
        if (res) {
          //console.log(res)
          this.data = [...res.data]
          this.totalRecords = res.total
          //console.log(this.totalRecords)
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  },
  created() {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  border: 1px solid #dddddd;
  border-radius: 5px;

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  //background-color: var(--base-color);
  padding: 10px;
}
.flex-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn-container {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  margin-top: 10px;
}
label {
  margin-bottom: 0px;
  font-size: 12px;
  font-weight: 700;
  color: var(--base-font-color);
}
.card-item-container {
  display: flex;
  justify-content: space-between;
  //align-items: center;
}
.col-btn-container {
  display: flex;
  justify-content: center;
}
</style>
