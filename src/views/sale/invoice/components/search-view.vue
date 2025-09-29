<template>
  <div class="search-section">
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
            />
          </div>

          <!-- Delivery Note Number -->
          <div v-if="formSearch.searchType === 'deliveryNote'">
            <span class="title-text">เลขที่ใบส่งของ</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="formSearch.deliveryNoteNumber"
              placeholder="DN-2025-001"
            />
          </div>

          <!-- Invoice Number -->
          <div v-if="formSearch.searchType === 'invoice'">
            <span class="title-text">เลขที่ใบแจ้งหนี้</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="formSearch.invoiceNumber"
              placeholder="INV-2025-001"
            />
          </div>

          <!-- Customer Name -->
          <div v-if="formSearch.searchType === 'customer'">
            <span class="title-text">ชื่อลูกค้า</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="formSearch.customerName"
              placeholder="ชื่อบริษัทหรือชื่อลูกค้า"
            />
          </div>

          <!-- Search Button -->
          <div class="d-flex align-items-end">
            <button
              class="btn btn-primary w-100"
              type="button"
              @click="handleSearch"
            >
              <i class="bi bi-search mr-1"></i>
              ค้นหา
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Dropdown from 'primevue/dropdown'

export default {
  name: 'InvoiceSearchView',

  components: {
    Dropdown
  },

  emits: ['search'],

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      formSearch: {
        searchType: 'deliveryNote',
        deliveryNoteNumber: '',
        invoiceNumber: '',
        customerName: ''
      },

      searchTypeOptions: [
        { name: 'ใบส่งของ', value: 'deliveryNote' },
        { name: 'ใบแจ้งหนี้', value: 'invoice' },
        { name: 'ลูกค้า', value: 'customer' }
      ]
    }
  },

  watch: {
    modelForm: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
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
    handleSearch() {
      this.$emit('search', this.formSearch)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.search-section {
  margin-bottom: 1.5rem;
}

.card-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0.75rem 1rem;
  border-radius: 8px 8px 0 0;

  h6 {
    color: #495057;
    font-weight: 600;
  }
}

.card-body {
  padding: 1rem;
}
</style>