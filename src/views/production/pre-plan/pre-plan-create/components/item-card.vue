<template>
  <div class="item-card">
    <div class="item-card-header d-flex justify-content-between align-items-center">
      <span class="fw-semibold">รายการที่ {{ index + 1 }}</span>
      <button type="button" class="btn btn-sm btn-red" @click="$emit('remove')">
        <i class="bi bi-trash"></i> ลบ
      </button>
    </div>

    <div class="item-card-body">
      <moldSection
        :moldCode="item.moldCode || ''"
        :productType="item.productType || ''"
        :moldDetail="item.moldDetail || ''"
        @update:moldCode="emitUpdate('moldCode', $event)"
        @update:productType="emitUpdate('productType', $event)"
        @update:moldDetail="emitUpdate('moldDetail', $event)"
        @mold-loaded="onMoldLoaded"
      />

      <productImageUpload
        :modelValue="item.productImageFile"
        :previewUrl="item.productImagePreview"
        class="mt-3"
        @update:modelValue="emitUpdate('productImageFile', $event)"
        @update:previewUrl="emitUpdate('productImagePreview', $event)"
        @clear="onImageClear"
      />

      <div class="card p-3 mt-3">
        <h6 class="mb-3">ข้อมูลลูกค้าและสินค้า</h6>

        <div class="responsive-grid-2col mb-2">
          <div>
            <span class="title-text">รหัสลูกค้า</span>
            <AutoCompleteGeneric
              :modelValue="item.customerNumber"
              :staticOptions="[]"
              :useStaticList="true"
              optionLabel="code"
              placeholder="รหัสลูกค้า..."
              :forceSelection="false"
              customClass="customer-ac"
              @update:modelValue="onCustomerChange"
            />
          </div>
          <div>
            <span class="title-text">ประเภทลูกค้า</span>
            <DropdownGeneric
              :modelValue="item.customerType"
              :options="[]"
              optionLabel="label"
              optionValue="value"
              placeholder="เลือกประเภทลูกค้า"
              :showClear="true"
              @update:modelValue="emitUpdate('customerType', $event)"
            />
          </div>
        </div>

        <div class="responsive-grid-2col mb-2">
          <div>
            <span class="title-text">ชื่อสินค้า</span>
            <input
              class="form-control"
              :value="item.productName"
              placeholder="ชื่อสินค้า..."
              @input="emitUpdate('productName', $event.target.value)"
            />
          </div>
          <div>
            <span class="title-text">ประเภทสินค้า</span>
            <DropdownGeneric
              :modelValue="item.productType"
              :options="[]"
              optionLabel="label"
              optionValue="value"
              placeholder="เลือกประเภทสินค้า"
              :showClear="true"
              @update:modelValue="emitUpdate('productType', $event)"
            />
          </div>
        </div>

        <div class="responsive-grid-2col mb-2">
          <div>
            <span class="title-text">จำนวนสินค้า</span>
            <input
              class="form-control"
              type="number"
              min="1"
              :value="item.productQty"
              placeholder="จำนวน..."
              @input="emitUpdate('productQty', $event.target.value ? Number($event.target.value) : null)"
            />
          </div>
          <div>
            <span class="title-text">หน่วย</span>
            <input
              class="form-control"
              :value="item.productQtyUnit"
              placeholder="เช่น ชิ้น, ด้าม"
              @input="emitUpdate('productQtyUnit', $event.target.value)"
            />
          </div>
        </div>

        <div class="mb-2">
          <span class="title-text">รายละเอียดสินค้า</span>
          <textarea
            class="form-control"
            :value="item.productDetail"
            rows="2"
            placeholder="รายละเอียดสินค้า..."
            @input="emitUpdate('productDetail', $event.target.value)"
          ></textarea>
        </div>
      </div>

      <goldSection
        :goldType="item.goldType || '18K'"
        class="mt-3"
        @update:goldType="emitUpdate('goldType', $event)"
      />

      <materialTable
        :materials="item.materials || []"
        class="mt-3"
        @update:materials="emitUpdate('materials', $event)"
      />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const moldSection = defineAsyncComponent(() => import('./mold-section.vue'))
const goldSection = defineAsyncComponent(() => import('./gold-section.vue'))
const materialTable = defineAsyncComponent(() => import('./material-table.vue'))
const productImageUpload = defineAsyncComponent(() => import('./product-image-upload.vue'))
const AutoCompleteGeneric = defineAsyncComponent(
  () => import('@/components/prime-vue/AutoCompleteGeneric.vue')
)
const DropdownGeneric = defineAsyncComponent(
  () => import('@/components/prime-vue/DropdownGeneric.vue')
)

export default {
  name: 'ItemCard',

  components: {
    moldSection,
    goldSection,
    materialTable,
    productImageUpload,
    AutoCompleteGeneric,
    DropdownGeneric,
  },

  props: {
    item: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },

  emits: ['update:item', 'remove'],

  methods: {
    emitUpdate(field, value) {
      this.$emit('update:item', { ...this.item, [field]: value })
    },

    onCustomerChange(value) {
      const code = typeof value === 'object' && value !== null ? value.code : value
      this.emitUpdate('customerNumber', code)
    },

    onMoldLoaded({ gems }) {
      if (gems && gems.length && !(this.item.materials && this.item.materials.length)) {
        const materials = gems.map((g, i) => ({
          _id: Date.now() + i,
          materialType: 'Gem',
          masterId: g.gemId || null,
          materialCode: g.gemCode || '',
          shapeCode: g.gemShapeCode || '',
          size: g.size || '',
          qty: g.qty || 0,
          color: '',
          weight: null,
          weightUnit: '',
          isLocked: false,
          remark: '',
        }))
        this.emitUpdate('materials', materials)
      }
    },

    onImageClear() {
      this.emitUpdate('productImageFile', null)
      this.emitUpdate('productImagePreview', null)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.item-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.item-card-header {
  background: #fdf2f2;
  color: var(--base-font-color);
  padding: 8px 12px;
}

.item-card-body {
  padding: 16px;
}

:deep(.customer-ac) {
  width: 100%;
}
</style>
