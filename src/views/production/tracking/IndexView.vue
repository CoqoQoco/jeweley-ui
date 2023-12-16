<template>
  <div class="app-container">
    <form @submit.prevent="onSearch">
      <div class="filter-container">
        <div>
          <pageTitle
            title="ค้นหาใบจ่าย-รับคืนงาน"
            description="หน้าติดตามข้อมูลการผลิต เเละรายละเอียดต่างๆ"
            :isShowBtnClose="false"
          >
          </pageTitle>
        </div>
        <div class="search-bar-container">
          <div>
            <span class="text-titel">วันที่สร้างใบจ่าย-รับคืน</span>
            <div class="flex-group">
              <Calendar
                class="w-100"
                v-model="search.start"
                :max-date="search.end"
                showIcon
                placeholder="เริ่มต้น"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <Calendar
                class="w-100"
                v-model="search.end"
                :min-date="search.start"
                showIcon
                placeholder="สิ้นสุด"
              />
            </div>
          </div>
          <div>
            <span class="text-titel">คำค้นหา</span>
            <div class="input-group input-group-inner">
              <input
                ref="inputText"
                id="inputText"
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="search.text"
                placeholder="พิมพ์บางอย่างเพื่อค้นหา"
              />
              <div class="input-group-append" @click="focusInputText">
                <span class="input-group-text">
                  <i class="bi bi-upc-scan text-main-color"></i>
                </span>
              </div>
            </div>
          </div>
          <div class="btn-container">
            <button class="btn btn-sm btn-main mr-2" type="submit">
              <span><i class="bi bi-search"></i></span>
              <span class="ml-2">ค้นหา</span>
            </button>
            <button class="btn btn-sm btn-dark" type="button" @click="onClear">
              <span><i class="bi bi-x-circle"></i></span>
              <span class="ml-2">ล้างค้นหา</span>
            </button>
          </div>
        </div>
      </div>
    </form>
    <tableMain v-model:formValue="formSearch"></tableMain>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import Calendar from 'primevue/calendar'
import tableMain from './components/TableMainView.vue'
export default {
  components: {
    tableMain,
    pageTitle,
    Calendar
  },
  data() {
    return {
      id: '',
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
    // ------- controler --------------- //
    focusInputText() {
      this.$refs.inputText.focus()
    },

    // ----- push ----- ///
    onView(item) {
      console.log(item)
      this.$router.push(`pickinglist-tag/${item.wo}-${item.woNumber}`)
    },

    // ----- Api -----//
    onSearch() {
      this.formSearch = { ...this.search }
    },
    onClear() {
      this.search = {
        start: null,
        end: null,
        text: null
      }
    }
  },
  mounted() {
    const url = window.location.href
    this.id = url.split('/').slice(-1)[0]

    if (this.id && this.id !== 'plan-order-tracking') {
      //console.log(this.id)
      this.search = {
        start: null,
        end: null,
        text: this.id
      }
      this.formSearch = { ...this.search }
      console.log(this.formSearch)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/search-bar.scss';

.search-bar-container {
  display: grid;
  grid-template-columns: 400px 350px auto;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
