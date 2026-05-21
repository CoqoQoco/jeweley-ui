<template>
  <div class="card p-3">
    <pageTitle title="ข้อมูลแม่พิมพ์" :isShowBtnClose="false" class="mb-3" />

    <div class="form-row two-col">
      <div class="form-field">
        <span class="title-text">รหัสแม่พิมพ์ <span class="text-danger">*</span></span>
        <AutoCompleteGeneric
          :modelValue="moldCode"
          optionLabel="code"
          placeholder="พิมพ์รหัสแม่พิมพ์..."
          :forceSelection="false"
          apiEndpoint="Mold/SearchMold"
          searchField="text"
          @item-select="onMoldSelect"
          @update:modelValue="onMoldInput"
          customClass="mold-autocomplete"
          class="mt-1"
        />
      </div>
      <div class="form-field">
        <span class="title-text">รายละเอียดแม่พิมพ์</span>
        <input
          class="form-control"
          type="text"
          :value="moldDetail"
          @input="$emit('update:moldDetail', $event.target.value)"
          placeholder="รายละเอียดแม่พิมพ์..."
        />
      </div>
    </div>

    <div v-if="imageCad || imageFinish || $slots['images-extra']" class="images-row mt-2">
      <div v-if="imageCad" class="image-item">
        <span class="title-text d-block mb-1">รูป CAD</span>
        <imagePreview :imageName="imageCad" type="MOLD" :width="120" :height="120" />
      </div>
      <div v-if="imageFinish" class="image-item">
        <span class="title-text d-block mb-1">รูปแม่พิมพ์</span>
        <imagePreview :imageName="imageFinish" type="MOLD" :width="120" :height="120" />
      </div>
      <slot name="images-extra" />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import api from '@/axios/axios-helper.js'

const AutoCompleteGeneric = defineAsyncComponent(
  () => import('@/components/prime-vue/AutoCompleteGeneric.vue')
)
const imagePreview = defineAsyncComponent(
  () => import('@/components/prime-vue/ImagePreview.vue')
)
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

export default {
  name: 'MoldSection',
  components: { AutoCompleteGeneric, imagePreview, pageTitle },
  props: {
    moldCode: { type: String, default: '' },
    moldDetail: { type: String, default: '' },
    initialImageCad: { type: String, default: null },
    initialImageFinish: { type: String, default: null },
  },
  emits: [
    'update:moldCode',
    'update:moldDetail',
    'update:imageCad',
    'update:imageFinish',
    'mold-loaded',
    'mold-design-image',
    'mold-product-type',
  ],
  data() {
    return {
      imageCad: this.initialImageCad,
      imageFinish: this.initialImageFinish,
    }
  },
  watch: {
    initialImageCad(val) {
      this.imageCad = val
    },
    initialImageFinish(val) {
      this.imageFinish = val
    },
  },
  async created() {
    if (this.moldCode && !this.imageCad && !this.imageFinish) {
      await this.fetchMoldDetail(this.moldCode)
    }
  },
  methods: {
    onMoldInput(val) {
      this.$emit('update:moldCode', typeof val === 'object' ? val?.code : val)
    },
    async onMoldSelect(item) {
      const mold = item.value || item
      this.$emit('update:moldCode', mold.code)
      this.$emit('update:moldDetail', mold.description || '')
      this.imageCad = mold.imageDraft1 ? `${mold.code}-Sub` : null
      this.imageFinish = mold.code || null
      this.$emit('update:imageCad', this.imageCad)
      this.$emit('update:imageFinish', this.imageFinish)
      this.$emit('mold-design-image', mold.designImage || null)
      this.$emit('mold-product-type', {
        code: mold.productTypeCode || null,
        description: mold.productTypeDescription || null,
      })
      await this.fetchMoldPlanGems(mold.id)
    },
    async fetchMoldDetail(code) {
      const res = await api.jewelry.post('Mold/SearchMold', {
        take: 1,
        skip: 0,
        search: { text: code },
      })
      const mold = res?.data?.[0]
      if (mold) {
        this.$emit('update:moldDetail', mold.description || '')
        this.imageCad = mold.imageDraft1 ? `${mold.code}-Sub` : null
        this.imageFinish = mold.code || null
        this.$emit('update:imageCad', this.imageCad)
        this.$emit('update:imageFinish', this.imageFinish)
        this.$emit('mold-design-image', mold.designImage || null)
        this.$emit('mold-product-type', {
          code: mold.productTypeCode || null,
          description: mold.productTypeDescription || null,
        })
      }
    },
    async fetchMoldPlanGems(moldId) {
      if (!moldId) return
      const res = await api.jewelry.get('Mold/PlanGet', { id: moldId })
      const gems = (res?.gems || []).map((g) => ({
        gemCode: g.gemCode || g.gem || null,
        gemShapeCode: g.gemShapeCode || g.gemShape || null,
        qty: g.qty || null,
        size: g.size || null,
      }))
      this.$emit('mold-loaded', { gems })
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

  @media (max-width: 1024px) {
    &.two-col {
      grid-template-columns: 1fr;
    }
  }
}

.form-field {
  width: 100%;
}

.images-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

.image-item {
  display: flex;
  flex-direction: column;
}

input.form-control {
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

:deep(.mold-autocomplete) {
  width: 100%;
}
</style>
