<template>
  <div class="simple-scanner-wrapper">
    <!-- Camera Capture Button -->
    <div class="camera-capture-section">
      <div class="capture-icon">
        <i class="bi bi-camera-fill"></i>
      </div>
      <p class="capture-instruction">{{ $t('view.mobile.scan.simpleScannerTitle') }}</p>

      <!-- Native File Input with Camera — scanner input: leave as-is -->
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
        {{ $t('view.mobile.scan.simpleScannerCaptureBtn') }}
      </button>

      <p class="capture-note">{{ $t('view.mobile.scan.simpleScannerOrDivider') }}</p>

      <button class="mobile-btn mobile-btn-outline mobile-mt-2" @click="openGallery">
        <i class="bi bi-image"></i>
        {{ $t('view.mobile.scan.simpleScannerGalleryBtn') }}
      </button>
    </div>

    <!-- Preview Image -->
    <div v-if="previewImage" class="preview-section mobile-mt-3">
      <p class="preview-label">{{ $t('view.mobile.scan.simpleScannerSelectedLabel') }}</p>
      <img :src="previewImage" alt="Preview" class="preview-image" />
      <button class="mobile-btn mobile-btn-sm mobile-btn-secondary mobile-mt-2" @click="clearImage">
        <i class="bi bi-x-circle"></i>
        {{ $t('view.mobile.scan.simpleScannerRemoveBtn') }}
      </button>
    </div>

    <!-- Processing Status -->
    <div v-if="isProcessing" class="processing-section mobile-mt-3">
      <div class="mobile-loading">
        <div class="spinner"></div>
        <p class="loading-text">{{ $t('view.mobile.scan.simpleScannerReadingText') }}</p>
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
          this.errorMessage = this.$t('view.mobile.scan.simpleScannerErrNoQr')
        }
      } catch {
        this.errorMessage = this.$t('view.mobile.scan.simpleScannerErrReadFail')
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
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  padding: 32px var(--sp-xl);
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .capture-icon {
    width: 100px;
    height: 100px;
    margin: 0 auto var(--sp-lg);
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
    margin-bottom: var(--sp-xl);
  }

  .capture-note {
    font-size: 0.9rem;
    color: #999;
    margin: var(--sp-lg) 0 0 0;
  }
}

.preview-section {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  padding: var(--sp-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .preview-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
    margin: 0 0 var(--sp-md) 0;
  }

  .preview-image {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: var(--radius-md);
    border: 2px solid var(--color-border);
  }
}

.processing-section {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  padding: var(--sp-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.scanner-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-lg);
  background: var(--color-highlight-bg);
  border: 1px solid var(--base-warning);
  border-radius: var(--radius-md);

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
