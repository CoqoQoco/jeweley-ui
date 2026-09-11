<template>
  <div class="mt-2">
    <BaseDataTable
      :items="saleChannelStore.dataSearch.data"
      :totalRecords="saleChannelStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      dataKey="code"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <ButtonGeneric variant="green" icon="bi-pencil" :title="$t('common.btn.edit')" @click="onEdit(data)" />
          <ButtonGeneric variant="red" icon="bi-trash" class="ml-2" :title="$t('common.btn.delete')" @click="onDelete(data)" />
        </div>
      </template>

      <template #typeTemplate="{ data }">
        <span>{{ getTypeLabel(data.type) }}</span>
      </template>

      <template #venueTemplate="{ data }">
        <span>{{ data.venue || '-' }}</span>
      </template>

      <template #dateRangeTemplate="{ data }">
        <span>{{ formatDateRange(data) }}</span>
      </template>

      <template #isDefaultTemplate="{ data }">
        <span :class="data.isDefault ? 'badge-yes' : 'badge-no'">
          {{ data.isDefault ? $t('view.master.saleChannel.label.yes') : $t('view.master.saleChannel.label.no') }}
        </span>
      </template>

      <template #isActiveTemplate="{ data }">
        <span :class="data.isActive ? 'badge-active' : 'badge-inactive'">
          {{ data.isActive ? $t('view.master.saleChannel.status.active') : $t('view.master.saleChannel.status.inactive') }}
        </span>
      </template>
    </BaseDataTable>

    <upsertView
      :isShow="isShowUpsert"
      :modelData="dataEdit"
      @closeModal="onCloseModal"
      @fetch="fetchDataByUpsert"
    />
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import upsertView from '../modal/upsert-view.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useSaleChannelMasterStore } from '@/stores/modules/api/master/sale-channel-store.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'
import { formatDate } from '@/services/utils/dayjs.js'

export default {
  name: 'SaleChannelDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable,
    ButtonGeneric,
    upsertView
  },

  setup() {
    const saleChannelStore = useSaleChannelMasterStore()
    return { saleChannelStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    triggerCreate: {
      type: Boolean,
      default: false
    }
  },

  emits: ['createHandled'],

  computed: {
    typeOptions() {
      return [
        { value: 'SHOP', label: this.$t('view.master.saleChannel.type.shop') },
        { value: 'FAIR', label: this.$t('view.master.saleChannel.type.fair') },
        { value: 'ONLINE', label: this.$t('view.master.saleChannel.type.online') },
        { value: 'EXPORT', label: this.$t('view.master.saleChannel.type.export') },
        { value: 'OTHER', label: this.$t('view.master.saleChannel.type.other') }
      ]
    },
    columns() {
      return [
        { field: 'action', header: '', sortable: false, width: '100px' },
        { field: 'code', header: this.$t('common.field.code'), sortable: true, minWidth: '110px' },
        { field: 'nameTh', header: this.$t('common.field.name'), sortable: true, minWidth: '160px' },
        { field: 'type', header: this.$t('common.field.type'), sortable: false, minWidth: '110px' },
        { field: 'venue', header: this.$t('view.master.saleChannel.field.venue'), sortable: false, minWidth: '140px' },
        { field: 'dateRange', header: this.$t('view.master.saleChannel.field.dateRange'), sortable: false, minWidth: '180px' },
        { field: 'isDefault', header: this.$t('view.master.saleChannel.field.isDefault'), sortable: false, minWidth: '90px', align: 'center' },
        { field: 'isActive', header: this.$t('common.field.status'), sortable: false, minWidth: '100px', align: 'center' }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    },
    triggerCreate(val) {
      if (val) {
        this.dataEdit = null
        this.isShowUpsert = true
        this.$emit('createHandled')
      }
    }
  },

  data() {
    return {
      isShowUpsert: false,
      dataEdit: null
    }
  },

  methods: {
    getTypeLabel(type) {
      const found = this.typeOptions.find((o) => o.value === type)
      return found ? found.label : type
    },

    formatDateRange(data) {
      if (!data.startDate && !data.endDate) return '-'
      const start = data.startDate ? formatDate(data.startDate) : '-'
      const end = data.endDate ? formatDate(data.endDate) : '-'
      return `${start} - ${end}`
    },

    onEdit(data) {
      this.dataEdit = { ...data }
      this.isShowUpsert = true
    },

    onDelete(data) {
      confirmThenSubmit(
        this.$t('view.master.saleChannel.deleteConfirm', { name: data.nameTh, code: data.code }),
        this.$t('common.label.confirmDelete'),
        async () => {
          await this.saleChannelStore.remove(data.code)
          success(this.$t('view.master.saleChannel.deleteSuccess'))
          await this.fetchData()
        }
      )
    },

    onCloseModal() {
      this.isShowUpsert = false
      this.dataEdit = null
    },

    async fetchDataByUpsert() {
      await this.fetchData()
      this.onCloseModal()
    },

    async fetchData() {
      await this.saleChannelStore.fetchDataSearch({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.modelForm
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.btn-action-container {
  display: flex;
  align-items: center;
}

%badge-base {
  padding: 2px var(--sp-sm);
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
}

.badge-yes {
  @extend %badge-base;
  background: var(--status-resolved-bg);
  color: var(--status-resolved);
}

.badge-no {
  @extend %badge-base;
  background: var(--status-closed-bg);
  color: var(--status-closed);
}

.badge-active {
  @extend %badge-base;
  background: var(--status-resolved-bg);
  color: var(--status-resolved);
}

.badge-inactive {
  @extend %badge-base;
  background: var(--status-cancelled-bg);
  color: var(--status-cancelled);
}
</style>
