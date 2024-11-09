<template>
  <div class="app-container">
    <pageTitle
      title="เเก้ไขปรับปรุง-เพิ่ม ข้อมูลพลอย"
      description="หน้าเเก้ไขปรับปรุง-เพิ่ม ข้อมูลพลอย เเละรายละเอียดต่างๆ"
      :isShowBtnClose="false"
    >
    </pageTitle>
    <form @submit.prevent="onSearch">
      <div class="filter-container">
        <!-- first row -->
        <div class="row form-group">
          <div class="col-md-8">
            <label>คำค้นหา</label>
            <input
              type="text"
              style="width: 30rem"
              class="form-control"
              placeholder="คำค้นหา ... รหัส ชื่อไทย ชื่ออังกฤษ"
              v-model="search.text"
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
            <button class="btn btn-sm btn-warning" type="button" @click="showModalAddGem">
              <span class="mr-2"><i class="bi bi-gem"></i></span>
              <span>เพิ่มพลอย</span>
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
      @page="handlePageChange"
      :rows="take"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      :currentPageReportTemplate="`{first} to {last} of {totalRecords}`"
    >
      <Column style="width: 20px">
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
            <!-- <pdf class="btn btn-sm btn-info" :modelValue="slotProps.data"></pdf> -->
            <!-- <button class="btn btn-sm btn btn-main" @click="onDelete(slotProps.data)">
              <i class="bi bi-trash-fill"></i>
            </button> -->
            <button
              title="เเก้ไข"
              class="btn btn-sm btn btn-main"
              @click="onUpdate(slotProps.data)"
            >
              <i class="bi bi-brush"></i>
            </button>
          </div>
        </template>
      </Column>
      <Column field="code" header="รหัส" style="width: 100px">
        <template #body="slotProps">
          {{ slotProps.data.code }}
        </template>
      </Column>
      <Column field="nameTh" header="ชื่อไทย" style="width: 250px">
        <template #body="slotProps">
          {{ slotProps.data.nameTh }}
        </template>
      </Column>
      <Column field="nameEn" header="ชื่ออังกฤษ" style="width: 250px">
        <template #body="slotProps">
          {{ slotProps.data.nameEn }}
        </template>
      </Column>
      <!-- <Column header="วันสร้างข้อมูล" field="createDate">
        <template #body="prop">
          {{ formatDate(prop.data.createDate) }}
        </template>
      </Column> -->
    </DataTable>
    <modalAddGem
      :isShowModal="isShowModalAddGem"
      @closeModal="closeModalAddGem"
      @fetch="onSearchByAdd"
    ></modalAddGem>
    <modalUpdGem
      :isShowModal="isShowModalUpdGem"
      :modelMaster="dataUpd"
      @closeModal="closeModalAddGem"
      @fetch="onSearchByAdd"
    ></modalUpdGem>
  </div>
</template>

<script>

//prime table
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import api from '@/axios/axios-helper.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs'
import swAlert from '@/services/alert/sweetAlerts.js'

import modalAddGem from './components/ModalFormCreate.vue'
import modalUpdGem from './components/ModalFromUpdate.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
export default {
  components: {
    pageTitle,
    DataTable,
    Column,
    modalAddGem,
    modalUpdGem
  },
  data() {
    return {
      isLoading: false,
      isShowModalAddGem: false,
      isShowModalUpdGem: false,
      // table
      totalRecords: 0,
      take: 10, //all
      skip: 0,
      data: [],
      dataUpd: {},

      //search
      search: {
        text: null
      }
    }
  },
  methods: {
    handlePageChange(e) {
      //console.log('page change')
      console.log(e)
    },

    // ----- api -----//
    onDelete(e) {
      //console.log(e)
      swAlert.confirmSubmit(
        `${e.code} : ${e.nameTh}`,
        `ยืนยันลบพลอย`,
        async () => {
          //console.log('call submitPlan')
          await this.delete(e)
        },
        null,
        null
      )
    },
    async delete(e) {
      try {
        this.isLoading = true

        const param = {
          type: 'GEM',
          id: e.id,
          code: e.code
        }

        const res = await api.jewelry.post('Master/DeleteMasterModel', param)
        if (res) {
          //console.log(res)
          swAlert.success(
            ``,
            ``,
            async () => {
              await this.fetchMasterGem()
            },
            null,
            null
          )
          //this.onSearch()
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    onSearch() {
      this.fetchMasterGem()
    },
    onSearchByAdd() {
      this.isShowModalAddGem = false
      this.isShowModalUpdGem = false
      this.dataUpd = {}
      this.fetchMasterGem()
    },
    onUpdate(e) {
      this.dataUpd = { ...e }
      this.isShowModalUpdGem = true
    },
    // fetchData() {
    //   this.fetchMasterGem()
    // },
    onClear() {
      this.search = {
        text: null
      }
    },
    async fetchMasterGem() {
      try {
        this.isLoading = true

        const param = {
          search: {
            type: 'GEM',
            text: this.search.text ?? null
          }
        }

        const res = await api.jewelry.post('Master/SearchMaster', param)
        if (res) {
          //console.log(res)
          this.data = [...res]
          this.totalRecords = this.data.length
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    showModalAddGem() {
      this.isShowModalAddGem = true
    },
    closeModalAddGem() {
      this.isShowModalAddGem = false
      this.isShowModalUpdGem = false
      this.dataUpd = {}
    },

    // ------ helper ------//
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    }
  },
  created() {
    this.fetchMasterGem()
  }
}
</script>

<style lang="scss" scoped>
.custom-table {
  margin-top: 10px;
  button {
    i {
      font-size: 12px;
    }
  }
}
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
.col-btn-container {
  display: flex;
  justify-content: center;
}
</style>
