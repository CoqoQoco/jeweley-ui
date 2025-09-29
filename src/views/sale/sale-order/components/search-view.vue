<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle
            title="Sale Order"
            description="สร้างใบสั่งขายจากใบเสนอราคา พร้อมจัดการข้อมูลการขายและการส่งมอบ"
            :isShowBtnClose="false"
          />
        </div>

        <div class="form-col-container">
          <!-- quotation search -->
          <div>
            <span class="title-text">เลขที่ใบเสนอราคา</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="formQuotation.Number"
              placeholder="EX: QUO-2025-001"
            />
          </div>

          <!-- product search -->
          <div>
            <span class="title-text">เลขที่ผลิต (ใหม่)</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="form.stockNumber"
              placeholder="EX: DK-2502-001"
            />
          </div>

          <div>
            <span class="title-text">เลขที่ผลิต (เก่า)</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="form.stockNumberOrigin"
              placeholder="EX: AD05401"
            />
          </div>

          <div>
            <span class="title-text">รหัสสินค้า</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="form.productNumber"
              placeholder="EX: R08R50001L"
            />
          </div>
        </div>

        <div class="btn-submit-container-between">
          <div>
            <!-- quotation search button -->
            <button
              class="btn btn-sm btn-success mr-2"
              type="button"
              @click="onSearchQuotation"
              title="ค้นหาใบเสนอราคา"
            >
              <span><i class="bi bi-file-earmark-text"></i></span>
              <span class="ml-2">ใบเสนอราคา</span>
            </button>
          </div>
          <div>
            <!-- product search button -->
            <button class="btn btn-sm btn-main mr-2" type="submit" title="ค้นหาสินค้า">
              <span><i class="bi bi-search"></i></span>
              <span class="ml-2">ค้นหาสินค้า</span>
            </button>

            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" title="ล้าง">
              <span><i class="bi bi-x-circle"></i></span>
              <span class="ml-2">ล้าง</span>
            </button>
          </div>
        </div>
      </div>
    </form>

    <!-- Quotation Search Modal -->
    <QuotationSearchModal
      :isShow="isShowQuotationModal"
      @closeModal="closeQuotationModal"
      @select="onQuotationSelected"
    />
  </div>
</template>

<script>
import pageTitle from '@/components/custom/PageTitle.vue'
import QuotationSearchModal from '../modal/quotation-search-modal.vue'

export default {
  name: 'SaleOrderSearchView',

  components: {
    pageTitle,
    QuotationSearchModal
  },

  emits: ['search', 'searchQuotation', 'clear', 'update:modelForm', 'update:quotation'],

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    quotation: {
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
    },
    quotation: {
      handler(val) {
        this.formQuotation = { ...val }
      },
      deep: true
    }
  },

  data() {
    return {
      form: { ...this.modelForm },
      formQuotation: { ...this.quotation },
      isShowQuotationModal: false
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },

    onSearchQuotation() {
      this.isShowQuotationModal = true
    },

    closeQuotationModal() {
      this.isShowQuotationModal = false
    },

    onQuotationSelected(quotation) {
      this.formQuotation.Number = quotation.number
      this.$emit('searchQuotation', this.formQuotation)
      this.closeQuotationModal()
    },

    onClear() {
      this.formQuotation.Number = null
      this.$emit('clear')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>