<template>
  <div class="mt-2">
    <BaseDataTable
      :items="data.data"
      :totalRecords="data.total"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionsTemplate="{ data: rowData }">
        <div class="btn-action-container">
          <ButtonGeneric
            variant="main"
            icon="bi-database-fill-gear"
            :title="$t('common.btn.edit')"
            @click="onUpdate(rowData)"
          />
        </div>
      </template>
    </BaseDataTable>

    <updateView
      :isShow="isShowUpdate"
      :modelUpdate="dataUpdate"
      @closeModal="onCloseModal"
      @fetch="fetchDataByUpdate"
    />
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import updateView from '../modal/update-view.vue'

export default {
  components: {
    BaseDataTable,
    ButtonGeneric,
    updateView
  },

  mixins: [dataTablePaging],

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  computed: {
    form() {
      return this.modelForm || {}
    },
    columns() {
      return [
        {
          field: 'actions',
          header: '',
          sortable: false,
          width: '50px'
        },
        {
          field: 'code',
          header: this.$t('common.field.code'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'goldNameTH',
          header: this.$t('view.master.zill.field.gold'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'goldSizeNameTH',
          header: this.$t('view.master.zill.field.goldSize'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'description',
          header: this.$t('view.master.zill.field.description'),
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

  data() {
    return {
      data: {},
      isShowUpdate: false,
      dataUpdate: {}
    }
  },

  methods: {
    onCloseModal() {
      this.isShowUpdate = false
      this.dataUpdate = {}
    },
    onUpdate(row) {
      this.dataUpdate = { ...row }
      this.isShowUpdate = true
    },
    async fetchDataByUpdate() {
      await this.fetchData()
      this.onCloseModal()
    },
    async fetchData() {
      this.data = await this.masterStore.fetchListMaster({
        skip: this.skip,
        take: this.take,
        sort: this.sort,
        form: this.form
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
