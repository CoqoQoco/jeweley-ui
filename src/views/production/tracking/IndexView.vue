<template>
  <div class="app-container">
    <form @submit.prevent="onSearch">
      <div class="filter-container-searchBar">
        <div>
          <pageTitle title="ค้นหาใบจ่าย-รับคืนงาน" :isShowBtnClose="false"> </pageTitle>
        </div>
        <div class="form-col-container">
          <div>
            <span class="title-text">วันที่สร้างใบจ่าย-รับคืน</span>
            <div class="flex-group">
              <Calendar
                class="w-100"
                v-model="search.start"
                :max-date="search.end"
                showIcon
                placeholder="เริ่มต้น"
                dateFormat="dd/mm/yy"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <Calendar
                class="w-100"
                v-model="search.end"
                :min-date="search.start"
                showIcon
                placeholder="สิ้นสุด"
                dateFormat="dd/mm/yy"
              />
            </div>
          </div>
          <div>
            <span class="title-text">วันที่ส่งงาน</span>
            <div class="flex-group">
              <Calendar
                class="w-100"
                v-model="search.sendStart"
                :max-date="search.sendEnd"
                showIcon
                placeholder="เริ่มต้น"
                dateFormat="dd/mm/yy"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <Calendar
                class="w-100"
                v-model="search.sendEnd"
                :min-date="search.sendStart"
                showIcon
                placeholder="สิ้นสุด"
                dateFormat="dd/mm/yy"
              />
            </div>
          </div>
        </div>
        <div class="form-col-container">
          <div>
            <span class="title-text">คำค้นหา</span>
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
          <div>
            <span class="title-text">สถานะงานผลิต</span>
            <!-- <Dropdown
              v-model="search.status"
              :options="masterStatus"
              optionLabel="nameTh"
              optionValue="id"
              placeholder="เลือกสถานะงาน"
              class="w-full md:w-14rem"
            /> -->
            <div>
              <MultiSelect
                v-model="search.status"
                :options="masterStatus"
                optionLabel="nameTh"
                optionValue="id"
                class="w-full md:w-14rem"
              />
            </div>
            <!-- <small v-if="val.isValStatus" class="p-error">Status is required.</small> -->
          </div>
          <div>
            <span class="title-text">กำหนดส่งงาน</span>
            <Dropdown
              v-model="search.isOverPlan"
              :options="masterOverPlan"
              optionLabel="description"
              class="w-full md:w-14rem"
            />
          </div>
          <div class="btn-submit-container-no-line">
            <button class="btn btn-sm btn-main mr-2" type="submit">
              <span><i class="bi bi-search"></i></span>
              <!-- <span class="ml-2">ค้นหา</span> -->
            </button>
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear">
              <span><i class="bi bi-x-circle"></i></span>
              <!-- <span class="ml-2">ล้าง</span> -->
            </button>
            <button
              :class="['btn btn-sm btn-primary', { 'btn-secondary': !isExportData }]"
              type="button"
              :disabled="!isExportData"
              @click="onExport"
            >
              <span><i class="bi bi-filetype-csv"></i></span>
              <!-- <span class="ml-2">ออกเอกสาร</span> -->
            </button>
          </div>
        </div>
        
      </div>
    </form>
    <tableMain
      v-model:formValue="formSearch"
      v-model:formValueExport="formExport"
      v-model:masterStatusValue="masterStatus"
    ></tableMain>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
//import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import tableMain from './components/TableMainView.vue'

import api from '@/axios/axios-config.js'

const interfaceSearch = {
  start: new Date(new Date().setDate(new Date().getDate() - 7)),
  end: new Date(),
  sendStart: null,
  sendEnd: null,
  text: null,
  status: null,
  isOverPlan: { id: 0, description: 'ทั้งหมด' }
}
export default {
  components: {
    tableMain,
    pageTitle,
    Calendar,
    MultiSelect,
    Dropdown
  },
  data() {
    return {
      id: '',
      form: {},
      search: {
        ...interfaceSearch
      },
      formSearch: {},
      formExport: {},
      masterStatus: [],
      masterOverPlan: [
        { id: 0, description: 'ทั้งหมด' },
        { id: 1, description: 'เกินกำหนด' }
      ],
      isExport: true,
      //previuosDay: 7,
    }
  },
  computed: {
    isExportData() {
      return this.isExport
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
      console.log(this.search)
      this.formSearch = { ...this.search }
    },
    onExport() {
      console.log(this.search)
      this.formExport = { ...this.search }
    },
    onClear() {
      this.search = {
        ...interfaceSearch
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
    }
  },
  created() {
    this.fetchMaterStatus()
    //this.fetchData()
    //this.formSearch = { ...this.search }
  },
  mounted() {
    const url = window.location.href
    this.id = url.split('/').slice(-1)[0]

    if (this.id && this.id !== 'plan-order-tracking') {
      //console.log(this.id)
      this.search = {
        start: null,
        end: null,
        //start: null,
        //end: null,
        sendStart: null,
        sendEnd: null,
        status: null,
        isOverPlan: { id: 0, description: 'ทั้งหมด' },
        text: this.id
      }
      //this.formSearch = { ...this.search }
      console.log(this.formSearch)
    }

    this.formSearch = { ...this.search }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar.scss';
//@import '@/assets/scss/custom-style/standard-form.scss';

.search-bar-container {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 2fr;
  gap: 10px;
  //margin-bottom: 10px;
}
.search-bar-custom-container {
  display: grid;
  grid-template-columns: 6fr 2fr;
  gap: 10px;
}
</style>
