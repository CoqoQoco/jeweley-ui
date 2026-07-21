<template>
  <modal :showModal="isShow" @closeModal="closeModal" width="900px" :fitHeight="true" :clickToClose="true">
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">
        {{ $t('view.stock.moveLocation.historyTitle', { stockNumber }) }}
      </span>
    </template>

    <template #content>
      <div class="p-3">
        <BaseDataTable :items="historyList" :totalRecords="historyList.length" :columns="columns" :paginator="false" dataKey="movementDate">
          <template #fromLocationTemplate="{ data }">
            <div>{{ data.fromLocation }} - {{ data.fromLocationName }}</div>
          </template>

          <template #toLocationTemplate="{ data }">
            <div>{{ data.toLocation }} - {{ data.toLocationName }}</div>
          </template>
        </BaseDataTable>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { useStockMoveLocationApiStore } from '@/stores/modules/api/stock/stock-move-location-api.js'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'MoveLocationHistoryView',

  components: {
    modal,
    BaseDataTable
  },

  setup() {
    const moveStore = useStockMoveLocationApiStore()
    return { moveStore }
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    stockNumber: {
      type: String,
      default: null
    }
  },

  emits: ['closeModal'],

  computed: {
    columns() {
      return [
        {
          field: 'movementDate',
          header: this.$t('view.stock.storageMoveReport.colDate'),
          sortable: false,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'fromLocation',
          header: this.$t('view.stock.storageMoveReport.colFromLocation'),
          sortable: false,
          minWidth: '180px'
        },
        {
          field: 'toLocation',
          header: this.$t('view.stock.storageMoveReport.colToLocation'),
          sortable: false,
          minWidth: '180px'
        },
        {
          field: 'createBy',
          header: this.$t('view.stock.storageMoveReport.colCreateBy'),
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'remark',
          header: this.$t('common.field.remark'),
          sortable: false,
          minWidth: '150px'
        }
      ]
    }
  },

  watch: {
    async isShow(val) {
      if (val && this.stockNumber) {
        const res = await this.moveStore.fetchMovementHistory({ stockNumber: this.stockNumber })
        this.historyList = res?.data || []
      } else {
        this.historyList = []
      }
    }
  },

  data() {
    return {
      historyList: []
    }
  },

  methods: {
    closeModal() {
      this.$emit('closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
