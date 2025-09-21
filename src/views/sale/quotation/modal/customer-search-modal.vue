<template>
  <modal :showModal="isShowModal" @closeModal="onCancel" width="900px">
    <template v-slot:content>
      <div class="p-3">
        <div class="title-text-lg mb-3">
          <span><i class="bi bi-search mr-2"></i></span>
          <span>ค้นหาลูกค้า</span>
        </div>

        <!-- Search Form -->
        <div class="mb-3">
          <form @submit.prevent="onSearch">
            <div class="form-group">
              <div class="d-flex">
                <input
                  id="searchInput"
                  v-model.trim="searchForm.text"
                  type="text"
                  class="form-control"
                  placeholder="ชื่อลูกค้า, รหัสลูกค้า..."
                  style="flex: 1"
                />
                <button class="btn btn-sm btn-main ml-2 mt-1" type="submit">
                  <i class="bi bi-search"></i>
                </button>
                <button class="btn btn-sm btn-dark ml-2 mt-1" type="button" @click="onClearSearch">
                  <i class="bi bi-x-circle"></i>
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Customer Table -->
        <div class="customer-table-container" style="max-height: 400px; overflow-y: auto">
          <BaseDataTable
            :items="customerData.data"
            :totalRecords="customerData.total"
            :columns="columns"
            :perPage="take"
            :scrollHeight="'320px'"
            @page="handlePageChange"
            @sort="handleSortChange"
          >
            <template #actionTemplate="{ data }">
              <div class="text-center">
                <button
                  class="btn btn-sm btn-green"
                  @click="onSelectCustomer(data)"
                  title="เลือกลูกค้า"
                >
                  <i class="bi bi-check-circle"></i>
                  <span class="ml-1">เลือก</span>
                </button>
              </div>
            </template>
          </BaseDataTable>
        </div>

        <div class="d-flex justify-content-end mt-4">
          <button class="btn btn-sm btn-dark" @click="onCancel">
            <span><i class="bi bi-x-circle"></i></span>
            <span class="ml-2">ยกเลิก</span>
          </button>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { useCustomerDetailApiStore } from '@/stores/modules/api/customer/customer-detail-store.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

const interfaceSearchForm = {
  text: null
}

export default {
  name: 'CustomerSearchModal',

  components: {
    modal,
    BaseDataTable
  },

  props: {
    showModal: { type: Boolean, default: false }
  },

  emits: ['closeModal', 'customerSelected'],

  setup() {
    const customerStore = useCustomerDetailApiStore()
    return { customerStore }
  },

  data() {
    return {
      isShowModal: this.showModal,
      searchForm: { ...interfaceSearchForm },
      customerData: { data: [], total: 0 },
      take: 10,
      skip: 0,
      sort: [],

      // Columns Configuration for Customer Table
      columns: [
        {
          field: 'action',
          header: '',
          width: '100px',
          sortable: false
        },
        {
          field: 'code',
          header: 'รหัส',
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'nameTh',
          header: 'ชื่อ (TH)',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'nameEn',
          header: 'ชื่อ (EN)',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'address',
          header: 'ที่อยู่',
          sortable: true,
          minWidth: '200px'
        },
        {
          field: 'telephone1',
          header: 'โทรศัพท์',
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'email',
          header: 'E-mail',
          sortable: true,
          minWidth: '150px'
        }
      ]
    }
  },

  watch: {
    showModal(val) {
      this.isShowModal = val
      if (val) {
        this.resetForm()
        this.fetchCustomerData()
      }
    },
    isShowModal(val) {
      if (!val) this.$emit('closeModal')
    }
  },

  methods: {
    async onSearch() {
      this.take = 10
      this.skip = 0
      await this.fetchCustomerData()
    },

    onClearSearch() {
      this.searchForm = { ...interfaceSearchForm }
      this.resetPagination()
      this.fetchCustomerData()
    },

    onSelectCustomer(customerData) {
      this.$emit('customerSelected', customerData)
      this.isShowModal = false
    },

    onCancel() {
      this.isShowModal = false
    },

    resetForm() {
      this.searchForm = { ...interfaceSearchForm }
      this.resetPagination()
    },

    resetPagination() {
      this.take = 10
      this.skip = 0
      this.sort = []
    },

    // Data table handlers
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchCustomerData()
    },

    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => ({
        field: item.field,
        dir: item.order === 1 ? 'asc' : 'desc'
      }))
      this.fetchCustomerData()
    },

    // API Methods
    async fetchCustomerData() {
      try {
        this.customerData = await this.customerStore.fetchCustomerSearch({
          take: this.take,
          skip: this.skip,
          sort: this.sort,
          formValue: this.searchForm
        })
      } catch (error) {
        console.error('Error fetching customer data:', error)
        this.customerData = { data: [], total: 0 }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.title-text-lg {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--base-font-color);
  display: flex;
  align-items: center;
}

.customer-table-container {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.btn {
  display: inline-flex;
  align-items: center;
}

.btn i {
  font-size: 0.875rem;
}
</style>
