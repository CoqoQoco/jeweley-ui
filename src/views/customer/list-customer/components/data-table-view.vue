<template>
  <div class="mt-2">
    <BaseDataTable
      :items="data.data"
      :totalRecords="data.total"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 340px)'"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionTemplate="{ data: rowData }">
        <div class="vertical-center-container">
          <ButtonGeneric
            variant="main"
            icon="bi-brush"
            :title="$t('common.btn.edit')"
            @click="onUpdate(rowData)"
            :disabled="true"
          />
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useCustomerDetailApiStore } from '@/stores/modules/api/customer/customer-detail-store.js'

export default {
  name: 'customer-list-data-table',

  components: {
    BaseDataTable,
    ButtonGeneric
  },

  mixins: [dataTablePaging],

  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
      required: true
    },
    modelFormExport: {
      type: Object,
      default: () => ({})
    }
  },

  setup() {
    const customerStore = useCustomerDetailApiStore()
    return { customerStore }
  },

  data() {
    return {
      data: {}
    }
  },

  computed: {
    form() {
      return this.modelForm || {}
    },
    columns() {
      return [
        {
          field: 'action',
          header: '',
          width: '50px',
          sortable: false
        },
        {
          field: 'code',
          header: this.$t('common.field.code'),
          sortable: true,
          minWidth: '150px'
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
          field: 'productionPlanCount',
          header: this.$t('view.customer.field.productionPlanCount'),
          sortable: true,
          minWidth: '50px',
          format: 'number'
        },
        {
          field: '',
          header: this.$t('view.customer.field.saleCount'),
          sortable: true,
          minWidth: '50px',
          format: 'number'
        },
        {
          field: 'address',
          header: this.$t('view.customer.field.address'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'typeName',
          header: this.$t('common.field.type'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'telephone1',
          header: this.$t('view.customer.field.tel1'),
          sortable: true,
          minWidth: '100px'
        },
        {
          field: 'telephone2',
          header: this.$t('view.customer.field.tel2'),
          sortable: true,
          minWidth: '100px'
        },
        {
          field: 'email',
          header: this.$t('view.customer.field.email'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'contactName',
          header: this.$t('view.customer.field.contact'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'remark',
          header: this.$t('common.field.remark'),
          sortable: true,
          minWidth: '150px'
        }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    }
  },

  methods: {
    onUpdate(data) {
      // reserved for future edit functionality
      void data
    },

    async fetchData() {
      this.data = await this.customerStore.fetchCustomerSearch({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.form
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
