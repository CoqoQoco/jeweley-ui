<template>
  <div>
    <modal
      :showModal="isShow"
      @closeModal="closeModal"
      width="600px"
      :isShowActionPart="true"
    >
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">
          {{ $t('view.catalog.imageModalTitle') }}: {{ productCode }}
        </span>
      </template>

      <template #content>
        <div class="p-3">
          <div v-for="n in 3" :key="n" class="image-slot-container">
            <div class="image-slot-header">
              <span class="title-text">{{ $t('view.catalog.field.image') }} {{ n }}</span>
            </div>
            <div class="image-slot-body">
              <div class="image-preview-area">
                <imagePreview
                  :imageName="`${productCode}-${n}.jpg`"
                  type="STOCK-PRODUCT"
                  :width="100"
                  :height="100"
                  :preview="true"
                />
              </div>
              <div class="image-upload-area">
                <uploadImage
                  :compact="true"
                  :title="`${$t('view.catalog.field.image')} ${n}`"
                  :showClear="false"
                  @onImportFile="(file) => onFileSelected(file, n)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #action>
        <ButtonGeneric variant="outline" :label="$t('common.btn.close')" @click="closeModal" />
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import { success } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))
const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))
const uploadImage = defineAsyncComponent(() => import('@/components/prime-vue/UploadImage.vue'))

import { stockProductImageApiStor } from '@/stores/modules/api/stock/image-api.js'

export default {
  components: {
    modal,
    imagePreview,
    uploadImage,
    ButtonGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    productCode: {
      type: String,
      default: ''
    }
  },

  setup() {
    const imageStore = stockProductImageApiStor()
    return { imageStore }
  },

  methods: {
    closeModal() {
      this.$emit('closeModal')
    },

    async onFileSelected(file, slotNumber) {
      if (!file) return

      const formData = new FormData()
      formData.append('Name', `${this.productCode}-${slotNumber}`)
      formData.append('Image', file)

      const res = await this.imageStore.fetchSaveImage({ form: formData })

      if (res) {
        success(`${this.$t('view.catalog.field.image')} ${slotNumber}`, ``)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.image-slot-container {
  margin-bottom: var(--sp-xl);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.image-slot-header {
  background-color: var(--base-font-color);
  padding: var(--sp-sm) var(--sp-lg);

  .title-text {
    color: white;
    font-weight: 600;
  }
}

.image-slot-body {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-xl);
  padding: var(--sp-lg);
}

.image-preview-area {
  flex-shrink: 0;
}

.image-upload-area {
  flex: 1;
}
</style>
