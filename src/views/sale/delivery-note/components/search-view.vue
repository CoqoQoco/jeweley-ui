<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle title="ค้นหาใบส่งของ" :isShowBtnClose="false" />

        <div class="form-col-container">
          <!-- Search Type -->
          <div>
            <span class="title-text">ประเภทการค้นหา</span>
            <DropdownGeneric
              v-model="formSearch.searchType"
              :options="searchTypeOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="เลือกประเภทการค้นหา"
              @update:modelValue="onSearchTypeChange"
            />
          </div>

          <!-- Sale Order Number -->
          <div v-if="formSearch.searchType === 'saleOrder'">
            <span class="title-text">เลขที่ใบสั่งขาย</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="formSearch.saleOrderNumber"
              placeholder="SO-2025-001"
              @keyup.enter="onSearch"
            />
          </div>

          <!-- Delivery Note Number -->
          <div v-if="formSearch.searchType === 'deliveryNote'">
            <span class="title-text">เลขที่ใบส่งของ</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="formSearch.deliveryNoteNumber"
              placeholder="DN-2025-001"
              @keyup.enter="onSearch"
            />
          </div>

          <!-- Customer Name -->
          <div v-if="formSearch.searchType === 'customer'">
            <span class="title-text">ชื่อลูกค้า</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="formSearch.customerName"
              placeholder="ชื่อลูกค้า"
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
              title="เลือกจากรายการใบสั่งขาย"
            >
              <i class="bi bi-list-ul mr-1"></i>
              เลือกใบสั่งขาย
            </button>
            <button
              class="btn btn-sm btn-outline-main ml-2"
              type="button"
              @click="viewDeliveries"
              title="ดูรายการส่งของทั้งหมด"
            >
              <i class="bi bi-truck mr-1"></i>
              รายการส่งของ
            </button>
          </div>
          <div>
            <button class="btn btn-sm btn-green" type="submit" title="ค้นหา">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="clearSearch" title="ล้างข้อมูล">
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

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

export default {
  name: 'SearchView',

  components: {
    DropdownGeneric,
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

      searchTypeOptions: [
        { name: 'ใบสั่งขาย', value: 'saleOrder' },
        { name: 'ใบส่งของ', value: 'deliveryNote' },
        { name: 'ลูกค้า', value: 'customer' }
      ],

      searchResultInfo: null
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
        this.searchResultInfo = 'กรุณากรอกเลขที่ใบสั่งขาย'
        return
      }

      if (searchData.searchType === 'deliveryNote' && !searchData.deliveryNoteNumber.trim()) {
        this.searchResultInfo = 'กรุณากรอกเลขที่ใบส่งของ'
        return
      }

      if (searchData.searchType === 'customer' && !searchData.customerName.trim()) {
        this.searchResultInfo = 'กรุณากรอกชื่อลูกค้า'
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
