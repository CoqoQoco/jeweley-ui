<template>
  <div class="app-container">
    <pageTitle
      title="ค้นหาใบจ่าย-รับคืนงาน"
      description="หน้าติดตามข้อมูลการผลิต เเละรายละเอียดต่างๆ"
      :isShowBtnClose="false"
    >
    </pageTitle>
    <form @submit.prevent="onSearch">
      <div class="filter-container">
        <!-- first row -->
        <div class="row form-group">
          <div class="col-md-4">
            <label>วันที่สร้างใบจ่าย-รับคืน</label>
            <div class="flex-group">
              <Calendar class="w-100" v-model="search.start" :max-date="search.end" showIcon />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <Calendar class="w-100" v-model="search.end" :min-date="search.start" showIcon />
            </div>
          </div>
          <div class="col-md-4">
            <label>คำค้นหา</label>
            <input
              type="text"
              class="form-control"
              placeholder="คำค้นหา ... เลขที่ WO, เเม่พิมพ์, รหัสสินค้า เป็นต้น"
              v-model="search.text"
            />
          </div>
          <div class="col-md-4 btn-container">
            <button class="btn btn-sm btn-main mr-2" type="submit">
              <span class="mr-2"><i class="bi bi-search"></i></span>
              <span>ค้นหา</span>
            </button>
            <button class="btn btn-sm btn-dark" type="button" @click="onClear">
              <span class="mr-2"><i class="bi bi-x-circle"></i></span>
              <span>ล้างค้นหา</span>
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
    <tableMainData v-model:formValue="formSearch"></tableMainData>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { formatDate, formatDateTime } from '@/utils/moment'
import Calendar from 'primevue/calendar'
//import tableMain from '@/components/table/HtmlTable.vue'
import tableMainData from './components/TableMain.vue'
//import pageTitle from '@/components/custom/PageTitle.vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
export default {
  components: { tableMainData, pageTitle, Calendar },
  data() {
    return {
      form: {},
      search: {
        start: null,
        end: null,
        text: null
      },
      formSearch: {}
    }
  },
  methods: {
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },

    // ----- push ----- ///
    onView(item) {
      console.log(item)
      this.$router.push(`pickinglist-tag/${item.wo}-${item.woNumber}`)
    },

    // ----- Api -----//
    onSearch() {
      //console.log(this.search)
      this.formSearch = { ...this.search }
    },
    onClear() {
      this.search = {
        start: null,
        end: null,
        text: null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
ทฟรื
.nodata-container {
  text-align: center;
  color: var(--base-sub-color);
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
</style>
