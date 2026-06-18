<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle :title="$t('view.sale.deliveryNote.searchTitle')" :isShowBtnClose="false" />

        <div class="form-col-container">
          <!-- Search Type -->
          <div>
            <span class="title-text">{{ $t('view.sale.deliveryNote.searchType') }}</span>
            <DropdownGeneric
              v-model="formSearch.searchType"
              :options="searchTypeOptions"
              optionLabel="name"
              optionValue="value"
              :placeholder="$t('view.sale.deliveryNote.selectSearchType')"
              @update:modelValue="onSearchTypeChange"
            />
          </div>

          <!-- Sale Order Number -->
          <div v-if="formSearch.searchType === 'saleOrder'">
            <span class="title-text">{{ $t('view.sale.deliveryNote.soNumber') }}</span>
            <InputTextGeneric
              v-model.trim="formSearch.saleOrderNumber"
              placeholder="SO-2025-001"
              @keyup.enter="onSearch"
            />
          </div>

          <!-- Delivery Note Number -->
          <div v-if="formSearch.searchType === 'deliveryNote'">
            <span class="title-text">{{ $t('view.sale.deliveryNote.dnNumber') }}</span>
            <InputTextGeneric
              v-model.trim="formSearch.deliveryNoteNumber"
              placeholder="DN-2025-001"
              @keyup.enter="onSearch"
            />
          </div>

          <!-- Customer Name -->
          <div v-if="formSearch.searchType === 'customer'">
            <span class="title-text">{{ $t('view.sale.deliveryNote.customerName') }}</span>
            <InputTextGeneric
              v-model.trim="formSearch.customerName"
              :placeholder="$t('view.sale.deliveryNote.customerName')"
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
              :title="$t('view.sale.deliveryNote.selectSaleOrder')"
            >
              <i class="bi bi-list-ul mr-1"></i>
              {{ $t('view.sale.deliveryNote.selectSaleOrder') }}
            </button>
            <button
              class="btn btn-sm btn-outline-main ml-2"
              type="button"
              @click="viewDeliveries"
              :title="$t('view.sale.deliveryNote.viewAllList')"
            >
              <i class="bi bi-truck mr-1"></i>
              {{ $t('view.sale.deliveryNote.listLabel') }}
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
    InputTextGeneric,
    pageTitle
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
        deliveryNoteNumber: '',
        customerName: ''
      },

      searchResultInfo: null
    }
  },

  computed: {
    searchTypeOptions() {
      return [
        { name: this.$t('view.sale.deliveryNote.typeBySONumber'), value: 'saleOrder' },
        { name: this.$t('view.sale.deliveryNote.typeByDNNumber'), value: 'deliveryNote' },
        { name: this.$t('view.sale.deliveryNote.typeByCustomer'), value: 'customer' }
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
      this.formSearch.deliveryNoteNumber = ''
      this.formSearch.customerName = ''
      this.searchResultInfo = null
    },

    onSearch() {
      const searchData = { ...this.formSearch }

      if (searchData.searchType === 'saleOrder' && !searchData.saleOrderNumber.trim()) {
        this.searchResultInfo = this.$t('view.sale.deliveryNote.enterSoNumber')
        return
      }

      if (searchData.searchType === 'deliveryNote' && !searchData.deliveryNoteNumber.trim()) {
        this.searchResultInfo = this.$t('view.sale.deliveryNote.enterDnNumber')
        return
      }

      if (searchData.searchType === 'customer' && !searchData.customerName.trim()) {
        this.searchResultInfo = this.$t('view.sale.deliveryNote.enterCustomerName')
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

    viewDeliveries() {
      this.$emit('search', {
        ...this.formSearch,
        viewAllDeliveries: true
      })
    },

    clearSearch() {
      this.formSearch = {
        searchType: 'saleOrder',
        saleOrderNumber: '',
        deliveryNoteNumber: '',
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
