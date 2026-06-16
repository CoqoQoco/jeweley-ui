<template>
  <div>
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

    <modalUpd :isShow="isShow.update" :modelUpdate="dataUpdate" @closeModal="closeModal" />
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import modalUpd from '../modal/update-view.vue'

const interfaceIsShowModal = {
  add: false,
  update: false
}

export default {
  components: {
    BaseDataTable,
    ButtonGeneric,
    modalUpd
  },

  mixins: [dataTablePaging],

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
          field: 'nameTh',
          header: this.$t('view.master.gem.field.nameTh'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'nameEn',
          header: this.$t('view.master.gem.field.nameEn'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'color',
          header: this.$t('view.master.gem.field.color'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'description',
          header: this.$t('view.master.gem.field.description'),
          sortable: true,
          minWidth: '150px'
        }
      ]
    }
  },

  watch: {
    async modelForm() {
      await this.fetchData()
    }
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  data() {
    return {
      isShow: { ...interfaceIsShowModal },
      data: {},
      dataUpdate: {}
    }
  },

  methods: {
    closeModal(event) {
      this.isShow = { ...interfaceIsShowModal }

      if (event === 'fetch') {
        this.fetchData()
      }
    },
    onUpdate(data) {
      this.dataUpdate = {}
      this.dataUpdate = { ...data }
      this.isShow.update = true
    },
    async fetchData() {
      const param = {
        type: 'GEM',
        text: this.form.text
      }
      const res = await this.masterStore.fetchListMaster({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        form: param
      })

      if (res) {
        this.data = { ...res }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
