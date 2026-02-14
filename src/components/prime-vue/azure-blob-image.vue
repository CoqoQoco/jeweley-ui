<template>
  <div class="azure-blob-image-container">
    <Image
      v-if="imageUrl"
      :class="borderShow ? 'image-preview' : ''"
      :src="imageUrl"
      :alt="alt"
      :width="width"
      :height="height"
      :preview="preview"
      @error="handleImageError"
    />
    <div
      v-else-if="showPlaceholder"
      class="image-placeholder"
      :style="{ width: `${width}px`, height: `${height}px` }"
    >
      <i class="pi pi-image" style="font-size: 2rem; color: var(--surface-400)"></i>
    </div>
  </div>
</template>

<script>
import Image from 'primevue/image'
import { getAzureBlobUrl, isAzureBlobPath } from '@/config/azure-storage-config.js'

/**
 * AzureBlobImage - Generic component สำหรับแสดง image จาก Azure Blob Storage
 *
 * รองรับ 3 รูปแบบ:
 * 1. Azure Blob Path (จาก database) - เช่น "Mold/ABC-001-Mold.png"
 * 2. Base64 Data URI - เช่น "data:image/png;base64,..."
 * 3. HTTP/HTTPS URL - เช่น "https://example.com/image.png"
 *
 * @example
 * // Azure Blob Path (แนะนำ)
 * <azure-blob-image blob-path="Mold/ABC-001-Mold.png" :width="150" :height="150" />
 *
 * // Base64 (backward compatible)
 * <azure-blob-image :blob-path="base64String" />
 *
 * // HTTP URL (backward compatible)
 * <azure-blob-image blob-path="https://example.com/image.png" />
 */
export default {
  name: 'AzureBlobImage',
  components: {
    Image
  },
  props: {
    // Path หรือ URL ของ image (รองรับทั้ง Azure Blob path, Base64, HTTP URL)
    blobPath: {
      type: String,
      default: ''
    },
    // ความกว้างของ image (pixels)
    width: {
      type: [Number, String],
      default: 100
    },
    // ความสูงของ image (pixels)
    height: {
      type: [Number, String],
      default: 100
    },
    // แสดง border รอบ image หรือไม่
    borderShow: {
      type: Boolean,
      default: true
    },
    // เปิดใช้งาน preview (zoom) หรือไม่
    preview: {
      type: Boolean,
      default: true
    },
    // ข้อความ alt สำหรับ accessibility
    alt: {
      type: String,
      default: 'Image'
    },
    // แสดง placeholder เมื่อไม่มี image หรือไม่
    showPlaceholder: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    /**
     * สร้าง URL สำหรับแสดง image
     * @returns {string} - Full URL ของ image
     */
    imageUrl() {
      if (!this.blobPath) return ''

      // กรณี 1: Base64 Data URI (backward compatible)
      if (this.blobPath.startsWith('data:')) {
        return this.blobPath
      }

      // กรณี 2: HTTP/HTTPS URL (backward compatible)
      if (this.blobPath.startsWith('http://') || this.blobPath.startsWith('https://')) {
        return this.blobPath
      }

      // กรณี 3: Azure Blob Path (แปลงเป็น full URL)
      if (isAzureBlobPath(this.blobPath)) {
        return getAzureBlobUrl(this.blobPath)
      }

      // ถ้าไม่ตรงกรณีไหนเลย ให้ return path เดิม
      return this.blobPath
    }
  },
  methods: {
    /**
     * จัดการ error เมื่อโหลด image ไม่สำเร็จ
     */
    handleImageError(event) {
      console.warn('Failed to load image:', this.blobPath)
      // Emit event ให้ parent component รับรู้
      this.$emit('error', event)
    }
  }
}
</script>

<style lang="scss" scoped>
.azure-blob-image-container {
  display: inline-block;
  padding: 5px 0;
}

.image-preview {
  border: 1px solid var(--base-color, #e0e0e0);
  border-radius: 4px;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--surface-50, #f8f9fa);
  border: 1px solid var(--surface-200, #dee2e6);
  border-radius: 4px;
}
</style>
