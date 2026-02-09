<template>
  <div class="filter-container-searchBar">
    <pageTitle
      title="รายการใบสั่งขาย"
      description="แสดงรายการใบสั่งขายทั้งหมด พร้อมฟีเจอร์ค้นหาและกรองข้อมูล"
      :isShowBtnClose="false"
    />
    
    <form @submit.prevent="onSearch">
      <div class="form-col-container">
        <!-- so number -->
        <div>
          <span class="title-text">เลขที่ใบสั่งขาย</span>
          <input
            :class="['form-control bg-input']"
            type="text"
            v-model.trim="form.soNumber"
            placeholder="EX: SO-2025-001"
          />
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
            <!-- customer name -->
            <div>
              <span class="title-text">ชื่อลูกค้า</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.customerName"
                placeholder="ชื่อลูกค้า"
              />
            </div>

            <!-- ref quotation -->
            <div>
              <span class="title-text">อ้างอิงใบเสนอราคา</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.refQuotation"
                placeholder="เลขที่ใบเสนอราคา"
              />
            </div>

            <!-- currency -->
            <div>
              <span class="title-text">สกุลเงิน</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.currencyUnit"
                placeholder="EX: USD, THB"
              />
            </div>

            <!-- create by -->
            <div>
              <span class="title-text">ผู้สร้าง</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.createBy"
                placeholder="ชื่อผู้สร้าง"
              />
            </div>
          </div>

          <div class="form-col-container mt-2">
            <!-- create date -->
            <div>
              <span class="title-text">วันที่สร้าง</span>
              <div class="flex-group">
                <Calendar
                  class="w-100"
                  v-model="form.createDateStart"
                  :max-date="form.createDateEnd"
                  showIcon
                  :manualInput="false"
                  placeholder="เริ่มต้น"
                  dateFormat="dd/mm/yy"
                />
                <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                <Calendar
                  class="w-100"
                  v-model="form.createDateEnd"
                  :min-date="form.createDateStart"
                  showIcon
                  :manualInput="false"
                  placeholder="สิ้นสุด"
                  dateFormat="dd/mm/yy"
                />
              </div>
            </div>

            <!-- delivery date -->
            <div>
              <span class="title-text">วันที่จัดส่ง</span>
              <div class="flex-group">
                <Calendar
                  class="w-100"
                  v-model="form.deliveryDateStart"
                  :max-date="form.deliveryDateEnd"
                  showIcon
                  :manualInput="false"
                  placeholder="เริ่มต้น"
                  dateFormat="dd/mm/yy"
                />
                <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                <Calendar
                  class="w-100"
                  v-model="form.deliveryDateEnd"
                  :min-date="form.deliveryDateStart"
                  showIcon
                  :manualInput="false"
                  placeholder="สิ้นสุด"
                  dateFormat="dd/mm/yy"
                />
              </div>
            </div>
          </div>
        </template>
      </dialogView>

      <div class="btn-submit-container">
        <button class="btn btn-sm btn-main mr-2" type="submit" title="ค้นหา">
          <span><i class="bi bi-search"></i></span>
        </button>
        <button
          class="btn btn-sm btn-sub-main mr-2"
          type="button"
          title="เพิ่มเติม"
          @click="onShowDialog"
        >
          <span><i class="bi bi-zoom-in"></i></span>
        </button>
        <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" title="ล้าง">
          <span><i class="bi bi-x-circle"></i></span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import Calendar from 'primevue/calendar'
import pageTitle from '@/components/custom/PageTitle.vue'

const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

const interfaceIsShow = {
  dialog: false
}

export default {
  name: 'SaleOrderListSearchView',

  components: {
    Calendar,
    pageTitle,
    dialogView
  },

  emits: ['search', 'clear', 'update:modelForm'],

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

  data() {
    return {
      form: { ...this.modelForm },
      isShow: { ...interfaceIsShow }
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },

    dialogSearch() {
      this.isShow.dialog = false
      this.$emit('search', this.form)
    },

    onClear() {
      this.$emit('clear')
    },

    onShowDialog() {
      this.isShow.dialog = true
    },

    closeDialog() {
      this.isShow.dialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>