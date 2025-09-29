<template>
  <div class="card-container">
    <div class="card-header">
      <h6 class="mb-0">ค้นหาข้อมูล</h6>
    </div>
    <div class="card-body">
      <div class="form-col-container">
        <!-- Search Type -->
        <div>
          <span class="title-text">ประเภทการค้นหา</span>
          <Dropdown
            v-model="formSearch.searchType"
            :options="searchTypeOptions"
            optionLabel="name"
            optionValue="value"
            placeholder="เลือกประเภทการค้นหา"
            class="w-100"
            @change="onSearchTypeChange"
          />
        </div>

        <!-- Sale Order Number (when searchType = saleOrder) -->
        <div v-if="formSearch.searchType === 'saleOrder'">
          <span class="title-text">เลขที่ใบสั่งขาย</span>
          <div class="input-group">
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="formSearch.saleOrderNumber"
              placeholder="SO-2025-001"
              @keyup.enter="onSearch"
            />
            <div class="input-group-append">
              <button
                class="btn btn-success"
                type="button"
                @click="onSearch"
                title="ค้นหาใบสั่งขาย"
              >
                <i class="bi bi-receipt mr-1"></i>
                ใบสั่งขาย
              </button>
            </div>
          </div>
        </div>

        <!-- Product Number (when searchType = product) -->
        <div v-if="formSearch.searchType === 'product'">
          <span class="title-text">รหัสสินค้า</span>
          <div class="input-group">
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="formSearch.productNumber"
              placeholder="R08X50XXXL หรือ DK-2502-001"
              @keyup.enter="onSearch"
            />
            <div class="input-group-append">
              <button
                class="btn btn-primary"
                type="button"
                @click="onSearch"
                title="ค้นหาสินค้า"
              >
                <i class="bi bi-search mr-1"></i>
                ค้นหา
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div>
          <span class="title-text">การดำเนินการ</span>
          <div class="btn-group" role="group">
            <button
              class="btn btn-outline-info"
              type="button"
              @click="openSaleOrderModal"
              title="เลือกจากรายการใบสั่งขาย"
            >
              <i class="bi bi-list-ul mr-1"></i>
              เลือกใบสั่งขาย
            </button>
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="clearSearch"
              title="ล้างข้อมูลการค้นหา"
            >
              <i class="bi bi-arrow-clockwise mr-1"></i>
              ล้างข้อมูล
            </button>
          </div>
        </div>
      </div>

      <!-- Search Results Info -->
      <div v-if="searchResultInfo" class="alert alert-info mt-3" role="alert">
        <i class="bi bi-info-circle mr-2"></i>
        {{ searchResultInfo }}
      </div>
    </div>
  </div>
</template>

<script>
import Dropdown from 'primevue/dropdown'

export default {
  name: 'SearchView',

  components: {
    Dropdown
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
        productNumber: ''
      },

      searchTypeOptions: [
        { name: 'ใบสั่งขาย', value: 'saleOrder' },
        { name: 'รหัสสินค้า', value: 'product' }
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
      // Clear search fields when type changes
      this.formSearch.saleOrderNumber = ''
      this.formSearch.productNumber = ''
      this.searchResultInfo = null
    },

    onSearch() {
      const searchData = { ...this.formSearch }
      
      // Validate search input
      if (searchData.searchType === 'saleOrder' && !searchData.saleOrderNumber.trim()) {
        this.searchResultInfo = 'กรุณากรอกเลขที่ใบสั่งขาย'
        return
      }
      
      if (searchData.searchType === 'product' && !searchData.productNumber.trim()) {
        this.searchResultInfo = 'กรุณากรอกรหัสสินค้า'
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

    clearSearch() {
      this.formSearch = {
        searchType: 'saleOrder',
        saleOrderNumber: '',
        productNumber: ''
      }
      this.searchResultInfo = null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.card-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0.75rem 1rem;
  border-radius: 8px 8px 0 0;
}

.card-body {
  padding: 1rem;
}

.input-group {
  display: flex;
  
  .form-control {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.input-group-append {
  .btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: 0;
  }
}

.btn-group {
  display: flex;
  
  .btn:not(:last-child) {
    margin-right: 0.5rem;
  }
}

.alert {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  
  &.alert-info {
    color: #0c5460;
    background-color: #d1ecf1;
    border-color: #bee5eb;
  }
}

.mr-1 {
  margin-right: 0.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mt-3 {
  margin-top: 1rem;
}

.mb-0 {
  margin-bottom: 0;
}
</style>