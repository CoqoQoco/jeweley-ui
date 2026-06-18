<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle :title="$t('view.sale.stockReservation.searchTitle')" :isShowBtnClose="false" />

        <div class="form-col-container">
          <!-- Search Type -->
          <div>
            <span class="title-text">{{ $t('view.sale.stockReservation.searchType') }}</span>
            <DropdownGeneric
              v-model="formSearch.searchType"
              :options="searchTypeOptions"
              optionLabel="name"
              optionValue="value"
              :placeholder="$t('view.sale.stockReservation.placeholder.searchType')"
              @update:modelValue="onSearchTypeChange"
            />
          </div>

          <!-- Sale Order Number (when searchType = saleOrder) -->
          <div v-if="formSearch.searchType === 'saleOrder'">
            <span class="title-text">{{ $t('view.sale.stockReservation.soNumber') }}</span>
            <InputTextGeneric
              v-model="formSearch.saleOrderNumber"
              type="text"
              placeholder="SO-2025-001"
              :trim="true"
              @keyup.enter="onSearch"
            />
          </div>

          <!-- Product Number (when searchType = product) -->
          <div v-if="formSearch.searchType === 'product'">
            <span class="title-text">{{ $t('view.sale.stockReservation.productNumber') }}</span>
            <InputTextGeneric
              v-model="formSearch.productNumber"
              type="text"
              placeholder="R08X50XXXL หรือ DK-2502-001"
              :trim="true"
              @keyup.enter="onSearch"
            />
          </div>

          <!-- Customer Name (when searchType = customer) -->
          <div v-if="formSearch.searchType === 'customer'">
            <span class="title-text">{{ $t('view.sale.stockReservation.customerName') }}</span>
            <InputTextGeneric
              v-model="formSearch.customerName"
              type="text"
              :placeholder="$t('view.sale.stockReservation.customerName')"
              :trim="true"
              @keyup.enter="onSearch"
            />
          </div>
        </div>

        <div class="btn-submit-container-between">
          <div>
            <button
              class="btn btn-sm btn-green"
              type="button"
              @click="openSaleOrderModal"
              :title="$t('view.sale.stockReservation.selectSaleOrder')"
            >
              <i class="bi bi-list-ul mr-1"></i>
              {{ $t('view.sale.stockReservation.selectSaleOrder') }}
            </button>
            <button
              class="btn btn-sm btn-outline-main ml-2"
              type="button"
              @click="viewReservations"
              :title="$t('view.sale.stockReservation.viewAllList')"
            >
              <i class="bi bi-bookmark-check mr-1"></i>
              {{ $t('view.sale.stockReservation.listLabel') }}
            </button>
          </div>
          <div>
            <button class="btn btn-sm btn-green" type="submit" :title="$t('common.btn.search')">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="clearSearch" :title="$t('common.btn.clear')">
              <i class="bi bi-x-circle"></i>
            </button>
          </div>
        </div>

        <!-- Search Results Info -->
        <div v-if="searchResultInfo" class="mt-2">
          <small class="text-muted">
            <i class="bi bi-info-circle mr-1"></i>{{ searchResultInfo }}
          </small>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

export default {
  name: 'SearchView',

  components: {
    DropdownGeneric,
    pageTitle,
    InputTextGeneric
  },

  emits: ['update:modelForm', 'search'],

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      formSearch: {
        searchType: 'saleOrder',
        saleOrderNumber: '',
        productNumber: '',
        customerName: ''
      },

      searchResultInfo: null
    }
  },

  computed: {
    searchTypeOptions() {
      return [
        { name: this.$t('view.sale.stockReservation.typeBySONumber'), value: 'saleOrder' },
        { name: this.$t('view.sale.stockReservation.typeByProduct'), value: 'product' },
        { name: this.$t('view.sale.stockReservation.typeByCustomer'), value: 'customer' }
      ]
    }
  },

  watch: {
    modelForm: {
      handler(newVal) {
        if (newVal) {
          this.formSearch = { ...this.formSearch, ...newVal }
        }
      },
      deep: true,
      immediate: true
    },

    formSearch: {
      handler(newVal) {
        this.$emit('update:modelForm', newVal)
      },
      deep: true
    }
  },

  methods: {
    onSearchTypeChange() {
      this.formSearch.saleOrderNumber = ''
      this.formSearch.productNumber = ''
      this.formSearch.customerName = ''
      this.searchResultInfo = null
    },

    onSearch() {
      const searchData = { ...this.formSearch }

      if (searchData.searchType === 'saleOrder' && !searchData.saleOrderNumber.trim()) {
        this.searchResultInfo = this.$t('view.sale.stockReservation.enterSoNumber')
        return
      }

      if (searchData.searchType === 'product' && !searchData.productNumber.trim()) {
        this.searchResultInfo = this.$t('view.sale.stockReservation.enterProductNumber')
        return
      }

      if (searchData.searchType === 'customer' && !searchData.customerName.trim()) {
        this.searchResultInfo = this.$t('view.sale.stockReservation.enterCustomerName')
        return
      }

      this.searchResultInfo = null
      this.$emit('search', searchData)
    },

    openSaleOrderModal() {
      this.$emit('search', {
        ...this.formSearch,
        openModal: true
      })
    },

    viewReservations() {
      this.$emit('search', {
        ...this.formSearch,
        viewAllReservations: true
      })
    },

    clearSearch() {
      this.formSearch = {
        searchType: 'saleOrder',
        saleOrderNumber: '',
        productNumber: '',
        customerName: ''
      }
      this.searchResultInfo = null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
