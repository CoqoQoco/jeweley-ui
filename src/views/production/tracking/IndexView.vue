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
            <span class="title-text">วันที่สถานะใบงาน</span>
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

        <dialogView
          :isShow="isShow.dialog"
          @closeDialog="closeDialog"
          @search="dialogSearch"
          txtHeader="ค้นหาเพิ่มเติม"
        >
          <template #content>
            <div class="form-col-container">
              <!-- text -->
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

              <!-- modld -->
              <div>
                <span class="title-text">รหัสลูกค้า</span>
                <input :class="['form-control bg-input']" type="text" v-model.trim="search.mold" />
              </div>

              <!-- status -->
              <div>
                <span class="title-text">สถานะงานผลิต</span>
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

              <!-- plan target -->
              <div>
                <span class="title-text">กำหนดส่งงาน</span>
                <Dropdown
                  v-model="search.isOverPlan"
                  :options="masterOverPlan"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                />
              </div>

              <!-- customer code -->
              <div>
                <span class="title-text">รหัสลูกค้า</span>
                <input
                  ref="inputText"
                  id="inputText"
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="search.customerCode"
                />
              </div>

              <!-- customer type -->
              <div>
                <span class="title-text">ประเภทลูกค้า</span>
                <div>
                  <MultiSelect
                    v-model="search.customerType"
                    :options="masterCustomer"
                    optionLabel="nameTh"
                    optionValue="code"
                    class="w-full md:w-14rem"
                  />
                </div>
              </div>

              <!-- product type -->
              <div>
                <span class="title-text">ประเภทสินค้า</span>
                <div>
                  <MultiSelect
                    v-model="search.productType"
                    :options="masterProduct"
                    optionLabel="nameTh"
                    optionValue="code"
                    class="w-full md:w-14rem"
                  />
                </div>
              </div>

              <!-- product number -->
              <div>
                <span class="title-text">รหัสสินค้า</span>
                <input
                  ref="inputText"
                  id="inputText"
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="search.productNumber"
                />
              </div>

              <!-- gold -->
              <div>
                <span class="title-text">ประเภททอง/เงิน</span>
                <div>
                  <MultiSelect
                    v-model="search.gold"
                    :options="masterGold"
                    optionLabel="nameTh"
                    optionValue="nameEn"
                    class="w-full md:w-14rem"
                  />
                </div>
              </div>

              <!-- gold size -->
              <div>
                <span class="title-text">ขนาดทอง/เงิน</span>
                <div>
                  <MultiSelect
                    v-model="search.goldSize"
                    :options="masterGoldSize"
                    optionLabel="nameTh"
                    optionValue="nameEn"
                    class="w-full md:w-14rem"
                  />
                </div>
              </div>
            </div>
          </template>
        </dialogView>

        <div class="btn-submit-container">
          <button class="btn btn-sm btn-main mr-2" type="submit" title="ค้นหา">
            <span><i class="bi bi-search"></i></span>
            <!-- <span>ค้นหา</span> -->
          </button>
          <button
            class="btn btn-sm btn-sub-main mr-2"
            type="button"
            title="เพิ่มเติม"
            @click="onShowDialog"
          >
            <span><i class="bi bi-zoom-in"></i></span>
            <!-- <span>ค้นหา</span> -->
          </button>
          <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" title="ล้าง">
            <span><i class="bi bi-x-circle"></i></span>
            <!-- <span>ล้าง</span> -->
          </button>
          <button
            :class="['btn btn-sm btn-primary', { 'btn-secondary': !isExportData }]"
            type="button"
            :disabled="!isExportData"
            @click="onExport"
          >
            <span><i class="bi bi-filetype-csv"></i></span>
          </button>
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
const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
//import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import tableMain from './components/DataTableView.vue'

import api from '@/axios/axios-config.js'

const interfaceIsShow = {
  dialog: false
}

const interfaceSearch = {
  start: new Date(new Date().setDate(new Date().getDate() - 7)),
  end: new Date(),
  sendStart: null,
  sendEnd: null,
  text: null,
  status: null,
  isOverPlan: { id: 0, description: 'ทั้งหมด' },
  customerCode: null,

  mold: null,
  customerType: null,
  productType: null,
  productNumber: null,
  gold: null,
  goldSize: null
}
export default {
  components: {
    tableMain,
    pageTitle,
    Calendar,
    MultiSelect,
    Dropdown,
    dialogView
  },
  data() {
    return {
      isShow: { ...interfaceIsShow },
      id: '',
      form: {},
      search: {
        ...interfaceSearch
      },
      formSearch: {},
      formExport: {},

      masterStatus: [],
      masterCustomer: [],
      masterProduct: [],
      masterGold: [],
      masterGoldSize: [],

      masterOverPlan: [
        { id: 0, description: 'ทั้งหมด' },
        { id: 1, description: 'เกินกำหนด' }
      ],
      isExport: true
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
    onShowDialog() {
      this.isShow.dialog = true
    },
    closeDialog() {
      this.isShow.dialog = false
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
    dialogSearch() {
      console.log(this.search)
      this.formSearch = { ...this.search }
      this.isShow.dialog = false
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
    },
    async fetchMasterGold() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGold')
        if (res) {
          this.masterGold = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterGoldSize() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGoldSize')
        if (res) {
          this.masterGoldSize = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterCustomerType() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterCustomerType')
        if (res) {
          this.masterCustomer = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterProductType() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterProductType')
        if (res) {
          this.masterProduct = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  },
  created() {
    this.$nextTick(() => {
      this.fetchMaterStatus()
      this.fetchMasterGold()
      this.fetchMasterGoldSize()
      this.fetchMasterCustomerType()
      this.fetchMasterProductType()
    })
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
@import '@/assets/scss/custom-style/standard-form.scss';

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
