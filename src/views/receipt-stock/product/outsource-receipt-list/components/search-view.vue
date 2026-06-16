<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle title="ค้นหารับสินค้างานนอก" :isShowBtnClose="false" />

        <div class="form-col-container">
          <!-- Receipt date range -->
          <div>
            <span class="title-text">วันที่รับสินค้า</span>
            <div class="flex-group">
              <Calendar
                class="w-100"
                v-model="form.receiptDateStart"
                :max-date="form.receiptDateEnd"
                showIcon
                :manualInput="true"
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
          </div>

          <!-- Vendor -->
          <div>
            <span class="title-text">ผู้ขาย</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.vendor"
              placeholder="ชื่อผู้ขาย / ร้านงานนอก"
            />
          </div>

          <!-- PO Number -->
          <div>
            <span class="title-text">เลขที่ PO</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.poNumber"
              placeholder="เลขที่ใบสั่งซื้อ"
            />
          </div>

          <!-- Product Type -->
          <div>
            <span class="title-text">ประเภทสินค้า</span>
            <MultiSelect
              v-model="form.productType"
              :options="masterProductType"
              optionLabel="description"
              optionValue="code"
              class="w-full"
              placeholder="ทั้งหมด"
            />
          </div>

          <!-- Stock Number -->
          <div>
            <span class="title-text">รหัสสต็อก</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.stockNumber"
              placeholder="เลขที่สต็อก"
            />
          </div>

          <!-- Product Number -->
          <div>
            <span class="title-text">รหัสสินค้า</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.productNumber"
              placeholder="EX: R08X50XXXL"
            />
          </div>

          <!-- Product Name -->
          <div>
            <span class="title-text">ชื่อสินค้า</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.productNameEn"
              placeholder="ชื่อสินค้า"
            />
          </div>

          <!-- Size -->
          <div>
            <span class="title-text">ขนาด</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.size"
              placeholder="EX: #66"
            />
          </div>
        </div>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <button class="btn btn-sm btn-main" type="submit" title="ค้นหา">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="onClear" title="ล้าง">
              <i class="bi bi-x-circle"></i>
            </button>
            <button
              :class="[
                'btn btn-sm btn-primary ml-2',
                { 'btn-secondary': !receiptOutsourceStore.dataReceiptHistory.total > 0 }
              ]"
              type="button"
              :disabled="!receiptOutsourceStore.dataReceiptHistory.total > 0"
              @click="onExport"
              title="Export Excel"
            >
              <i class="bi bi-filetype-csv"></i>
            </button>
            <button
              class="btn btn-sm btn-main ml-2"
              type="button"
              @click="$router.push({ name: 'goods-receipt-outsource-create' })"
              title="รับสินค้างานนอก"
            >
              <i class="bi bi-plus"></i> รับสินค้างานนอก
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import MultiSelect from 'primevue/multiselect'
import Calendar from 'primevue/calendar'

import { useReceiptOutsourceApiStore } from '@/stores/modules/api/receipt/receipt-outsource-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

export default {
  name: 'search-view',

  components: {
    pageTitle,
    MultiSelect,
    Calendar
  },

  setup() {
    const receiptOutsourceStore = useReceiptOutsourceApiStore()
    const masterStore = useMasterApiStore()
    return { receiptOutsourceStore, masterStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['search', 'clear', 'export'],

  computed: {
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
      form: { ...this.modelForm }
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onExport() {
      this.$emit('export', this.form)
    },
    onClear() {
      this.$emit('clear')
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
