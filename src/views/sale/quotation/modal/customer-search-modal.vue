<template>
  <modal :showModal="isShowModal" @closeModal="onCancel" width="900px">
    <template v-slot:content>
      <div class="p-3">
        <div class="title-text-lg mb-3">
          <span><i class="bi bi-search mr-2"></i></span>
          <span>{{ $t('view.customer.searchTitle') }}</span>
        </div>

        <!-- Search Form -->
        <div class="mb-3">
          <form @submit.prevent="onSearch">
            <div class="form-group">
              <div class="d-flex">
                <div class="search-input-wrapper">
                  <InputTextGeneric
                    :modelValue="searchForm.text"
                    :trim="true"
                    :placeholder="$t('view.customer.placeholder.search')"
                    @update:modelValue="searchForm.text = $event"
                  />
                </div>
                <ButtonGeneric
                  variant="main"
                  icon="bi-search"
                  type="submit"
                  class="ml-2 mt-1"
                />
                <ButtonGeneric
                  variant="dark"
                  icon="bi-x-circle"
                  type="button"
                  class="ml-2 mt-1"
                  @click="onClearSearch"
                />
              </div>
            </div>
          </form>
        </div>

        <!-- Customer Table -->
        <div class="customer-table-container">
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
                <ButtonGeneric
                  variant="green"
                  icon="bi-check-circle"
                  :label="$t('common.btn.select')"
                  :title="$t('common.btn.select')"
                  @click="onSelectCustomer(data)"
                />
              </div>
            </template>
          </BaseDataTable>
        </div>

        <div class="d-flex justify-content-end mt-4">
          <ButtonGeneric
            variant="dark"
            icon="bi-x-circle"
            :label="$t('common.btn.cancel')"
            @click="onCancel"
          />
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import { useCustomerDetailApiStore } from '@/stores/modules/api/customer/customer-detail-store.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceSearchForm = {
  text: null
}

export default {
  name: 'CustomerSearchModal',

  components: {
    modal,
    BaseDataTable,
    InputTextGeneric,
    ButtonGeneric
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
      sort: []
    }
  },

  computed: {
    columns() {
      return [
        {
          field: 'action',
          header: '',
          width: '100px',
          sortable: false
        },
        {
          field: 'code',
          header: this.$t('common.field.code'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'nameTh',
          header: this.$t('common.field.nameTh'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'nameEn',
          header: this.$t('common.field.nameEn'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'address',
          header: this.$t('view.customer.field.address'),
          sortable: true,
          minWidth: '200px'
        },
        {
          field: 'telephone1',
          header: this.$t('common.field.phone'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'email',
          header: this.$t('view.customer.field.email'),
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

    async fetchCustomerData() {
      const result = await this.customerStore.fetchCustomerSearch({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.searchForm
      })
      if (result) {
        this.customerData = result
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.title-text-lg {
  font-size: var(--fs-lg);
  font-weight: bold;
  color: var(--base-font-color);
  display: flex;
  align-items: center;
}

.search-input-wrapper {
  flex: 1;
}

.customer-table-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-card-bg);
  max-height: 400px;
  overflow-y: auto;
}
</style>
