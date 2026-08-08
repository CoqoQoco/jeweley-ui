<template>
  <modal :showModal="showModal" @closeModal="$emit('closeModal')" width="900px">
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.sale.materialSale.customerSearchModal.title') }}</span>
    </template>
    <template #content>
      <div class="p-3">
        <form class="mb-3" @submit.prevent="onSearch">
          <div class="d-flex">
            <div class="search-input-wrapper">
              <InputTextGeneric
                :modelValue="searchForm.text"
                :trim="true"
                icon="bi-search"
                :placeholder="$t('view.sale.materialSale.customerSearchModal.placeholderText')"
                @update:modelValue="searchForm.text = $event"
              />
            </div>
            <ButtonGeneric variant="main" icon="bi-search" type="submit" class="ml-2" />
            <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" @click="onClearSearch" />
          </div>
        </form>

        <div class="customer-table-container">
          <BaseDataTable
            :items="customerData.data"
            :totalRecords="customerData.total"
            :columns="columns"
            :perPage="take"
            :scrollHeight="'320px'"
            :emptyMessage="$t('view.sale.materialSale.customerSearchModal.noResult')"
            @page="handlePageChange"
            @sort="handleSortChange"
          >
            <template #actionTemplate="{ data }">
              <div class="text-center">
                <ButtonGeneric
                  variant="green"
                  icon="bi-check-circle"
                  :title="$t('common.btn.select')"
                  @click="onSelectCustomer(data)"
                />
              </div>
            </template>
          </BaseDataTable>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
// External dependencies
import { defineAsyncComponent } from 'vue'
import { useCustomerDetailApiStore } from '@/stores/modules/api/customer/customer-detail-store.js'

// Local components
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceSearchForm = {
  text: null
}

export default {
  name: 'MaterialSaleCustomerSearchModal',

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
        { field: 'action', header: '', width: '90px', sortable: false },
        { field: 'code', header: this.$t('view.sale.materialSale.customerSearchModal.colCode'), minWidth: '110px', sortable: true },
        { field: 'nameTh', header: this.$t('view.sale.materialSale.customerSearchModal.colNameTh'), minWidth: '150px', sortable: true },
        { field: 'address', header: this.$t('view.sale.materialSale.customerSearchModal.colAddress'), minWidth: '200px', sortable: false },
        { field: 'telephone1', header: this.$t('view.sale.materialSale.customerSearchModal.colTel'), minWidth: '120px', sortable: false },
        { field: 'taxId', header: this.$t('view.sale.materialSale.customerSearchModal.colTaxId'), minWidth: '130px', sortable: false }
      ]
    }
  },

  watch: {
    showModal(val) {
      if (val) {
        this.resetForm()
        this.fetchCustomerData()
      }
    }
  },

  methods: {
    onSearch() {
      this.skip = 0
      this.fetchCustomerData()
    },

    onClearSearch() {
      this.searchForm = { ...interfaceSearchForm }
      this.resetPagination()
      this.fetchCustomerData()
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
    },

    onSelectCustomer(customerData) {
      this.$emit('customerSelected', customerData)
      this.$emit('closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.search-input-wrapper {
  flex: 1;
}

.customer-table-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-card-bg);
}
</style>
