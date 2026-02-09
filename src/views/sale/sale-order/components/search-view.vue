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
