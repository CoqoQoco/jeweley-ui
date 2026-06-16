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
            variant="green"
            icon="bi-list-ul"
            :title="$t('view.catalog.btn.manageProduct')"
            @click="onManageProducts(rowData)"
          />
          <ButtonGeneric
            variant="main"
            icon="bi-pencil-square"
            class="ml-2"
            :title="$t('common.btn.edit')"
            @click="onUpdate(rowData)"
          />
          <ButtonGeneric
            variant="red"
            icon="bi-trash"
            class="ml-2"
            :title="$t('common.btn.delete')"
            @click="onDelete(rowData)"
          />
        </div>
      </template>

      <template #isActiveTemplate="{ data: rowData }">
        <span :class="rowData.isActive ? 'badge-active' : 'badge-inactive'">
          {{ rowData.isActive ? $t('view.catalog.status.active') : $t('view.catalog.status.inactive') }}
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
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'

import { useCatalogStore } from '@/stores/modules/api/catalog-store.js'

import modalUpd from '../modal/update-view.vue'

const interfaceIsShowModal = {
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

  watch: {
    async modelForm() {
      await this.fetchData()
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
          width: '130px'
        },
        {
          field: 'code',
          header: this.$t('view.catalog.field.code'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'nameTh',
          header: this.$t('view.catalog.field.nameTh'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'nameEn',
          header: this.$t('view.catalog.field.nameEn'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'headerLabel',
          header: this.$t('view.catalog.field.headerLabel'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'collectionTitle',
          header: this.$t('view.catalog.field.collectionTitle'),
          sortable: true,
          minWidth: '180px'
        },
        {
          field: 'productCount',
          header: this.$t('view.catalog.field.productCount'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'createBy',
          header: this.$t('common.field.createBy'),
          sortable: true,
          minWidth: '120px'
        }
      ]
    }
  },

  setup() {
    const catalogStore = useCatalogStore()
    return { catalogStore }
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

    onManageProducts(data) {
      this.$router.push({ name: 'catalog-detail', params: { id: data.id } })
    },

    onDelete(data) {
      confirmThenSubmit(
        `${data.code} : ${data.nameTh}`,
        this.$t('view.catalog.confirm.delete'),
        async () => {
          await this.submitDelete(data.id)
        }
      )
    },

    async submitDelete(id) {
      const res = await this.catalogStore.fetchDelete({ id: id })

      if (res) {
        success(``, ``, async () => {
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
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
}

.badge-inactive {
  background-color: #6c757d;
  color: white;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
}
</style>
