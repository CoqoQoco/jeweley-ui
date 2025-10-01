<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle
            title="Sale Order"
            description="สร้างใบสั่งขายจากใบเสนอราคา พร้อมจัดการข้อมูลการขายและการส่งมอบ"
            :isShowBtnClose="false"
            :isShowRightSlot="true"
          >
            <template #rightSlot>
              <button
                class="btn btn-sm btn-green mr-2"
                type="button"
                @click="onSearchQuotation"
                title="ค้นหาใบเสนอราคา"
              >
                <span><i class="bi bi-file-earmark-text"></i></span>
                <span class="ml-2">ค้นหาใบเสนอราคา</span>
              </button>
            </template>
          </pageTitle>
        </div>

        <!-- <div class="form-col-container">
          <div>
            <span class="title-text">เลขที่ใบเสนอราคา</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="formQuotation.Number"
              placeholder="EX: QUO-2025-001"
            />
          </div>
        </div> -->

        <!-- <div class="btn-submit-container">
          <button
            class="btn btn-sm btn-success mr-2"
            type="button"
            @click="onSearchQuotation"
            title="ค้นหาใบเสนอราคา"
          >
            <span><i class="bi bi-file-earmark-text"></i></span>
            <span class="ml-2">ค้นหาใบเสนอราคา</span>
          </button>

          <button
            class="btn btn-sm btn-main mr-2"
            type="button"
            @click="onConvertQuotation"
            title="Convert ใบเสนอราคาเป็น Sale Order"
            :disabled="!formQuotation.Number"
          >
            <span><i class="bi bi-arrow-right-circle"></i></span>
            <span class="ml-2">Convert เป็น Sale Order</span>
          </button>

          <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" title="ล้าง">
            <span><i class="bi bi-x-circle"></i></span>
            <span class="ml-2">ล้าง</span>
          </button>
        </div> -->
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

  emits: ['convertQuotation', 'clear', 'update:quotation'],

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
    onConvertQuotation() {
      if (this.formQuotation.Number) {
        this.$emit('convertQuotation', this.formQuotation)
      }
    },

    onSearchQuotation() {
      this.isShowQuotationModal = true
    },

    closeQuotationModal() {
      this.isShowQuotationModal = false
    },

    onQuotationSelected(quotation) {
      this.formQuotation.Number = quotation.number
      this.$emit('convertQuotation', this.formQuotation)
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
