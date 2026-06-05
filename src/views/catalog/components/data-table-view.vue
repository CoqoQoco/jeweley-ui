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
          <button
            class="btn btn-sm btn-green"
            title="จัดการสินค้า"
            @click="onManageProducts(rowData)"
          >
            <i class="bi bi-list-ul"></i>
          </button>
          <button
            class="btn btn-sm btn-main ml-2"
            title="แก้ไข"
            @click="onUpdate(rowData)"
          >
            <i class="bi bi-pencil-square"></i>
          </button>
          <button
            class="btn btn-sm btn-red ml-2"
            title="ลบ"
            @click="onDelete(rowData)"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </template>

      <template #isActiveTemplate="{ data: rowData }">
        <span :class="rowData.isActive ? 'badge-active' : 'badge-inactive'">
          {{ rowData.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
        </span>
      </template>
    </BaseDataTable>

    <modalUpd
      :isShow="isShow.update"
      :modelUpdate="dataUpdate"
      @closeModal="closeModal"
    ></modalUpd>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

import { useCatalogStore } from '@/stores/modules/api/catalog-store.js'
import swAlert from '@/services/alert/sweetAlerts.js'

import modalUpd from '../modal/update-view.vue'

const interfaceIsShowModal = {
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
      await this.fetchData()
    }
  },

  computed: {
    form() {
      return this.modelForm || {}
    }
  },

  setup() {
    const catalogStore = useCatalogStore()
    return { catalogStore }
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
          width: '130px'
        },
        {
          field: 'code',
          header: 'รหัส',
          sortable: true,
          minWidth: '120px'
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
          field: 'headerLabel',
          header: 'Header Label',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'collectionTitle',
          header: 'Collection Title',
          sortable: true,
          minWidth: '180px'
        },
        {
          field: 'productCount',
          header: 'จำนวนสินค้า',
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'createBy',
          header: 'สร้างโดย',
          sortable: true,
          minWidth: '120px'
        }
      ]
    }
  },
  methods: {
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

    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },

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

    onManageProducts(data) {
      this.$router.push({ name: 'catalog-detail', params: { id: data.id } })
    },

    onDelete(data) {
      swAlert.confirmSubmit(
        `${data.code} : ${data.nameTh}`,
        'ยืนยันลบ catalog',
        async () => {
          await this.submitDelete(data.id)
        },
        null,
        null
      )
    },

    async submitDelete(id) {
      const res = await this.catalogStore.fetchDelete({ id: id })

      if (res) {
        swAlert.success(``, ``, async () => {
          await this.fetchData()
        })
      }
    },

    async fetchData() {
      const res = await this.catalogStore.fetchList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        form: {
          code: this.form.code,
          name: this.form.name
        }
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

.badge-active {
  background-color: var(--base-green);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.badge-inactive {
  background-color: #6c757d;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}
</style>
