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
          :productType="form.productType?.description || form.productType || ''"
          :moldDetail="form.moldDetail || ''"
          :initialImageCad="form.moldImageCad"
          :initialImageFinish="form.moldImageFinish"
          @update:moldCode="form.moldCode = $event"
          @update:moldDetail="form.moldDetail = $event"
          @update:imageCad="form.moldImageCad = $event"
          @update:imageFinish="form.moldImageFinish = $event"
          @mold-loaded="onMoldLoaded"
        />

        <UploadImage
          :modelValue="form.productImageFile"
          :previewUrl="form.productImagePreview"
          title="รูปสินค้าที่คาดว่าจะสำเร็จ"
          accept="image/*"
          :maxSizeMB="5"
          :previewSize="150"
          :compact="true"
          :showClear="true"
          class="mt-3"
          @update:modelValue="form.productImageFile = $event"
          @update:previewUrl="form.productImagePreview = $event"
          @clear="onImageClear"
        />

        <div class="card p-3 mt-3">
          <h6 class="mb-3">ข้อมูลสินค้า</h6>
          <div class="responsive-grid-2col mb-2">
            <div>
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
            <div>
              <span class="title-text">จำนวน</span>
              <input
                class="form-control"
                type="number"
                min="1"
                v-model.number="form.productQty"
                placeholder="จำนวน..."
              />
            </div>
          </div>

          <div class="mb-2">
            <span class="title-text">หน่วย</span>
            <input
              class="form-control"
              v-model="form.productQtyUnit"
              placeholder="เช่น ชิ้น, ด้าม"
            />
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

        <materialTable
          :materials="form.materials"
          :masterGold="masterGold"
          :masterGoldSize="masterGoldSize"
          :masterGem="masterGem"
          :masterGemShape="masterGemShape"
          class="mt-3"
          @update:materials="form.materials = $event"
        />
      </div>
    </template>

    <template #action>
      <button class="btn btn-sm btn-main" @click="onSubmit">
        <i class="bi bi-save"></i> บันทึก
      </button>
      <button class="btn btn-sm btn-outline-main ms-2" @click="$emit('closeModal')">
        ยกเลิก
      </button>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const moldSection = defineAsyncComponent(() => import('../components/mold-section.vue'))
const UploadImage = defineAsyncComponent(
  () => import('@/components/prime-vue/UploadImage.vue')
)
const materialTable = defineAsyncComponent(() => import('../components/material-table.vue'))
const DropdownGeneric = defineAsyncComponent(
  () => import('@/components/prime-vue/DropdownGeneric.vue')
)

let localIdCounter = 1

function createEmptyItem() {
  return {
    _localId: localIdCounter++,
    moldCode: null,
    moldDetail: null,
    moldImageCad: null,
    moldImageFinish: null,
    productImageFile: null,
    productImagePreview: null,
    productType: null,
    productQty: null,
    productQtyUnit: null,
    productDetail: null,
    materials: [],
  }
}

export default {
  name: 'ItemFormModal',

  components: {
    modal,
    moldSection,
    UploadImage,
    materialTable,
    DropdownGeneric,
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
    masterGoldSize: {
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

  data() {
    return {
      form: createEmptyItem(),
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.resetForm()
      }
    },
  },

  methods: {
    resetForm() {
      if (this.item) {
        this.form = JSON.parse(JSON.stringify(this.item))
      } else {
        this.form = createEmptyItem()
      }
    },

    onMoldLoaded({ gems }) {
      if (gems && gems.length && !(this.form.materials && this.form.materials.length)) {
        this.form.materials = gems.map((g, i) => ({
          id: Date.now() + i,
          gold: null,
          goldSize: null,
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
      }
    },

    onImageClear() {
      this.form.productImageFile = null
      this.form.productImagePreview = null
    },

    onSubmit() {
      this.$emit('submit', JSON.parse(JSON.stringify(this.form)))
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

h6 {
  color: var(--base-font-color);
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  background: transparent !important;
}

.title-text {
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
}

.responsive-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
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

@media (max-width: 1024px) {
  .responsive-grid-2col {
    grid-template-columns: 1fr;
  }
}
</style>
