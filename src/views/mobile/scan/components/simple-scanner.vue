<template>
  <div class="simple-scanner-wrapper">
    <!-- Camera Capture Button -->
    <div class="camera-capture-section">
      <div class="capture-icon">
        <i class="bi bi-camera-fill"></i>
      </div>
      <p class="capture-instruction">ถ่ายรูป QR Code หรือ Barcode</p>

      <!-- Native File Input with Camera -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        style="display: none"
        @change="handleImageCapture"
      />

      <button class="mobile-btn mobile-btn-primary mobile-btn-lg" @click="openCamera">
        <i class="bi bi-camera"></i>
        ถ่ายรูป
      </button>

      <p class="capture-note">หรือเลือกรูปจากแกลเลอรี่</p>

      <button class="mobile-btn mobile-btn-outline mobile-mt-2" @click="openGallery">
        <i class="bi bi-image"></i>
        เลือกรูปจากแกลเลอรี่
      </button>
    </div>

    <!-- Preview Image -->
    <div v-if="previewImage" class="preview-section mobile-mt-3">
      <p class="preview-label">รูปที่เลือก:</p>
      <img :src="previewImage" alt="Preview" class="preview-image" />
      <button class="mobile-btn mobile-btn-sm mobile-btn-secondary mobile-mt-2" @click="clearImage">
        <i class="bi bi-x-circle"></i>
        ลบรูป
      </button>
    </div>

    <!-- Processing Status -->
    <div v-if="isProcessing" class="processing-section mobile-mt-3">
      <div class="mobile-loading">
        <div class="spinner"></div>
        <p class="loading-text">กำลังอ่าน QR Code...</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="scanner-error mobile-mt-3">
      <i class="bi bi-exclamation-triangle"></i>
      <p>{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import { BrowserQRCodeReader } from '@zxing/browser'

export default {
  name: 'SimpleScanner',

  data() {
    return {
      previewImage: null,
      isProcessing: false,
      errorMessage: '',
      codeReader: null
    }
  },

  mounted() {
    this.codeReader = new BrowserQRCodeReader()
  },

  methods: {
    openCamera() {
      // Trigger camera capture
      const input = this.$refs.fileInput
      input.setAttribute('capture', 'environment')
      input.click()
    },

    openGallery() {
      // Trigger gallery selection
      const input = this.$refs.fileInput
      input.removeAttribute('capture')
      input.click()
    },

    async handleImageCapture(event) {
      const file = event.target.files[0]
      if (!file) return

      this.errorMessage = ''
      this.isProcessing = true

      try {
        // Show preview
        this.previewImage = URL.createObjectURL(file)

        // Decode QR/Barcode from image
        const result = await this.decodeImage(file)

        if (result) {
          this.$emit('scan', result.getText())
          this.clearImage()
        } else {
          this.errorMessage = 'ไม่พบ QR Code หรือ Barcode ในรูปภาพ\nกรุณาลองถ่ายใหม่ให้ชัดเจนขึ้น'
        }
      } catch (err) {
        console.error('Error decoding image:', err)
        this.errorMessage = 'ไม่สามารถอ่าน QR Code ได้\nกรุณาลองถ่ายใหม่อีกครั้ง'
      } finally {
        this.isProcessing = false
        // Reset file input
        event.target.value = ''
      }
    },

    async decodeImage(file) {
      return new Promise((resolve) => {
        const reader = new FileReader()

        reader.onload = async (e) => {
          try {
            const img = new Image()
            img.onload = async () => {
              try {
                const result = await this.codeReader.decodeFromImageElement(img)
                resolve(result)
              } catch (err) {
                resolve(null)
              }
            }
            img.onerror = () => resolve(null)
            img.src = e.target.result
          } catch (err) {
            resolve(null)
          }
        }

        reader.onerror = () => resolve(null)
        reader.readAsDataURL(file)
      })
    },

    clearImage() {
      if (this.previewImage) {
        URL.revokeObjectURL(this.previewImage)
      }
      this.previewImage = null
      this.errorMessage = ''
    }
  },

  beforeUnmount() {
    this.clearImage()
    if (this.codeReader) {
      this.codeReader.reset()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.simple-scanner-wrapper {
  width: 100%;
}

.camera-capture-section {
  background: white;
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .capture-icon {
    width: 100px;
    height: 100px;
    margin: 0 auto 16px;
    background: linear-gradient(135deg, var(--base-font-color) 0%, var(--base-font-sub-color) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 3rem;
      color: white;
    }
  }

  .capture-instruction {
    font-size: 1.05rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
  }

  .capture-note {
    font-size: 0.9rem;
    color: #999;
    margin: 16px 0 0 0;
  }
}

.preview-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .preview-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
    margin: 0 0 12px 0;
  }

  .preview-image {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: 8px;
    border: 2px solid #e0e0e0;
  }
}

.processing-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.scanner-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;

  i {
    font-size: 2rem;
    color: #ff9800;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #856404;
    text-align: center;
    white-space: pre-line;
  }
}
</style>
