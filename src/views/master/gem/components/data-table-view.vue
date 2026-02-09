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
      <!-- Action buttons template -->
      <template #actionsTemplate="{ data: rowData }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn btn-main" title="เเก้ไข" @click="onUpdate(rowData)">
            <i class="bi bi-database-fill-gear"></i>
          </button>
        </div>
      </template>
    </BaseDataTable>

    <modalUpd :isShow="isShow.update" :modelUpdate="dataUpdate" @closeModal="closeModal"></modalUpd>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import {
  formatDate,
  formatDateTime
  //formatISOString
} from '@/services/utils/dayjs.js'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import modalUpd from '../modal/update-view.vue'

const interfaceIsShowModal = {
  add: false,
  update: false
}

export default {
  components: {
    BaseDataTable,
    modalUpd
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  watch: {
    async modelForm() {
      //console.log(this.modelForm)
      //this.take = 10
      //this.skip = 0
      await this.fetchData()
    }
  },

  computed: {
    form() {
      return this.modelForm || {}
    }
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  data() {
    return {
      isShow: { ...interfaceIsShowModal },

      take: 10,
      skip: 0,
      sort: [],
      data: {},
      dataUpdate: {},

      columns: [
        {
          field: 'actions',
          header: '',
          sortable: false,
          width: '50px'
        },
        {
          field: 'code',
          header: 'รหัส',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'nameTh',
          header: 'ชื่อ TH',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'nameEn',
          header: 'ชื่อ EN',
          sortable: true,
          minWidth: '150px'
        },
          {
          field: 'color',
          header: 'สีพลอย',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'description',
          header: 'คำอธิบาย',
          sortable: true,
          minWidth: '150px'
        }
      ]
    }
  },
  methods: {
    // ----------- table ----------- //
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchData()
    },

    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => ({
        field: item.field,
        dir: item.order === 1 ? 'asc' : 'desc'
      }))
      this.fetchData()
    },

    // -------- helper function -------- //
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },

    // --------- event
    closeModal(event) {
      this.isShow = { ...interfaceIsShowModal }

      if (event === 'fetch') {
        this.fetchData()
      }
    },
    onUpdate(data) {
      //console.log(data)
      this.dataUpdate = {}
      this.dataUpdate = { ...data }
      this.isShow.update = true
    },

    // --------- APIs ---------//
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
