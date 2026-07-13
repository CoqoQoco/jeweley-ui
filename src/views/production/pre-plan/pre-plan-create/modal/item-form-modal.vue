<template>
  <modal
    :showModal="isShow"
    @closeModal="$emit('closeModal')"
    width="95%"
    :isShowActionPart="true"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">
        {{ index === null ? 'เพิ่มรายการ' : `แก้ไขรายการที่ ${index + 1}` }}
      </span>
    </template>

    <template #content>
      <div class="p-3">
        <moldSection
          :moldCode="form.moldCode || ''"
          :moldDetail="form.moldDetail || ''"
          :initialImageCad="form.moldImageCad"
          :initialImageFinish="form.moldImageFinish"
          @update:moldCode="form.moldCode = $event"
          @update:moldDetail="form.moldDetail = $event"
          @update:imageCad="form.moldImageCad = $event"
          @update:imageFinish="form.moldImageFinish = $event"
          @mold-loaded="onMoldLoaded"
          @mold-design-image="onMoldDesignImage"
          @mold-product-type="onMoldProductType"
          @user-mold-select="onUserMoldSelect"
        >
          <template #images-extra>
            <div class="image-item">
              <span class="title-text d-block mb-1">รูปสินค้าที่คาดว่าจะสำเร็จ</span>
              <div v-if="form.productImageBlobPath && !form.productImageFile" class="product-image-from-mold">
                <ImagePreview
                  :imageName="resolvedProductImagePath"
                  :width="120"
                  :height="120"
                />
                <button
                  type="button"
                  class="btn btn-sm btn-outline-main mt-1"
                  @click="onOverrideImage"
                >
                  <i class="bi bi-pencil"></i> เปลี่ยนรูปเอง
                </button>
              </div>
              <UploadImage
                v-else
                :modelValue="form.productImageFile"
                :previewUrl="form.productImagePreview"
                accept="image/*"
                :maxSizeMB="5"
                :previewSize="120"
                :compact="true"
                :showClear="true"
                @update:modelValue="form.productImageFile = $event"
                @update:previewUrl="form.productImagePreview = $event"
                @clear="onImageClear"
              />
            </div>
          </template>
        </moldSection>

        <div class="card p-3 mt-3">
          <pageTitle title="ข้อมูลสินค้า" :isShowBtnClose="false" class="mb-3" />
          <div class="form-row three-col mb-2">
            <div class="form-field">
              <span class="title-text">ประเภทสินค้า</span>
              <DropdownGeneric
                :modelValue="form.productType"
                :options="masterProduct"
                optionLabel="description"
                placeholder="เลือกประเภทสินค้า"
                :showClear="true"
                @update:modelValue="form.productType = $event"
              />
            </div>
            <div class="form-field">
              <span class="title-text">จำนวน</span>
              <input
                class="form-control"
                type="number"
                min="1"
                v-model.number="form.productQty"
                placeholder="จำนวน..."
              />
              <small class="qty-hint">คำนวณอัตโนมัติจากจำนวนทอง/เงินรวม (แก้ไขได้)</small>
            </div>
            <div class="form-field">
              <span class="title-text">หน่วย</span>
              <input
                class="form-control"
                v-model="form.productQtyUnit"
                placeholder="เช่น ชิ้น, ด้าม"
              />
            </div>
          </div>

          <div class="mb-2">
            <span class="title-text">รายละเอียดสินค้า</span>
            <textarea
              class="form-control"
              v-model="form.productDetail"
              rows="2"
              placeholder="รายละเอียดสินค้า..."
            ></textarea>
          </div>
        </div>

        <div class="mt-3">
          <div v-if="autoFilledFromMold" class="auto-fill-badge mb-1">
            <i class="bi bi-check-circle-fill mr-1"></i> Auto-filled จากแม่พิมพ์ ✓
          </div>
          <materialTable
            :materials="form.materials"
            :masterGold="masterGold"
            :masterGem="masterGem"
            :masterGemShape="masterGemShape"
            @update:materials="onMaterialsUpdate"
          />
        </div>

        <div class="card p-3 mt-3 history-section">
          <div class="history-header" @click="isHistoryOpen = !isHistoryOpen">
            <h6 class="mb-0">
              <i class="bi bi-clock-history mr-2"></i>ประวัติการผลิต (อ้างอิงวัตถุดิบ)
            </h6>
            <button type="button" class="btn-toggle">
              <i :class="isHistoryOpen ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
              {{ isHistoryOpen ? 'ซ่อน' : 'แสดง' }}
            </button>
          </div>
          <div v-if="isHistoryOpen" class="history-content mt-2">
            <moldHistoryContent
              v-if="form.moldCode"
              :moldCode="form.moldCode"
              :currentMaterialsCount="form.materials ? form.materials.length : 0"
              :isShow="isHistoryOpen && !!form.moldCode"
              @apply-materials="onApplyMaterialsFromHistory"
            />
            <div v-else class="text-muted text-center py-3">
              กรุณาเลือกแม่พิมพ์ก่อนดูประวัติการผลิต
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #action>
      <button class="btn btn-sm btn-main" @click="onSubmit">
        <i class="bi bi-save"></i> บันทึก
      </button>
      <button class="btn btn-sm btn-outline-main ml-2" @click="$emit('closeModal')">
        ยกเลิก
      </button>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { usePrePlanStore } from '@/stores/modules/api/production/pre-plan-store.js'
import {
  createEmptyItem,
  cloneItem,
  resolveProductImageBlobPath,
} from '@/services/helper/pre-plan-helpers.js'
import { info } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))
const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
const moldSection = defineAsyncComponent(() => import('../components/mold-section.vue'))
const UploadImage = defineAsyncComponent(
  () => import('@/components/prime-vue/UploadImage.vue')
)
const ImagePreview = defineAsyncComponent(
  () => import('@/components/image/PreviewImage.vue')
)
const materialTable = defineAsyncComponent(() => import('../components/material-table.vue'))
const DropdownGeneric = defineAsyncComponent(
  () => import('@/components/prime-vue/DropdownGeneric.vue')
)
const moldHistoryContent = defineAsyncComponent(
  () => import('./mold-history-content.vue')
)

export default {
  name: 'ItemFormModal',

  components: {
    modal,
    pageTitle,
    moldSection,
    UploadImage,
    ImagePreview,
    materialTable,
    DropdownGeneric,
    moldHistoryContent,
  },

  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    item: {
      type: Object,
      default: null,
    },
    index: {
      type: Number,
      default: null,
    },
    masterGold: {
      type: Array,
      default: () => [],
    },
    masterGem: {
      type: Array,
      default: () => [],
    },
    masterGemShape: {
      type: Array,
      default: () => [],
    },
    masterProduct: {
      type: Array,
      default: () => [],
    },
  },

  emits: ['closeModal', 'submit'],

  setup() {
    const store = usePrePlanStore()
    return { store }
  },

  data() {
    return {
      form: createEmptyItem(),
      isHistoryOpen: false,
      autoFilledFromMold: false,
      originalMoldCode: null,
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.resetForm()
      }
    },
    'form.moldCode'(newCode) {
      if (
        this.originalMoldCode &&
        newCode &&
        newCode !== this.originalMoldCode &&
        (this.form.productImageBlobPath || this.form.productImagePreview)
      ) {
        this.form.productImageFile = null
        this.form.productImagePreview = null
        this.form.productImageBlobPath = null
        info('กรุณาอัปโหลดรูปสินค้าใหม่ เนื่องจากแม่พิมพ์ถูกเปลี่ยน', 'แม่พิมพ์ถูกเปลี่ยน')
      }
    },
    totalGoldQty(val) {
      this.form.productQty = val
    },
  },

  computed: {
    resolvedProductImagePath() {
      return resolveProductImageBlobPath(this.form.productImageBlobPath)
    },
    totalGoldQty() {
      return (this.form.materials || []).reduce(
        (sum, m) => sum + (Number(m.goldQty) || 0),
        0
      )
    },
  },

  methods: {
    resetForm() {
      if (this.item) {
        this.form = cloneItem(this.item)
      } else {
        this.form = createEmptyItem()
      }
      this.isHistoryOpen = false
      this.autoFilledFromMold = false
      this.originalMoldCode = this.form.moldCode || null
    },

    onMoldLoaded({ gems }) {
      if (gems && gems.length && !(this.form.materials && this.form.materials.length)) {
        this.form.materials = gems.map((g, i) => ({
          id: Date.now() + i,
          gold: null,
          goldQty: null,
          gem: g.gemCode ? { description: g.gemCode } : null,
          gemShape: g.gemShapeCode ? { description: g.gemShapeCode } : null,
          gemQty: g.qty || null,
          gemUnit: null,
          gemSize: g.size || null,
          gemWeight: null,
          gemWeightUnit: null,
          diamondQty: null,
          diamondUnit: null,
          diamondSize: null,
          diamondWeight: null,
          diamondWeightUnit: null,
          diamondQuality: null,
        }))
        this.autoFilledFromMold = true
      }
    },

    onMaterialsUpdate(materials) {
      this.form.materials = materials
      this.autoFilledFromMold = false
    },

    onImageClear() {
      this.form.productImageFile = null
      this.form.productImagePreview = null
      this.form.productImageBlobPath = null
    },

    onMoldDesignImage(designImage) {
      if (this.form.productImageFile) return
      if (this.form.productImageBlobPath) return
      if (!designImage) return
      this.form.productImageBlobPath = designImage
    },

    onUserMoldSelect() {
      if (this.form.productImageFile) return
      this.form.productImageBlobPath = null
      this.form.productImagePreview = null
    },

    onOverrideImage() {
      this.form.productImageBlobPath = null
    },

    onMoldProductType({ code }) {
      if (!code) return
      const matched = (this.masterProduct || []).find((p) => p.code === code)
      if (matched) {
        this.form.productType = matched
      }
    },

    onApplyMaterialsFromHistory(materials) {
      this.form.materials = materials
      this.autoFilledFromMold = false
    },

    onSubmit() {
      const cloned = {
        ...this.form,
        materials: (this.form.materials || []).map((m) => ({ ...m })),
      }
      this.$emit('submit', cloned)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff !important;
}

.form-row {
  margin-bottom: 16px;

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  &.three-col {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 16px;
  }

  @media (max-width: 1024px) {
    &.two-col {
      grid-template-columns: 1fr;
    }
    &.three-col {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 600px) {
    &.three-col {
      grid-template-columns: 1fr;
    }
  }
}

.form-field {
  width: 100%;
}

.qty-hint {
  font-size: 0.78rem;
  color: #888;
  display: block;
  margin-top: 4px;
}

.mb-2 {
  margin-bottom: 16px !important;
}

input.form-control,
textarea.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.4;

  &:focus {
    border-color: var(--base-font-color);
    box-shadow: none;
    outline: none;
  }
}

textarea.form-control {
  resize: vertical;
}

.image-item {
  display: flex;
  flex-direction: column;
}

.product-image-from-mold {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.auto-fill-badge {
  display: inline-flex;
  align-items: center;
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 0.82rem;
  font-weight: 600;
}

.history-section {
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;

    h6 {
      border-bottom: none;
      padding-bottom: 0;
      margin-bottom: 0;
    }
  }

  .btn-toggle {
    background: none;
    border: 1px solid var(--base-font-color);
    color: var(--base-font-color);
    border-radius: 4px;
    padding: 2px 10px;
    font-size: 0.85rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;

    &:hover {
      background: var(--base-font-color);
      color: #ffffff;
    }
  }

  .history-content {
    border-top: 1px solid #f0f0f0;
    padding-top: 8px;
  }
}
</style>
