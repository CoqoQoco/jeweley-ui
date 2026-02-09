<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle
            title="ตรวจสอบสถานะงานผลิต"
            description="ตรวจสอบ ติดตาม การดำเนินงาน รับ-จ่ายงาน เเต่ละเเผนก"
            :isShowBtnClose="false"
          >
          </pageTitle>
        </div>

        <div class="form-col-container">
          <!-- receive date -->
          <div>
            <span class="title-text">วันที่รับโอนงาน</span>
            <div class="flex-group">
              <Calendar
                class="w-100"
                v-model="form.requestDateStart"
                :max-date="form.requestDateEnd"
                dateFormat="dd/mm/yy"
                :manualInput="false"
                showIcon
                placeholder="เริ่มต้น"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <Calendar
                class="w-100"
                v-model="form.requestDateEnd"
                :min-date="form.requestDateStart"
                dateFormat="dd/mm/yy"
                :manualInput="false"
                showIcon
                placeholder="สิ้นสุด"
              />
            </div>
          </div>

          <!-- receive work date -->
          <div>
            <span class="title-text">วันที่ช่างรับงาน</span>
            <div class="flex-group">
              <Calendar
                class="w-100"
                v-model="form.receiveWorkDateStart"
                :max-date="form.receiveWorkDateEnd"
                dateFormat="dd/mm/yy"
                showIcon
                placeholder="เริ่มต้น"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <Calendar
                class="w-100"
                v-model="form.receiveWorkDateEnd"
                :min-date="form.receiveWorkDateStart"
                dateFormat="dd/mm/yy"
                showIcon
                placeholder="สิ้นสุด"
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
              <!-- status -->
              <div>
                <span class="title-text">ประเภทงาน</span>
                <div>
                  <MultiSelect
                    v-model="form.status"
                    :options="masterApiStore.planStatus"
                    optionLabel="nameTh"
                    optionValue="id"
                    filter
                    class="w-full md:w-14rem"
                  />
                </div>
              </div>

              <!-- gold -->
              <div>
                <span class="title-text">ประเภททอง</span>
                <MultiSelect
                  v-model="form.gold"
                  :options="masterApiStore.gold"
                  filter
                  optionLabel="description"
                  optionValue="code"
                  class="w-full md:w-14rem"
                />
              </div>

              <!-- wo -->
              <div>
                <span class="title-text">เลขที่ใบงาน</span>
                <input :class="['form-control']" type="text" v-model.trim="form.wo" />
              </div>

              <!-- product no  -->
              <div>
                <span class="title-text">รหัสสินค้า</span>
                <input :class="['form-control']" type="text" v-model.trim="form.productNo" />
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
                { 'btn-secondary': !planStatusDetailStore.dataSearcTotalRecord > 0 }
              ]"
              type="button"
              :disabled="!planStatusDetailStore.dataSearcTotalRecord > 0"
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
//import Dropdown from 'primevue/dropdown'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usePlanStatusDetailApiStore } from '@/stores/modules/api/plan/plan-status-detail-store.js'
//import api from '@/axios/axios-helper.js'

const interfaceIsShow = {
  dialog: false
}
export default {
  components: {
    pageTitle,
    MultiSelect,
    Calendar,
    //Dropdown,
    dialogView
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({})
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
    }
  },
  data() {
    return {
      isLoading: false,
      form: { ...this.modelForm },
      isShow: { ...interfaceIsShow }
    }
  },

  setup() {
    const masterApiStore = useMasterApiStore()
    const planStatusDetailStore = usePlanStatusDetailApiStore()
    return { planStatusDetailStore, masterApiStore }
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
