<template>
  <div class="card p-3">
    <h6 class="mb-3">รูปสินค้าที่คาดว่าจะสำเร็จ</h6>
    <div class="d-flex align-items-start gap-3 flex-wrap">
      <div>
        <button type="button" class="btn btn-sm btn-outline-main" @click="triggerFileInput">
          <i class="bi bi-image"></i> เลือกรูป
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="onFileChange"
        />
      </div>

      <div v-if="previewUrl" class="product-image-preview">
        <img :src="previewUrl" alt="preview" class="preview-img" />
        <button type="button" class="btn btn-sm btn-red mt-2 d-block" @click="onClear">
          <i class="bi bi-trash"></i> ลบรูป
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { warning } from '@/services/alert/sweetAlerts.js'

const MAX_SIZE = 5 * 1024 * 1024

export default {
  name: 'ProductImageUpload',

  props: {
    modelValue: {
      type: File,
      default: null,
    },
    previewUrl: {
      type: String,
      default: null,
    },
  },

  emits: ['update:modelValue', 'update:previewUrl', 'clear'],

  data() {
    return {
      objectUrl: null,
    }
  },

  beforeUnmount() {
    this.revokeObjectUrl()
  },

  methods: {
    triggerFileInput() {
      this.$refs.fileInput.value = ''
      this.$refs.fileInput.click()
    },

    onFileChange(event) {
      const file = event.target.files[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        warning('ไฟล์ที่เลือกต้องเป็นรูปภาพเท่านั้น', 'ประเภทไฟล์ไม่ถูกต้อง')
        return
      }

      if (file.size > MAX_SIZE) {
        warning('ขนาดรูปภาพต้องไม่เกิน 5MB', 'รูปภาพขนาดใหญ่เกินไป')
        return
      }

      this.revokeObjectUrl()
      this.objectUrl = URL.createObjectURL(file)
      this.$emit('update:modelValue', file)
      this.$emit('update:previewUrl', this.objectUrl)
    },

    onClear() {
      this.revokeObjectUrl()
      this.$emit('update:modelValue', null)
      this.$emit('update:previewUrl', null)
      this.$emit('clear')
    },

    revokeObjectUrl() {
      if (this.objectUrl) {
        URL.revokeObjectURL(this.objectUrl)
        this.objectUrl = null
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.product-image-preview {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.preview-img {
  max-width: 150px;
  max-height: 150px;
  object-fit: contain;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}
</style>
