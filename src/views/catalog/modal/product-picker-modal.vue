<template>
  <div>
    <modal
      :showModal="isShow"
      @closeModal="closeModal"
      width="900px"
      :isShowActionPart="true"
    >
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.catalog.productPickerTitle') }}</span>
      </template>

      <template #content>
        <div class="p-3">
          <div class="search-row mb-3">
            <div class="input-group">
              <InputTextGeneric
                v-model="searchText"
                :placeholder="$t('view.catalog.placeholder.searchProduct')"
                @keyup.enter="fetchProducts"
              />
              <ButtonGeneric variant="green" icon="bi-search" class="ml-2" @click="fetchProducts" />
            </div>
          </div>

          <BaseDataTable
            scrollHeight="350px"
            :items="productData.data"
            :totalRecords="productData.total"
            :columns="columns"
            :perPage="take"
            :rowsPerPageOptions="[10, 20, 50]"
            :selectionMode="true"
            :itemsSelection="selectedItems"
            selectionType="multiple"
            dataKey="productNumber"
            @update:itemsSelection="updateSelection"
            @page="handlePageChange"
            @sort="handleSortChange"
          >
          </BaseDataTable>
        </div>
      </template>

      <template #action>
        <ButtonGeneric
          :variant="!selectedItems.length ? 'dark' : 'main'"
          icon="bi-check-lg"
          :label="`${$t('view.catalog.btn.addSelected')} (${selectedItems.length})`"
          :disabled="!selectedItems.length"
          @click="onConfirm"
        />
        <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="closeModal" />
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))
const BaseDataTable = defineAsyncComponent(() =>
  import('@/components/prime-vue/DataTableWithPaging.vue')
)

import { useCatalogStore } from '@/stores/modules/api/catalog-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'

export default {
  components: {
    modal,
    BaseDataTable,
    InputTextGeneric,
    ButtonGeneric
  },

  mixins: [dataTablePaging],

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    catalogId: {
      type: [String, Number],
      default: null
    }
  },

  setup() {
    const catalogStore = useCatalogStore()
    const productStore = usrStockProductApiStore()
    return { catalogStore, productStore }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.onOpen()
      }
    }
  },

  computed: {
    columns() {
      return [
        {
          field: 'productNumber',
          header: this.$t('view.catalog.field.productNumber'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productNameEn',
          header: this.$t('view.catalog.field.nameEn'),
          sortable: true,
          minWidth: '180px'
        },
        {
          field: 'productNameTh',
          header: this.$t('view.catalog.field.nameTh'),
          sortable: true,
          minWidth: '180px'
        },
        {
          field: 'productTypeName',
          header: this.$t('view.catalog.field.productType'),
          sortable: true,
          minWidth: '130px'
        }
      ]
    }
  },

  data() {
    return {
      searchText: null,
      productData: { data: [], total: 0 },
      selectedItems: []
    }
  },

  methods: {
    onOpen() {
      this.searchText = null
      this.selectedItems = []
      this.productData = { data: [], total: 0 }
      this.skip = 0
      this.fetchProducts()
    },

    closeModal() {
      this.onClear()
      this.$emit('closeModal')
    },

    onClear() {
      this.searchText = null
      this.selectedItems = []
      this.productData = { data: [], total: 0 }
    },

    updateSelection(newSelection) {
      this.selectedItems = newSelection
    },

    async fetchProducts() {
      await this.productStore.fetchDataSearch({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: {
          productNumber: this.searchText,
          productName: this.searchText
        }
      })

      this.productData = {
        data: this.productStore.dataSearch?.data || [],
        total: this.productStore.dataSearch?.total || 0
      }
    },

    fetchData() {
      this.fetchProducts()
    },

    onConfirm() {
      if (!this.selectedItems.length) return

      confirmThenSubmit(
        this.$t('view.catalog.btn.addSelected') + ` ${this.selectedItems.length} ` + this.$t('common.label.all').toLowerCase(),
        this.$t('view.catalog.confirm.addProducts'),
        async () => {
          await this.submitAddProducts()
        }
      )
    },

    async submitAddProducts() {
      const items = this.selectedItems.map((p) => ({
        productNumber: p.productNumber
      }))

      const res = await this.catalogStore.fetchAddProducts({
        catalogId: this.catalogId,
        items: items
      })

      if (res) {
        success(``, ``, async () => {
          this.onClear()
          this.$emit('closeModal', 'fetch')
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.search-row {
  .input-group {
    display: flex;
    align-items: center;
  }
}
</style>
