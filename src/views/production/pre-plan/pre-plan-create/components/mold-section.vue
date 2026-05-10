<template>
  <div class="card p-3">
    <h6 class="mb-3">ข้อมูลแม่พิมพ์</h6>
    <div class="mb-2">
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
      />
    </div>

    <div class="mb-2">
      <span class="title-text">รายละเอียดแม่พิมพ์</span>
      <textarea
        class="form-control"
        :value="moldDetail"
        @input="$emit('update:moldDetail', $event.target.value)"
        rows="2"
      ></textarea>
    </div>

    <div v-if="imageCad || imageFinish" class="d-flex gap-3 mt-2 flex-wrap">
      <div v-if="imageCad">
        <span class="title-text d-block mb-1">รูป CAD</span>
        <imagePreview :imageName="imageCad" type="MOLD" :width="120" :height="120" />
      </div>
      <div v-if="imageFinish">
        <span class="title-text d-block mb-1">รูปเเม่พิมพ์</span>
        <imagePreview :imageName="imageFinish" type="MOLD" :width="120" :height="120" />
      </div>
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

export default {
  name: 'MoldSection',
  components: { AutoCompleteGeneric, imagePreview },
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
      this.$emit('mold-loaded', { gems: mold.gems || mold.planGems || [] })
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
      }
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

:deep(.mold-autocomplete) {
  width: 100%;
}

@media (max-width: 1024px) {
  .responsive-grid-2col {
    grid-template-columns: 1fr;
  }
}
</style>
