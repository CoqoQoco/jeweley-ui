<template>
  <modal :showModal="showModal" @closeModal="$emit('closeModal')" width="900px">
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.sale.billingNote.selectCustomerTitle') }}</span>
    </template>
    <template #content>
      <div class="p-3">
        <div class="mb-3">
          <div class="search-input-wrapper">
            <InputTextGeneric
              :modelValue="searchText"
              :trim="true"
              icon="bi-search"
              :placeholder="$t('common.field.name')"
              @update:modelValue="searchText = $event"
            />
          </div>
        </div>

        <div class="customer-table-container">
          <BaseDataTable
            :items="filteredCustomers"
            :totalRecords="filteredCustomers.length"
            :columns="columns"
            :perPage="10"
            :paginator="true"
            :emptyMessage="$t('view.sale.billingNote.noAvailableCustomer')"
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
import { useBillingNoteApiStore } from '@/stores/modules/api/sale/billing-note-store.js'

// Local components
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'BillingNoteCustomerSelectModal',

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
    const billingNoteStore = useBillingNoteApiStore()
    return { billingNoteStore }
  },

  data() {
    return {
      searchText: '',
      customers: []
    }
  },

  computed: {
    columns() {
      return [
        { field: 'customerCode', header: this.$t('common.field.code'), sortable: true, minWidth: '120px' },
        { field: 'customerName', header: this.$t('common.field.name'), sortable: true, minWidth: '200px' },
        {
          field: 'invoiceCount',
          header: this.$t('view.sale.billingNote.availableBillCount'),
          sortable: true,
          align: 'right',
          minWidth: '150px'
        },
        { field: 'action', header: '', width: '100px', sortable: false }
      ]
    },

    filteredCustomers() {
      const keyword = (this.searchText || '').trim().toLowerCase()
      if (!keyword) return this.customers

      return this.customers.filter((c) => {
        return (
          (c.customerName || '').toLowerCase().includes(keyword) ||
          (c.customerCode || '').toLowerCase().includes(keyword)
        )
      })
    }
  },

  watch: {
    showModal(val) {
      if (val) {
        this.searchText = ''
        this.fetchCustomers()
      }
    }
  },

  methods: {
    async fetchCustomers() {
      const res = await this.billingNoteStore.fetchAvailableCustomers()
      this.customers = res || []
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
  max-width: 400px;
}

.customer-table-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-card-bg);
}
</style>
