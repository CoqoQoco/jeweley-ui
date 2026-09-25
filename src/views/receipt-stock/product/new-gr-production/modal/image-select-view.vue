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

          <div class="mode-toggle-row mt-2">
            <ToggleGroupGeneric v-model="mode" :options="modeOptions" />
          </div>

          <template v-if="mode === 'upload'">
            <div class="mt-2">
              <JpgDropZoneGeneric
                v-model="uploadFile"
                v-model:previewUrl="uploadPreviewUrl"
                :dropLabel="$t('view.receiptStock.product.grProduction.uploadDropHere')"
                :browseLabel="$t('view.receiptStock.product.grProduction.uploadBrowse')"
                :hintLabel="$t('view.receiptStock.product.grProduction.uploadSupportedFormat')"
                :formatWarningLabel="$t('view.receiptStock.product.grProduction.uploadFormatWarning')"
              />
              <FormFieldGeneric
                :label="$t('view.receiptStock.product.grProduction.imageNameLabel')"
                :required="true"
                class="mt-2"
              >
                <InputTextGeneric
                  v-model="uploadName"
                  :placeholder="$t('view.receiptStock.product.grProduction.imageNamePlaceholder')"
                  :required="true"
                />
              </FormFieldGeneric>
            </div>
          </template>

          <template v-else>
            <div>
              <form @submit.prevent="handleSubmit" class="library-search-row mt-2">
                <InputTextGeneric
                  v-model="search.name"
                  :placeholder="$t('view.receiptStock.product.grProduction.searchImagePlaceholder')"
                  :required="true"
                />
                <ButtonGeneric type="submit" variant="green" icon="bi-search" />
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
          </template>

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
            <ButtonGeneric
              v-if="mode === 'library'"
              variant="main"
              icon="bi-pencil-square"
              :label="$t('view.receiptStock.product.grProduction.updateImageBtn')"
              :disabled="!(selectedItems.length > 0)"
              @click="onSelect"
            />
            <ButtonGeneric
              v-else
              variant="main"
              icon="bi-cloud-arrow-up"
              :label="$t('view.receiptStock.product.grProduction.uploadAndUseBtn')"
              :disabled="!canUpload"
              @click="onUploadAndUse"
            />
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

import dataTablePaging from '@/composables/useDataTablePaging.js'
import { stockProductImageApiStor } from '@/stores/modules/api/stock/image-api.js'
import swAlert from '@/services/alert/sweetAlerts.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import JpgDropZoneGeneric from '@/components/generic/JpgDropZoneGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const interfaceSearch = {
  name: null
}

export default {
  mixins: [dataTablePaging],

  components: {
    modal,
    BaseDataTable,
    imagePreview,
    RadioGroupGeneric,
    ToggleGroupGeneric,
    JpgDropZoneGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    ButtonGeneric
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
    },
    receiptNumber: {
      type: String,
      default: ''
    }
  },

  computed: {
    modeOptions() {
      return [
        { value: 'library', label: this.$t('view.receiptStock.product.grProduction.libraryTabLabel') },
        { value: 'upload', label: this.$t('view.receiptStock.product.grProduction.uploadTabLabel') }
      ]
    },
    canUpload() {
      return !!this.uploadFile && !!this.uploadName && !!this.uploadName.trim()
    },
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
          this.mode = 'library'
          this.resetUploadState()
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
    },
    mode(newMode, oldMode) {
      if (oldMode === 'upload' && newMode !== 'upload') {
        this.resetUploadState()
      }
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
      mode: 'library',

      uploadFile: null,
      uploadPreviewUrl: null,
      uploadName: '',

      latestImage: [],
      latestImageTotalRecords: 0,
      selectedItems: [],
      selectionType: 'single'
    }
  },

  methods: {
    onClear() {
      this.search = { ...interfaceSearch }
      this.selectedItems = []
      this.latestImage = []
      this.scope = 'single'
      this.mode = 'library'
      this.resetUploadState()
    },
    closeModal() {
      this.onClear()
      this.$emit('closeModal')
    },
    resetUploadState() {
      this.uploadFile = null
      this.uploadPreviewUrl = null
      this.uploadName = this.buildDefaultUploadName()
    },
    buildDefaultUploadName() {
      return `${this.defaultSearch || ''}-${this.receiptNumber || ''}`.toUpperCase()
    },
    handleSubmit() {
      this.fetchData()
    },
    emitSelectImage(image) {
      this.$emit('select', image, this.stock, this.scope)
      this.onClear()
    },
    onSelect() {
      this.emitSelectImage(this.selectedItems[0])
    },
    async onUploadAndUse() {
      if (!this.canUpload) {
        swAlert.warning('', this.$t('view.receiptStock.product.grProduction.uploadIncompleteWarning'))
        return
      }

      const nameUpper = this.uploadName.trim().toUpperCase()
      const safeName = nameUpper.replace(/[\\/:*?"<>|]/g, '_')
      const renamedFile = new File([this.uploadFile], `${safeName}.jpg`, { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('name', nameUpper)
      formData.append('description', '')
      formData.append('image', renamedFile)

      const res = await this.stockProductImageStore.fetchSaveImage({ form: formData })

      if (res) {
        await this.fetchData()
        this.emitSelectImage({
          name: nameUpper,
          year: new Date().getFullYear(),
          path: `${nameUpper}.jpg`
        })
      }
    },

    async openWithDefaultSearch() {
      if (this.defaultSearch) {
        this.search.name = this.defaultSearch
        await this.fetchData()
        if (this.latestImageTotalRecords === 0) {
          this.mode = 'upload'
          this.search.name = null
          await this.fetchData()
        }
      } else {
        await this.fetchData()
      }
    },

    updateSelection(newSelection) {
      this.selectedItems = newSelection
      //console.log('updateSelection:', this.selectedItems.length)
    },
    async fetchData() {
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

.mode-toggle-row {
  display: flex;
}

.library-search-row {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-sm);

  > :first-child {
    flex: 1;
  }
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
