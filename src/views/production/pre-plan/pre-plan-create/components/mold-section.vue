<template>
  <div class="card p-3">
    <h6 class="mb-3">ข้อมูลแม่พิมพ์</h6>
    <div class="responsive-grid-2col mb-2">
      <div>
        <span class="title-text">รหัสแม่พิมพ์ <span class="text-danger">*</span></span>
        <AutoCompleteGeneric
          :modelValue="moldCode"
          optionLabel="code"
          placeholder="พิมพ์รหัสแม่พิมพ์..."
          :forceSelection="false"
          apiEndpoint="Mold/Search"
          searchField="code"
          @item-select="onMoldSelect"
          @update:modelValue="onMoldInput"
          customClass="mold-autocomplete"
        />
      </div>
      <div>
        <span class="title-text">ประเภทสินค้า</span>
        <input
          class="form-control"
          :value="productType"
          @input="$emit('update:productType', $event.target.value)"
          placeholder="auto-fill จากแม่พิมพ์"
        />
      </div>
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
        <imagePreview :imageName="imageCad" type="MOLD" :width="150" :height="150" />
      </div>
      <div v-if="imageFinish">
        <span class="title-text d-block mb-1">รูปสำเร็จ</span>
        <imagePreview :imageName="imageFinish" type="MOLD" :width="150" :height="150" />
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
    productType: { type: String, default: '' },
    moldDetail: { type: String, default: '' },
  },
  emits: ['update:moldCode', 'update:productType', 'update:moldDetail', 'mold-loaded'],
  data() {
    return {
      imageCad: null,
      imageFinish: null,
    }
  },
  methods: {
    onMoldInput(val) {
      this.$emit('update:moldCode', typeof val === 'object' ? val?.code : val)
    },
    async onMoldSelect(item) {
      const mold = item.value || item
      this.$emit('update:moldCode', mold.code)
      const res = await api.jewelry.get(`Mold/PlanGet?id=${mold.id || mold.code}`)
      if (res) {
        this.$emit('update:productType', res.category || res.productType || '')
        this.$emit('update:moldDetail', res.description || '')
        this.imageCad = res.imageDraft1 || null
        this.imageFinish = res.image || null
        this.$emit('mold-loaded', { gems: res.gems || res.planGems || [] })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
:deep(.mold-autocomplete) {
  width: 100%;
}
</style>
