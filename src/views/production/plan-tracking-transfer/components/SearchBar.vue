<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle title="ติดตามการ โอนงาน/รับงาน, โอนสินค้า" :isShowBtnClose="false">
          </pageTitle>
        </div>

        <div class="form-col-container">
          <!-- date -->
          <div>
            <span class="title-text">วันที่โอนงาน/สินค้า</span>
            <div class="flex-group">
              <Calendar
                class="w-100"
                v-model="form.start"
                :max-date="form.end"
                showIcon
                placeholder="เริ่มต้น"
                dateFormat="dd/mm/yy"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <Calendar
                class="w-100"
                v-model="form.end"
                :min-date="form.start"
                showIcon
                placeholder="สิ้นสุด"
                dateFormat="dd/mm/yy"
              />
            </div>
          </div>

          <div class="form-col-container">
            <div>
              <span class="title-text">แผนก โอนงาน-รับงาน</span>
              <div>
                <div class="flex-group">
                  <Dropdown
                    v-model="form.statusFormer"
                    :options="planStatus"
                    optionLabel="nameTh"
                    optionValue="id"
                    class="w-full md:w-14rem"
                  />
                  <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                  <Dropdown
                    v-model="form.statusTarget"
                    :options="planStatus"
                    optionLabel="nameTh"
                    optionValue="id"
                    class="w-full md:w-14rem"
                  />
                </div>
              </div>
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
              <!-- wo text -->
              <div>
                <span class="title-text">เลขที่ W.O.</span>
                <div class="input-group input-group-inner">
                  <input
                    ref="inputText"
                    id="inputText"
                    :class="['form-control bg-input']"
                    type="text"
                    v-model.trim="form.woText"
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
                <span class="title-text">เเม่พิมพ์</span>
                <input :class="['form-control bg-input']" type="text" v-model.trim="form.mold" />
              </div>

              <!-- product type -->
              <div>
                <span class="title-text">ประเภทสินค้า</span>
                <div>
                  <MultiSelect
                    v-model="form.productType"
                    :options="productType"
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
                  v-model.trim="form.productNumber"
                />
              </div>

              <!-- gold -->
              <div>
                <span class="title-text">สีของทอง/เงิน</span>
                <div>
                  <MultiSelect
                    v-model="form.gold"
                    :options="gold"
                    optionLabel="nameTh"
                    optionValue="nameEn"
                    class="w-full md:w-14rem"
                  />
                </div>
              </div>

              <!-- gold size -->
              <div>
                <span class="title-text">ประเภททอง/เงิน</span>
                <div>
                  <MultiSelect
                    v-model="form.goldSize"
                    :options="goldSize"
                    optionLabel="nameTh"
                    optionValue="nameEn"
                    class="w-full md:w-14rem"
                  />
                </div>
              </div>
            </div>
          </template>
        </dialogView>

        <div class="btn-submit-container-between">
          <div>
            <!-- <button
              :class="['btn btn-sm', this.isTransfer ? 'btn-secondary' : 'btn-green']"
              type="button"
              :disabled="isTransfer"
              title="โอนงาน"
            >
              <span><i class="bi bi-arrow-left-right"></i></span>
            </button> -->
          </div>
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
                { 'btn-secondary': !planSearchStore.dataTransferTotalRecord > 0 }
              ]"
              type="button"
              :disabled="!planSearchStore.dataTransferTotalRecord > 0"
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

//import Calendar from 'primevue/calendar'
import MultiSelect from 'primevue/multiselect'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'

import { mapState } from 'pinia'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usePlanUpdateApiStore } from '@/stores/modules/api/plan-update-store.js'
//import api from '@/axios/axios-helper.js'

const interfaceIsShow = {
  dialog: false
}
export default {
  components: {
    pageTitle,
    MultiSelect,
    Calendar,
    Dropdown,
    dialogView
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    masterPlanStatus: {
      type: Array,
      default: () => []
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
  computed: {
    isExportData() {
      return true
    },

    ...mapState(useMasterApiStore, [
      'planStatus',
      'gold',
      'goldSize',
      'customerType',
      'productType',
      'overPlanOptions'
    ])
  },
  data() {
    return {
      isLoading: false,
      form: { ...this.modelForm },
      isShow: { ...interfaceIsShow }
    }
  },

  setup() {
    const planSearchStore = usePlanUpdateApiStore()
    return { planSearchStore }
  },

  methods: {
    // ---------------- event
    onSearch() {
      console.log('onSubmit')
      this.$emit('search', this.form)
    },
    onExport() {
      console.log('onExport')
      this.$emit('export')
    },
    dialogSearch() {
      this.isShow.dialog = false
      this.$emit('search', this.form)
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
    this.$nextTick(() => {})
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
