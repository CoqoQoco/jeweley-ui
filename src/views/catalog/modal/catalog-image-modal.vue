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
          จัดการรูปภาพสินค้า: {{ productCode }}
        </span>
      </template>

      <template #content>
        <div class="p-3">
          <div v-for="n in 3" :key="n" class="image-slot-container">
            <div class="image-slot-header">
              <span class="title-text">รูปที่ {{ n }}</span>
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
                  :title="`รูปที่ ${n}`"
                  :showClear="false"
                  @onImportFile="(file) => onFileSelected(file, n)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #action>
        <button class="btn btn-sm btn-outline-main" type="button" @click="closeModal">
          ปิด
        </button>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))
const uploadImage = defineAsyncComponent(() => import('@/components/prime-vue/UploadImage.vue'))

import { stockProductImageApiStor } from '@/stores/modules/api/stock/image-api.js'
import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  components: {
    modal,
    imagePreview,
    uploadImage
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
        swAlert.success(`บันทึกรูปที่ ${slotNumber} สำเร็จ`, ``, null, null, null)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.image-slot-container {
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.image-slot-header {
  background-color: var(--base-font-color);
  padding: 8px 16px;

  .title-text {
    color: white;
    font-weight: 600;
  }
}

.image-slot-body {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 16px;
}

.image-preview-area {
  flex-shrink: 0;
}

.image-upload-area {
  flex: 1;
}
</style>
