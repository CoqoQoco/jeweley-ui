<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="1200px" :isShowActionPart="true">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.stock.product.editTitle', { stockNumber: stock.stockNumber }) }}</span>
      </template>
      <template #content>
        <form @submit.prevent="onSubmit" id="stock-update-form" class="form-content">
          <!-- Image Section -->
          <div class="section-container">
            <div class="section-header">
              <div class="section-title">
                <i class="bi bi-image-fill"></i>
                <span>{{ $t('view.stock.product.imageProduct') }}</span>
              </div>
            </div>

            <div class="image-upload-container">
              <!-- SHOW stage: display current image + select button -->
              <div v-if="imageStage === 'SHOW'" class="image-preview-box">
                <div class="image-preview">
                  <imagePreview
                    v-if="stock.imagePath"
                    :imageName="stock.imagePath"
                    :type="type"
                    :width="150"
                    :height="150"
                    :preview="true"
                    class="image-body"
                  />
                  <img
                    v-else
                    src="@/assets/no-image.png"
                    :width="150"
                    :height="150"
                    alt="No Image"
                    class="image-body no-image"
                  />
                </div>
                <div class="mt-3">
                  <button
                    type="button"
                    class="btn btn-sm btn-main"
                    @click="onSelectImage('SELECT')"
                  >
                    <i class="bi bi-images mr-1"></i>
                    {{ $t('view.stock.product.selectImage') }}
                  </button>
                </div>
              </div>

              <!-- SELECT stage: gallery search + table -->
              <div v-else-if="imageStage === 'SELECT'" class="image-select-stage">
                <div class="mb-2 d-flex align-items-center">
                  <input
                    class="form-control form-control-sm"
                    v-model="search"
                    :placeholder="$t('view.stock.product.imageSearchPlaceholder')"
                    @keyup.enter="fetchLatestImage"
                  />
                  <button
                    type="button"
                    class="btn btn-sm btn-main ml-2"
                    @click="fetchLatestImage"
                  >
                    <i class="bi bi-search"></i>
                  </button>
                </div>

                <BaseDataTable
                  :items="latestImage"
                  :totalRecords="latestImageTotalRecords"
                  :columns="imageColumns"
                  :perPage="take"
                  :selectionMode="true"
                  :itemsSelection="selectedItems"
                  :selectionType="selectionType"
                  scrollHeight="250px"
                  @update:itemsSelection="updateSelection"
                  @page="handlePageChange"
                  @sort="handleSortChange"
                >
                  <template #imageTemplate="{ data }">
                    <imagePreview
                      :imageName="data.path"
                      :path="data.path"
                      :type="type"
                      :width="40"
                      :height="40"
                      :preview="true"
                    />
                  </template>

                  <template #paginator-buttons>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-main"
                      @click="onSelectImage('SHOW')"
                    >
                      {{ $t('common.btn.cancel') }}
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-main ml-2"
                      :disabled="!selectedItems.length"
                      @click="onSelect"
                    >
                      {{ $t('common.btn.confirm') }}
                    </button>
                  </template>
                </BaseDataTable>
              </div>
            </div>
          </div>

          <!-- Product Information Section -->
          <div class="section-container">
            <div class="section-header">
              <div class="section-title">
                <i class="bi bi-clipboard2-check-fill"></i>
                <span>{{ $t('view.stock.product.stockInfo') }}</span>
              </div>
            </div>

            <div class="form-grid">
              <!-- Mold -->
              <div class="form-group full-width">
                <label class="form-label">
                  <i class="bi bi-box mr-1"></i>
                  {{ $t('view.stock.product.mold') }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  class="form-control"
                  :class="{ 'has-value': stock.mold }"
                  type="text"
                  v-model="stock.mold"
                  :placeholder="$t('view.stock.product.placeholderMold')"
                  required
                />
              </div>

              <!-- Product Name EN -->
              <div class="form-group">
                <label class="form-label">
                  {{ $t('view.stock.product.productNameEn') }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  class="form-control"
                  :class="{ 'has-value': stock.productNameEn }"
                  type="text"
                  v-model="stock.productNameEn"
                  placeholder="Product Name (English)"
                  required
                />
              </div>

              <!-- Product Name TH -->
              <div class="form-group">
                <label class="form-label">
                  {{ $t('view.stock.product.productNameTh') }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  class="form-control"
                  :class="{ 'has-value': stock.productNameTh }"
                  type="text"
                  v-model="stock.productNameTh"
                  :placeholder="$t('view.stock.product.productNameTh')"
                  required
                />
              </div>

              <!-- Quantity -->
              <div class="form-group">
                <label class="form-label">
                  <i class="bi bi-boxes mr-1"></i>
                  {{ $t('common.field.quantity') }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  class="form-control"
                  :class="{ 'has-value': stock.qty }"
                  type="number"
                  step="any"
                  min="0"
                  v-model="stock.qty"
                  placeholder="0"
                  required
                />
              </div>

              <!-- Price -->
              <div class="form-group">
                <label class="form-label">
                  <i class="bi bi-cash mr-1"></i>
                  {{ $t('view.stock.product.salePrice') }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  class="form-control"
                  :class="{ 'has-value': stock.productPrice }"
                  type="number"
                  step="any"
                  min="0"
                  v-model="stock.productPrice"
                  placeholder="0.00"
                  required
                />
              </div>

              <!-- Size -->
              <div class="form-group">
                <label class="form-label">
                  <i class="bi bi-rulers mr-1"></i>
                  {{ $t('view.stock.product.size') }}
                </label>
                <input
                  class="form-control"
                  :class="{ 'has-value': stock.size }"
                  type="text"
                  v-model="stock.size"
                  :placeholder="$t('view.stock.product.placeholderSize')"
                  :required="isRequiredSizeField(stock.productType)"
                />
              </div>

              <!-- Earring Stem Size -->
              <div class="form-group">
                <label class="form-label">
                  {{ $t('view.stock.product.earringStemSize') }}
                </label>
                <input
                  class="form-control"
                  :class="{ 'has-value': stock.earringStemSize }"
                  type="text"
                  v-model="stock.earringStemSize"
                />
              </div>

              <!-- Product Type -->
              <div class="form-group">
                <label class="form-label">
                  <i class="bi bi-tag mr-1"></i>
                  {{ $t('view.stock.product.productType') }}
                </label>
                <DropdownGeneric
                  v-model="stock.productType"
                  :options="masterProductType"
                  optionLabel="description"
                  optionValue="code"
                  :showClear="false"
                  :placeholder="$t('view.stock.product.selectProductType')"
                />
              </div>

              <!-- Location -->
              <div class="form-group">
                <label class="form-label">
                  <i class="bi bi-geo-alt mr-1"></i>
                  {{ $t('view.stock.product.storageLocation') }}
                </label>
                <input
                  class="form-control"
                  type="text"
                  v-model="stock.location"
                  :placeholder="$t('view.stock.product.storageLocation')"
                  disabled
                />
              </div>
            </div>
          </div>

          <!-- Materials Section -->
          <div class="section-container">
            <div class="section-header">
              <div class="section-title">
                <i class="bi bi-gem"></i>
                <span>{{ $t('view.stock.product.materialsTitle') }}</span>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-main"
                @click="addMaterialItem(stock.materials)"
              >
                <i class="bi bi-plus-lg mr-1"></i>
                {{ $t('view.stock.product.addMaterial') }}
              </button>
            </div>

            <div class="material-table-wrapper">
              <BaseDataTable
                :items="stock.materials"
                :columns="materialColumns"
                :paginator="false"
              >
                <template #typeTemplate="{ data }">
                  <DropdownGeneric
                    v-model="data.type"
                    :options="masterMaterialType"
                    optionLabel="description"
                    optionValue="value"
                    :placeholder="$t('view.stock.product.selectMaterialType')"
                    class="w-full"
                  />
                </template>

                <template #typeCodeTemplate="{ data }">
                  <div v-if="data.type === 'Gold' || data.type === 'Silver'">
                    <DropdownGeneric
                      v-model="data.typeCode"
                      :options="masterGold"
                      optionLabel="description"
                      optionValue="code"
                      :placeholder="$t('view.stock.product.selectGold')"
                      :showClear="!!data.typeCode"
                      class="w-full"
                    />
                  </div>
                  <div v-else-if="data.type === 'Diamond'">
                    <DropdownGeneric
                      v-model="data.typeCode"
                      :options="masterDiamondGrade"
                      optionLabel="description"
                      optionValue="nameEn"
                      :placeholder="$t('view.stock.product.selectDiamond')"
                      :showClear="!!data.typeCode"
                      class="w-full"
                    />
                  </div>
                  <div v-else-if="data.type === 'Gem'">
                    <DropdownGeneric
                      v-model="data.typeCode"
                      :options="masterGem"
                      optionLabel="description"
                      optionValue="nameEn"
                      :placeholder="$t('view.stock.product.selectGem')"
                      :showClear="!!data.typeCode"
                      class="w-full"
                    />
                  </div>
                  <div v-else class="text-muted text-center">
                    <small>{{ $t('view.stock.product.selectTypeFirst') }}</small>
                  </div>
                </template>

                <template #sizeTemplate="{ data }">
                  <input
                    type="text"
                    v-model="data.size"
                    class="form-control form-control-sm"
                    :placeholder="$t('view.stock.product.size')"
                  />
                </template>

                <template #regionTemplate="{ data }">
                  <input
                    type="text"
                    v-model="data.region"
                    class="form-control form-control-sm"
                    :placeholder="$t('view.stock.product.origin')"
                  />
                </template>

                <template #qtyTemplate="{ data }">
                  <div class="input-pair">
                    <input
                      type="number"
                      v-model="data.qty"
                      class="form-control form-control-sm"
                      :placeholder="$t('common.field.quantity')"
                      min="0"
                    />
                    <input
                      type="text"
                      v-model="data.qtyUnit"
                      class="form-control form-control-sm"
                      :placeholder="$t('view.stock.product.unit')"
                    />
                  </div>
                </template>

                <template #weightTemplate="{ data }">
                  <div class="input-pair">
                    <input
                      type="number"
                      v-model="data.weight"
                      class="form-control form-control-sm"
                      :placeholder="$t('common.field.weight')"
                      min="0"
                      step="0.01"
                    />
                    <input
                      type="text"
                      v-model="data.weightUnit"
                      class="form-control form-control-sm"
                      :placeholder="$t('view.stock.product.unit')"
                    />
                  </div>
                </template>

                <template #priceTemplate="{ data }">
                  <input
                    type="number"
                    v-model="data.price"
                    class="form-control form-control-sm"
                    :placeholder="$t('common.field.price')"
                    min="0"
                    step="0.01"
                  />
                </template>

                <template #actionTemplate="{ index }">
                  <button
                    type="button"
                    class="btn btn-red btn-sm"
                    @click="removeMaterialItem(stock, index)"
                    :title="$t('common.btn.delete')"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </template>
              </BaseDataTable>
            </div>
          </div>

        </form>
      </template>
      <template #action>
        <button class="btn btn-sm btn-main" type="submit" form="stock-update-form">
          <i class="bi bi-save"></i> {{ $t('common.btn.save') }}
        </button>
        <button class="btn btn-sm btn-outline-main ml-2" type="button" @click="closeModal">
          {{ $t('common.btn.cancel') }}
        </button>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))
const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))
const BaseDataTable = defineAsyncComponent(() =>
  import('@/components/prime-vue/DataTableWithPaging.vue')
)

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

import { stockProductImageApiStor } from '@/stores/modules/api/stock/image-api.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'

export default {
  components: {
    modal,
    imagePreview,
    BaseDataTable,
    DropdownGeneric
  },

  setup() {
    const stockProductImageStore = stockProductImageApiStor()
    const productStore = usrStockProductApiStore()
    const masterStore = useMasterApiStore()
    return { stockProductImageStore, productStore, masterStore }
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
    }
  },

  computed: {
    masterGold() {
      return this.masterStore.gold
    },
    masterGem() {
      return this.masterStore.gem
    },
    masterDiamondGrade() {
      return this.masterStore.diamondGrade
    },
    masterProductType() {
      return this.masterStore.productType
    },
    materialColumns() {
      return [
        { field: 'type', header: this.$t('view.stock.product.materialType'), sortable: false, width: '120px' },
        { field: 'typeCode', header: this.$t('view.stock.product.materialCode'), sortable: false, minWidth: '150px' },
        { field: 'size', header: this.$t('view.stock.product.size'), sortable: false, width: '100px' },
        { field: 'region', header: this.$t('view.stock.product.origin'), sortable: false, width: '120px' },
        { field: 'qty', header: this.$t('common.field.quantity'), sortable: false, width: '180px' },
        { field: 'weight', header: this.$t('common.field.weight'), sortable: false, width: '180px' },
        { field: 'price', header: this.$t('common.field.price'), sortable: false, width: '120px' },
        { field: 'action', header: '', sortable: false, width: '60px' }
      ]
    },
    masterMaterialType() {
      return [
        { value: 'Gold', description: this.$t('view.stock.product.materialTypeGold') },
        { value: 'Silver', description: this.$t('view.stock.product.materialTypeSilver') },
        { value: 'Diamond', description: this.$t('view.stock.product.materialTypeDiamond') },
        { value: 'Gem', description: this.$t('view.stock.product.materialTypeGem') }
      ]
    },
    imageColumns() {
      return [
        { field: 'image', header: '', width: '60px', sortable: false, align: 'center' },
        { field: 'name', header: this.$t('view.stock.product.imageName'), sortable: false, minWidth: '150px' },
        { field: 'createDate', header: this.$t('view.stock.product.imageCreateDate'), sortable: false, format: 'datetime', minWidth: '150px' },
        { field: 'remark', header: this.$t('view.stock.product.imageDetailHeader'), sortable: false, minWidth: '150px' }
      ]
    }
  },

  watch: {
    isShow: {
      async handler(val) {
        this.isShowModal = val
        if (val) {
          await this.masterStore.fetchProductType()
        }
      },
      immediate: true
    },
    modelStock: {
      handler(val) {
        if (!val) return
        this.stock = { ...val }
      },
      immediate: true
    }
  },

  data() {
    return {
      isShowModal: false,
      type: 'STOCK-PRODUCT',
      stock: {},
      imageStage: 'SHOW',
      search: null,
      take: 10,
      skip: 0,
      sort: [],
      latestImage: [],
      latestImageTotalRecords: 0,
      selectedItems: [],
      selectionType: 'single'
    }
  },

  methods: {
    onClear() {
      this.stock = {}
      this.imageStage = 'SHOW'
      this.search = null
      this.selectedItems = []
      this.latestImage = []
    },

    closeModal() {
      this.$emit('closeModal')
      this.onClear()
    },

    isRequiredSizeField(data) {
      return ['G', 'B', 'R'].includes(data)
    },

    removeMaterialItem(item, index) {
      item.materials.splice(index, 1)
    },

    addMaterialItem(data) {
      data.push({
        type: '',
        qty: 1,
        qtyUnit: 'pc',
        weight: null,
        weightUnit: 'ct.',
        description: ''
      })
    },

    onSelectImage(stage) {
      this.imageStage = stage
      if (stage === 'SELECT') {
        this.fetchLatestImage()
      }
    },

    async fetchLatestImage() {
      this.selectedItems = []
      const res = await this.stockProductImageStore.fetchListImage({
        take: this.take,
        skip: this.skip,
        sort: [{ field: 'createDate', dir: 'desc' }],
        search: { name: this.search, year: null },
        skipLoading: true
      })
      if (res) {
        this.latestImageTotalRecords = res.total
        this.latestImage = res.data.map((item) => ({
          id: item.id,
          name: item.name,
          year: item.year,
          remark: item.remark,
          path: item.namePath,
          createDate: item.createDate
        }))
      }
    },

    updateSelection(newSelection) {
      this.selectedItems = newSelection
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

    onSelect() {
      this.stock.imageName = this.selectedItems[0].name
      this.stock.imageYear = this.selectedItems[0].year
      this.stock.imagePath = this.selectedItems[0].path
      this.imageStage = 'SHOW'
    },

    onSubmit() {
      confirmThenSubmit('', this.$t('view.stock.product.confirmSave'), async () => {
        this.fetchConfirm()
      })
    },

    async fetchConfirm() {
      if (this.stock.materials && this.stock.materials.length > 0) {
        this.stock.materials.forEach((item) => {
          item.typeBarcode = this.getBarcode(item)
        })
      }

      const response = await this.productStore.fetchUpdateStockProduct({
        formValue: this.stock
      })

      if (response) {
        this.$emit('closeModal', 'fetch')
        this.onClear()
      }
    },

    getBarcode(item) {
      let display = ''

      if (item.type === 'Diamond') {
        display = `${item.qty ?? ''}${item.type ?? ''}${item.weight ?? ''}${
          item.weightUnit ? ` ${item.weightUnit}` : ''
        }${item.typeCode ? `, ${item.typeCode}` : ''}`
      }

      if (item.type === 'Gold' || item.type === 'Silver') {
        display = `${item.weight ?? ``}${item.weightUnit ? ` ${item.weightUnit}` : ``}${
          item.type ? ` ${item.type}` : ``
        }`
      }

      if (item.type === 'Gem') {
        display = `${item.qty ?? ''}${item.typeCode ?? ''}${item.weight ?? ''}${
          item.weightUnit ? ` ${item.weightUnit}` : ``
        }`
      }

      return display
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.card { background: #ffffff !important; }

.form-content {
  padding: 1.5rem;
}

.section-container {
  margin-bottom: 2rem;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.section-header {
  background: linear-gradient(135deg, var(--base-font-color) 0%, #7a0f0f 100%);
  padding: var(--sp-lg) var(--sp-2xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;

  i {
    font-size: 1.3rem;
  }
}

// Image Section
.image-upload-container {
  padding: 2rem;
}

.image-preview-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed #ddd;
  border-radius: 12px;
  background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--base-font-color);
    background: linear-gradient(145deg, #fff 0%, #f8f9fa 100%);
  }

  .image-preview {
    margin-bottom: 1rem;
  }

  .image-body {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }

    &.no-image {
      opacity: 0.6;
    }
  }
}

.image-select-stage {
  width: 100%;
}

// Form Grid
.form-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;

  .full-width {
    grid-column: 1 / -1;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: var(--base-sub-color);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  margin-bottom: 0;

  i {
    color: var(--base-font-color);
  }

  .text-danger {
    color: var(--base-red);
    margin-left: 0.25rem;
  }
}

.form-control {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.65rem 0.9rem;
  transition: all 0.2s ease;
  background: #fff;

  &:focus {
    border-color: var(--base-font-color);
    box-shadow: 0 0 0 0.2rem rgba(146, 19, 19, 0.15);
  }

  &.has-value {
    background: var(--color-highlight-bg);
    border-color: var(--base-font-color);
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
}

.w-full {
  width: 100%;
}

// Material Table
.material-table-wrapper {
  padding: 1.5rem;

  .input-pair {
    display: flex;
    gap: 0.25rem;

    input:first-child {
      flex: 2;
    }

    input:last-child {
      flex: 1;
    }
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
