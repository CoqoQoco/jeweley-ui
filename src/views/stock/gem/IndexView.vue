<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <pageTitle
      title="คลังวัตถุดิบพลอย"
      description="ข้อมูลคลังวัตถุดิบพลอย เเละรายละเอียดต่างๆ"
      :isShowBtnClose="false"
    >
    </pageTitle>
    <form @submit.prevent="onSearch">
      <div class="search-bar-container">
        <!-- first row -->
        <div>
          <span class="text-title">คำค้นหา</span>
          <input
            type="text"
            style="width: 30rem"
            class="form-control"
            placeholder="คำค้นหา ... รหัส ขนาด รูปร่าง เกรด หรือ รายละเอียด"
            v-model="search.text"
          />
        </div>
        <div class="btn-container">
          <button class="btn btn-sm btn-main mr-2" type="submit">
            <span class="mr-2"><i class="bi bi-search"></i></span>
            <span>ค้นหา</span>
          </button>
          <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear">
            <span class="mr-2"><i class="bi bi-x-circle"></i></span>
            <span>ล้างค้นหา</span>
          </button>
        </div>
      </div>
    </form>
    <div class="mt-2">
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
        showGridlines
        :paginator="true"
        :lazy="true"
        @page="handlePageChange"
        @sort="handlePageChangeSort"
        :rows="take"
        removableSort
        sortMode="multiple"
        :rowsPerPageOptions="[10, 20, 50, 100]"
        paginatorTemplate="FirstPageLink PrevPageLink  CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
        :currentPageReportTemplate="`เเสดงข้อมูล {first} - {last} จากทั้งหมด {totalRecords} รายการ`"
      >
        <!-- <Column style="width: 20px">
        <template #body="slotProps">
          <div class="col-btn-container">
            <button
              title="เเก้ไข"
              class="btn btn-sm btn btn-main"
              @click="onUpdate(slotProps.data)"
            >
              <i class="bi bi-brush"></i>
            </button>
          </div>
        </template>
      </Column> -->
        <Column field="name" header="พลอย" style="min-width: 150px"> </Column>
        <Column field="code" header="รหัส" style="min-width: 150px"> </Column>
        <Column field="description" header="รายละเอียด" style="min-width: 150px"> </Column>
        <Column field="size" header="ขนาด" style="min-width: 150px"> </Column>
        <Column field="shape" header="รูปร่าง" style="min-width: 150px"> </Column>
        <Column field="grade" header="เกรด" style="min-width: 150px"> </Column>
        <Column field="price" header="ราคา" style="min-width: 150px">
          <template #body="slotProps">
            {{
              slotProps.data.price
                ? Number(slotProps.data.price).toFixed(2).toLocaleString()
                : '0.00'
            }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

//prime table
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import api from '@/axios/axios-config.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs'
//import swAlert from '@/services/alert/sweetAlerts.js'

//import modalAddGem from './components/ModalFormCreate.vue'
//import modalUpdGem from './components/ModalFromUpdate.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
export default {
  components: {
    pageTitle,
    DataTable,
    Column,
    loading
  },
  data() {
    return {
      isLoading: false,

      // table
      totalRecords: 0,
      take: 10, //all
      skip: 0,
      sort: [],
      data: [],
      expnadData: [],

      //search
      search: {
        text: null
      }
    }
  },
  methods: {
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
      //console.log(e.multiSortMeta)
      this.fetchData()
    },

    onSearch() {
      this.fetchData()
    },
    onSearchByAdd() {
      this.isShowModalAddGem = false
      this.isShowModalUpdGem = false
      this.dataUpd = {}
      this.fetchData()
    },
    onClear() {
      this.search = {
        text: null
      }
    },
    async fetchData() {
      try {
        this.isLoading = true

        const param = {
          search: {
            text: this.search.text ?? null
          }
        }

        const res = await api.jewelry.post('GemStock/SearchData', param)
        if (res) {
          //console.log(res)
          this.data = { ...res }
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
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
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/search-bar.scss';
@import '@/assets/scss/custom-style/table-data.scss';

.search-bar-container {
  display: grid;
  grid-template-columns: 2fr 2fr;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
