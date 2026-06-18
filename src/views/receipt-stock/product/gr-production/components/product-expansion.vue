<template>
  <div class="p-2">
    <!-- stock already receipt -->
    <div v-if="item.isReceipt">
      <div class="form-col-fix-2-container">
        <div class="form-col-container">
          <div class="filter-container-bg-focus">
            <barcodeDemo
              :madeIn="formBarcode.madeIn"
              :madeInText="formBarcode.madeInText"
              :stockNumber="item.stockNumber"
              :mold="item.moldDesign ?? formBarcode.mold"
              :gold="item.barcodeGold"
              :gems="item.barcodeGems"
              :size="item.size"
              :goldType="formBarcode.goldType"
              :type="formBarcode.type"
              class="mt-4"
            >
            </barcodeDemo>
          </div>
        </div>
        <!-- รูปสินค้า -->
        <div class="form-col-container">
          <div class="filter-container-img">
            <div class="image-preview">
              <imagePreview
                v-if="item.imagePath"
                :imageName="item.imagePath"
                :path="item.imagePath"
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
                alt="Image"
                class="image-body"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- stock on receipt -->
    <div v-else>
      <!-- data & img -->
      <div class="form-col-fix-2-container">
        <!-- detail -->
        <div class="p-2 filter-container-bg-focus">
          <!-- qty -->
          <div class="form-col-container">
            <div>
              <div>
                <span class="title-text">{{ $t('common.field.quantity') }} *</span>
              </div>
              <input
                class="form-control form-control-sm"
                :style="getBgColor(item.isReceipt, item.qty)"
                type="number"
                step="any"
                min="0"
                v-model="item.qty"
                :required="isRequiredField(item)"
              />
            </div>

            <div>
              <div>
                <span class="title-text">{{ $t('receipt-stock.product.grProduction.salePrice') }} *</span>
              </div>
              <input
                class="form-control form-control-sm"
                :style="getBgColor(item.isReceipt, item.price)"
                type="number"
                step="any"
                min="0"
                v-model="item.price"
                :required="isRequiredField(item)"
              />
            </div>
          </div>

          <!-- size -->
          <div class="form-col-container mt-2">
            <div class="form-col-sm-container">
              <div>
                <div>
                  <span class="title-text">{{ $t('common.field.size') }}</span>
                </div>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="item.size"
                  :required="isRequiredSizeField(item)"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                />
              </div>

              <div>
                <div>
                  <span class="title-text">{{ $t('receipt-stock.product.grProduction.studEarring') }}</span>
                </div>
                <Dropdown
                  v-model="item.studEarring"
                  :options="masterStud"
                  optionLabel="description"
                  optionValue="value"
                  class="w-full md:w-14rem"
                  :placeholder="$t('receipt-stock.product.grProduction.studEarring')"
                  :showClear="item.studEarring ? true : false"
                  style="height: 31px !important"
                  :disabled="!requiredStud"
                >
                </Dropdown>
              </div>
            </div>

            <!-- location -->
            <div>
              <div>
                <span class="title-text">{{ $t('receipt-stock.product.grProduction.location') }}</span>
              </div>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="item.location"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                disabled
              />
            </div>
          </div>

          <!-- remark -->
          <div class="form-col-container mt-2">
            <div>
              <div>
                <span class="title-text">{{ $t('common.field.remark') }}</span>
              </div>
              <textarea
                type="text"
                class="form-control form-control-sm mt-1"
                v-model="item.remark"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
              />
            </div>
          </div>
        </div>

        <!-- รูปสินค้า -->
        <div class="form-col-container">
          <div class="filter-container-img">
            <!-- ส่วนแสดงรูป -->
            <div class="image-preview">
              <imagePreview
                v-if="item.imagePath"
                :imageName="item.imagePath"
                :path="item.imagePath"
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
                alt="Image"
                class="image-body"
              />
            </div>

            <!-- ส่วนปุ่มควบคุม -->
            <div class="image-controls mt-1">
              <button
                class="btn btn-green btn-sm ms-2"
                type="button"
                @click="$emit('select-image', item)"
              >
                <span class="bi bi-image"></span>
                <span>เลือกรูปสินค้า</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- gold/diamond/gem weight -->
      <div class="form-col-container">
        <div class="filter-container mt-2">
          <div class="d-flex justify-content-between">
            <div class="group-title pl-2">
              <div>
                <span class="title-text-lg bi bi-hammer"></span>
                <span class="title-text-lg ml-2">{{ $t('receipt-stock.product.grProduction.materialComponents') }}</span>
              </div>
              <small class="pl-4">{{ $t('receipt-stock.product.grProduction.materialDescription') }}</small>
            </div>
            <!-- Add button -->
            <div class="d-flex justify-content-start mt-2">
              <div
                type="button"
                class="p-2 text-dark"
                @click="$emit('add-material', item.materials)"
              >
                <span class="bi bi-plus-lg"></span>
                <span></span>
              </div>
            </div>
          </div>

          <BaseDataTable
            :items="item.materials"
            :columns="materialTableColumns"
            :paginator="false"
            :scrollHeight="scrollHeight"
            class="custom-form-table-material"
          >
            <template #typeTemplate="{ data }">
              <div class="d-flex justify-content-center">
                <Dropdown
                  v-model="data.type"
                  :options="masterMaterialType"
                  optionLabel="description"
                  optionValue="value"
                  class="w-full md:w-14rem"
                  :class="data.type === true ? `p-invalid` : ``"
                  @change="$emit('update-type-barcode', data, item.stockReceiptNumber)"
                />
              </div>
            </template>

            <template #typeCodeTemplate="{ data }">
              <div class="">
                <div v-if="data.type === 'Gold' || data.type === 'Silver'">
                  <Dropdown
                    v-model="data.typeCode"
                    :options="masterGold"
                    optionLabel="description"
                    optionValue="code"
                    class="w-full md:w-14rem"
                    placeholder="เลือกทอง"
                    :showClear="data.typeCode ? true : false"
                    @change="$emit('update-type-barcode', data, item.stockReceiptNumber)"
                  >
                  </Dropdown>
                </div>
                <div v-else-if="data.type === 'Diamond'">
                  <Dropdown
                    v-model="data.typeCode"
                    :options="masterDiamondGrade"
                    optionLabel="description"
                    optionValue="nameEn"
                    class="w-full md:w-14rem"
                    placeholder="เลือกเกรดเพชร"
                    :showClear="data.typeCode ? true : false"
                    @change="$emit('update-type-barcode', data, item.stockReceiptNumber)"
                  >
                  </Dropdown>
                </div>
                <div v-else-if="data.type === 'Gem'">
                  <Dropdown
                    v-model="data.typeCode"
                    :options="masterGem"
                    optionLabel="description"
                    optionValue="nameEn"
                    class="w-full md:w-14rem"
                    placeholder="เลือกพลอย"
                    :showClear="data.typeCode ? true : false"
                    @change="$emit('update-type-barcode', data, item.stockReceiptNumber)"
                  >
                  </Dropdown>
                </div>
                <div v-else class="vertical-center-container text-center">
                  <span> --- โปรดระบุประเภท ---</span>
                </div>
              </div>
            </template>

            <template #sizeTemplate="{ data }">
              <div class="d-flex justify-content-center">
                <input
                  type="text"
                  v-model="data.size"
                  class="form-control"
                  :style="getBgColor(false, data.size)"
                  @input="$emit('update-type-barcode', data, item.stockReceiptNumber)"
                />
              </div>
            </template>

            <template #regionTemplate="{ data }">
              <div class="d-flex justify-content-center">
                <input
                  type="text"
                  v-model="data.region"
                  class="form-control"
                  :style="getBgColor(false, data.region)"
                  @input="$emit('update-type-barcode', data, item.stockReceiptNumber)"
                />
              </div>
            </template>

            <template #qtyTemplate="{ data }">
              <div class="d-flex justify-content-center">
                <input
                  type="number"
                  v-model="data.qty"
                  class="form-control"
                  :style="getBgColor(false, data.qty)"
                  placeholder="จำนวน"
                  min="0"
                  @input="$emit('update-type-barcode', data, item.stockReceiptNumber)"
                />
                <input
                  type="text"
                  style="margin-left: 1px"
                  v-model="data.qtyUnit"
                  class="form-control"
                  :style="getBgColor(false, data.qtyUnit)"
                  placeholder="หน่วย"
                  min="0"
                  @input="$emit('update-type-barcode', data, item.stockReceiptNumber)"
                />
              </div>
            </template>

            <template #weightTemplate="{ data }">
              <div class="d-flex justify-content-center">
                <input
                  type="number"
                  v-model="data.weight"
                  class="form-control"
                  :style="getBgColor(false, data.weight)"
                  placeholder="น้ำหนัก"
                  min="0"
                  step="0.01"
                  @input="$emit('update-type-barcode', data, item.stockReceiptNumber)"
                />
                <input
                  type="text"
                  style="margin-left: 1px"
                  v-model="data.weightUnit"
                  class="form-control"
                  :style="getBgColor(false, data.qtyUnit)"
                  placeholder="หน่วย"
                  min="0"
                  @input="$emit('update-type-barcode', data, item.stockReceiptNumber)"
                />
              </div>
            </template>

            <template #priceTemplate="{ data }">
              <div class="d-flex justify-content-center">
                <input
                  type="number"
                  v-model="data.price"
                  class="form-control"
                  :style="getBgColor(false, data.price)"
                  min="0"
                  step="0.01"
                />
              </div>
            </template>

            <template #typeBarcodeTemplate="{ data }">
              <div class="d-flex justify-content-center">
                <input
                  type="text"
                  v-model="data.typeBarcode"
                  class="form-control"
                  placeholder="ข้อความที่จะเเสดงบน Barcode"
                  disabled
                />
              </div>
            </template>

            <template #actionTemplate="{ index, data }">
              <div class="d-flex align-items-center mt-1">
                <button
                  type="button"
                  class="btn btn-red btn-sm"
                  @click="$emit('remove-material', data, item, index)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </template>
          </BaseDataTable>
        </div>
      </div>

      <!-- barcode -->
      <div class="form-col-container mt-2">
        <div class="filter-container-bg-focus">
          <barcodeDemo
            :madeIn="formBarcode.madeIn"
            :madeInText="formBarcode.madeInText"
            :stockNumber="item.stockNumber"
            :mold="item.moldDesign ?? formBarcode.mold"
            :gold="item.barcodeGold"
            :gems="item.barcodeGems"
            :size="item.size"
            :goldType="formBarcode.goldType"
            :type="formBarcode.type"
          >
          </barcodeDemo>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
// eslint-disable-next-line no-restricted-imports -- Dropdown used with inline style override, migration pending
import Dropdown from 'primevue/dropdown'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import barcodeDemo from '@/components/custom/barcode-demo/barcode-demo-view.vue'

const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

export default {
  name: 'ProductExpansion',

  components: {
    Dropdown,
    BaseDataTable,
    barcodeDemo,
    imagePreview
  },

  props: {
    item: {
      type: Object,
      required: true
    },
    formBarcode: {
      type: Object,
      default: () => ({})
    },
    masterMaterialType: {
      type: Array,
      default: () => []
    },
    masterStud: {
      type: Array,
      default: () => []
    },
    masterGold: {
      type: Array,
      default: () => []
    },
    masterGem: {
      type: Array,
      default: () => []
    },
    masterDiamondGrade: {
      type: Array,
      default: () => []
    },
    selectedItems: {
      type: Array,
      default: () => []
    },
    parentData: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      default: 'STOCK-PRODUCT'
    },
    scrollHeight: {
      type: String,
      default: ''
    }
  },

  emits: ['select-image', 'search-product-name', 'add-material', 'remove-material', 'update-type-barcode'],

  computed: {
    requiredStud() {
      return this.parentData.productType === 'ES'
    },
    materialTableColumns() {
      return [
        { field: 'type', header: this.$t('receipt-stock.product.grProduction.matType'), sortable: false, width: '100px' },
        { field: 'typeCode', header: this.$t('receipt-stock.product.grProduction.matTypeCode'), sortable: false, minWidth: '100px' },
        { field: 'size', header: this.$t('receipt-stock.product.grProduction.matSize'), sortable: false, width: '150px' },
        { field: 'region', header: this.$t('receipt-stock.product.grProduction.matRegion'), sortable: false, width: '80px' },
        { field: 'qty', header: this.$t('receipt-stock.product.grProduction.matQty'), sortable: false, width: '200px' },
        { field: 'weight', header: this.$t('receipt-stock.product.grProduction.matWeight'), sortable: false, width: '200px' },
        { field: 'price', header: this.$t('receipt-stock.product.grProduction.matPrice'), sortable: false, width: '150px' },
        { field: 'typeBarcode', header: 'Barcode', sortable: false, minWidth: '100px' },
        { field: 'action', header: '', sortable: false, width: '50px' }
      ]
    }
  },

  methods: {
    getBgColor(isReceipt, data) {
      if (isReceipt) {
        return 'background-color: #e0e0e0'
      } else if (data) {
        return 'background-color: #b5dad4'
      } else {
        return 'background-color: #dad4b5'
      }
    },
    isRequiredField(data, size = false) {
      if (size) {
        return (
          !data.isReceipt &&
          this.selectedItems.some(
            (selected) => selected.stockReceiptNumber === data.stockReceiptNumber
          ) &&
          ['G', 'B', 'R', 'N'].includes(this.parentData.productType)
        )
      } else {
        return (
          !data.isReceipt &&
          this.selectedItems.some(
            (selected) => selected.stockReceiptNumber === data.stockReceiptNumber
          )
        )
      }
    },
    isRequiredSizeField(data) {
      return (
        !data.isReceipt &&
        this.selectedItems.some(
          (selected) => selected.stockReceiptNumber === data.stockReceiptNumber
        )
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.form-col-fix-2-container {
  display: grid;
  padding: 0px;
  grid-template-columns: 4fr 2fr;
}

.filter-container-img {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border: 2px dashed #dddddd;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;

  &:hover {
    border-color: #adb5bd;
  }

  .image-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    border-radius: 4px;
  }

  .image-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-1px);
    }
  }
}

.image-body {
  border: 1px solid var(--base-color);
}

.group-title {
  display: flex;
  flex-direction: column;
}
</style>
