<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="900px">
      <template v-slot:content>
        <div>
          <div class="title-text-lg-bg">
            <span><i class="bi bi-image mr-2"></i></span>
            <template v-if="bulkMode">
              <span>{{ $t('view.receiptStock.product.grProduction.imageModalTitleBulk') }}</span>
            </template>
            <template v-else>
              <span>{{ $t('view.receiptStock.product.grProduction.imageModalTitle') }}</span>
              <span class="ml-2">{{ stock.stockReceiptNumber }}</span>
            </template>
          </div>
          
          <div>
            <form @submit.prevent="handleSubmit">
              <div class="input-group input-group-sm">
                <div class="input-group input-group-inner">
                  <input
                    class="form-control"
                    :style="getBgColor(search.name)"
                    type="text"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    v-model="search.name"
                    :placeholder="$t('view.receiptStock.product.grProduction.searchImagePlaceholder')"
                    required
                  />
                  <div class="input-group-append mr-1">
                    <button type="submit" class="btn btn-main btn-sm btn-input-group mt-1">
                      <span class="bi bi-search"></span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div class="mt-1">
            <BaseDataTable
              scrollHeight="400px"
              :items="latestImage"
              :totalRecords="latestImageTotalRecords"
              :columns="columns"
              :perPage="take"
              :rowsPerPageOptions="[10, 20, 50]"
              :selectionMode="true"
              :itemsSelection="selectedItems"
              :selectionType="selectionType"
              @update:itemsSelection="updateSelection"
              @page="handlePageChange"
              @sort="handleSortChange"
            >
              <!-- Image Column -->
              <template #imageTemplate="{ data }">
                <div class="image-container">
                  <div>
                    <imagePreview
                      :imageName="data.path"
                      :path="data.path"
                      :type="type"
                      :width="50"
                      :height="50"
                      :preview="false"
                    />
                  </div>
                </div>
              </template>
            </BaseDataTable>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-2">
            <div class="image-scope-row">
              <span class="scope-label">{{ $t('view.receiptStock.product.grProduction.imageScopeTitle') }}</span>
              <RadioGroupGeneric
                v-model="scope"
                :options="scopeOptions"
                optionLabel="label"
                optionValue="value"
                :inline="true"
              />
            </div>
            <button
              :class="['btn btn-sm', !selectedItems.length > 0 ? 'btn-secondary' : 'btn-main']"
              type="button"
              :disabled="!selectedItems.length > 0"
              :title="$t('view.receiptStock.product.grProduction.updateImageBtn')"
              @click="onSelect"
            >
              <span><i class="bi bi-pencil-square"></i></span>
              <span class="ml-2">{{ $t('view.receiptStock.product.grProduction.updateImageBtn') }}</span>
            </button>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))
const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'

import { stockProductImageApiStor } from '@/stores/modules/api/stock/image-api.js'

const interfaceSearch = {
  name: null
}

export default {
  components: {
    modal,
    BaseDataTable,
    imagePreview,
    RadioGroupGeneric
  },

  setup() {
    const stockProductImageStore = stockProductImageApiStor()
    return { stockProductImageStore }
  },

  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    },
    modelStock: {
      type: Object,
      required: true,
      default: () => ({})
    },
    bulkMode: {
      type: Boolean,
      default: false
    },
    selectedCount: {
      type: Number,
      default: 0
    },
    pendingCount: {
      type: Number,
      default: 0
    },
    defaultSearch: {
      type: String,
      default: ''
    }
  },

  computed: {
    scopeOptions() {
      const options = []
      if (!this.bulkMode) {
        options.push({
          value: 'single',
          label: this.$t('view.receiptStock.product.grProduction.imageScopeSingle')
        })
      }
      if (this.selectedCount > 0) {
        options.push({
          value: 'selected',
          label: this.$t('view.receiptStock.product.grProduction.imageScopeSelected', { count: this.selectedCount })
        })
      }
      options.push({
        value: 'all',
        label: this.$t('view.receiptStock.product.grProduction.imageScopeAll', { count: this.pendingCount })
      })
      return options
    },
    columns() {
      return [
        {
          field: 'image',
          header: '',
          width: '50px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'name',
          header: this.$t('view.receiptStock.product.grProduction.colImageName'),
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'createDate',
          header: this.$t('view.receiptStock.product.grProduction.colImageCreateDate'),
          sortable: false,
          format: 'datetime',
          minWidth: '150px'
        },
        {
          field: 'remark',
          header: this.$t('view.receiptStock.product.grProduction.colImageRemark'),
          sortable: false,
          minWidth: '150px'
        }
      ]
    }
  },

  watch: {
    isShow: {
      async handler(val) {
        this.isShowModal = val
        if (val === true) {
          this.scope = this.bulkMode ? (this.selectedCount > 0 ? 'selected' : 'all') : 'single'
          await this.openWithDefaultSearch()
        }
      },
      immediate: true
    },
    modelStock: {
      handler(val) {
        this.stock = val
        //console.log('modelStock', val)
      },
      immediate: true
    }
  },

  data() {
    return {
      isShowModal: this.isShow,
      stock: this.modelStock,
      search: {
        ...interfaceSearch
      },

      type: 'STOCK-PRODUCT',
      scope: 'single',

      latestImage: [],
      latestImageTotalRecords: 0,
      selectedItems: [],
      selectionType: 'single',

      tableHeight: '800px',
      take: 10,
      skip: 0,
      sort: []
    }
  },

  methods: {
    onClear() {
      this.search = { ...interfaceSearch }
      this.selectedItems = []
      this.latestImage = []
      this.scope = 'single'
    },
    closeModal() {
      this.onClear()
      this.$emit('closeModal')
    },
    getBgColor(data) {
      if (data) {
        return 'background-color: #b5dad4'
      } else {
        return 'background-color: #dad4b5'
      }
    },
    handleSubmit() {
      //console.log('submit')
      this.fetchLatestImage()
    },
    onSelect() {
      //console.log('selectedItems:', this.selectedItems[0])
      //console.log('stock:', this.stock)
      this.$emit('select', this.selectedItems[0], this.stock, this.scope)
      this.onClear()
    },

    async openWithDefaultSearch() {
      if (this.defaultSearch) {
        this.search.name = this.defaultSearch
        await this.fetchLatestImage()
        if (this.latestImageTotalRecords === 0) {
          this.search.name = null
          await this.fetchLatestImage()
        }
      } else {
        await this.fetchLatestImage()
      }
    },

    updateSelection(newSelection) {
      this.selectedItems = newSelection
      //console.log('updateSelection:', this.selectedItems.length)
    },
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchLatestImage()
    },
    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => ({
        field: item.field,
        dir: item.order === 1 ? 'asc' : 'desc'
      }))
      this.fetchLatestImage()
    },
    async fetchLatestImage() {
      this.selectedItems = []
      const res = await this.stockProductImageStore.fetchListImage({
        take: this.take,
        skip: this.skip,
        sort: [{ field: 'createDate', dir: 'desc' }],
        search: {
          name: this.search.name,
          year: null
        },
        skipLoading: true
      })

      if (res) {
        this.latestImageTotalRecords = res.total
        this.latestImage = res.data.map((item) => {
          return {
            id: item.id,
            name: item.name,
            year: item.year,
            remark: item.remark,
            path: item.namePath,
            createDate: item.createDate
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.btn-input-group {
  height: 35px;
  padding: 6px 12px;
  margin-top: 5px !important;
}

.image-scope-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

.scope-label {
  font-weight: 600;
  color: var(--base-font-color);
  white-space: nowrap;
}
</style>
