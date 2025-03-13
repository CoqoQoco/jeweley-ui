<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle
            title="ตรวจคลัง"
            description="ตรวจสอบคลังสินค้า พิมพ์ป้าย หรือเเก้ไขข้อมูลสินค้า"
            :isShowBtnClose="false"
          >
          </pageTitle>
        </div>

        <div class="form-col-container">
          <!-- receipt date -->
          <!-- <div>
            <span class="title-text">วันที่รับสินค้า</span>
            <div class="flex-group">
              <Calendar
                class="w-100"
                v-model="form.receiptDateStart"
                :max-date="form.receiptDateEnd"
                showIcon
                :manualInput="false"
                placeholder="เริ่มต้น"
                dateFormat="dd/mm/yy"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <Calendar
                class="w-100"
                v-model="form.receiptDateEnd"
                :min-date="form.receiptDateStart"
                showIcon
                :manualInput="false"
                placeholder="สิ้นสุด"
                dateFormat="dd/mm/yy"
              />
            </div>
          </div> -->

          <div class="form-col-container">
            <!-- stock number -->
            <div>
              <span class="title-text">เลขที่ผลิต</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.stockNumber"
                placeholder="EX: DK-2502-00X"
              />
            </div>

            <!-- product number -->
            <div>
              <span class="title-text">รหัสสินค้า</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.productNumber"
                placeholder="EX: R08X50XXXL"
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
              <!-- receipt type -->
              <div>
                <span class="title-text">ประเภทงานรับ</span>
                <div>
                  <MultiSelect
                    v-model="form.receiptType"
                    :options="receiptTypeMaster"
                    optionLabel="description"
                    optionValue="value"
                    class="w-full md:w-14rem"
                  />
                </div>
              </div>

              <!-- mold -->
              <div>
                <span class="title-text">เเม่พิมพ์</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.mold"
                  placeholder="EX: CN-2400XX"
                />
              </div>

              <!-- productNameEn -->
              <div>
                <span class="title-text">ชื่อสินค้า EN</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.productNameEn"
                  placeholder="EX: Gold Ring #66"
                />
              </div>

              <!-- productNameTh -->
              <div>
                <span class="title-text">ชื่อสินค้า TH</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.productNameTh"
                  placeholder="EX: แหวนทอง ขนาด #66"
                />
              </div>

              <!-- woText -->
              <div>
                <span class="title-text">W.O.</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.woText"
                  placeholder="EX: 6802017XX"
                />
              </div>

              <!-- size -->
              <div>
                <span class="title-text">ขนาด</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.size"
                  placeholder="EX: #66"
                />
              </div>

              <!-- product type -->
              <div>
                <span class="title-text">ประเภทสินค้า</span>
                <div>
                  <MultiSelect
                    v-model="form.productType"
                    :options="masterProductType"
                    optionLabel="description"
                    optionValue="code"
                    class="w-full md:w-14rem"
                  />
                </div>
              </div>
            </div>
          </template>
        </dialogView>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
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
              :class="[
                'btn btn-sm btn-primary',
                { 'btn-secondary': !productStore.dataSearch.total > 0 }
              ]"
              type="button"
              :disabled="!productStore.dataSearch.total > 0"
              @click="onExport"
            >
              <span><i class="bi bi-filetype-csv"></i></span>
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

//import Calendar from 'primevue/calendar'
import MultiSelect from 'primevue/multiselect'
//import Calendar from 'primevue/calendar'
//import Dropdown from 'primevue/dropdown'

//import { usePlanSearchApiStore } from '@/stores/modules/api/plan-search-store.js'
//import api from '@/axios/axios-helper.js'

const interfaceIsShow = {
  dialog: false
}
export default {
  components: {
    pageTitle,
    MultiSelect,
    //Calendar,
    //Dropdown,
    dialogView
  },

  setup() {
    const productStore = usrStockProductApiStore()
    const masterStore = useMasterApiStore()
    return { productStore, masterStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    isExportData() {
      return true
    },
    masterProductType() {
      return this.masterStore.productType
    }
  },

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },

  data() {
    return {
      isLoading: false,
      form: { ...this.modelForm },
      isShow: { ...interfaceIsShow },
      receiptTypeMaster: [
        { value: 'production', description: 'Production' }
        // { value: 2, description: 'งานรับสินค้าและส่งสินค้า' }
      ]
    }
  },

  methods: {
    // ---------------- event
    onSearch() {
      //console.log('onSubmit')
      this.$emit('search', this.form)
    },
    onExport() {
      //console.log('onExport')
      this.$emit('export', this.form)
    },
    dialogSearch() {
      this.isShow.dialog = false
      this.$emit('search')
    },
    onSubmitExport() {
      this.$emit('export', true)
    },
    onClear() {
      this.$emit('clear')
    },
    onCloseModal() {
      this.isShow = { ...interfaceIsShow }
    },
    onShowDialog() {
      this.isShow.dialog = true
    },
    closeDialog() {
      this.isShow.dialog = false
    }
  },

  created() {
    this.$nextTick(async () => {
      await this.masterStore.fetchProductType()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
