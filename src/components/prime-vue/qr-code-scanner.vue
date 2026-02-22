<template>
  <div class="qr-scanner-wrapper">
    <!-- Scanner Container -->
    <div :id="scannerId"></div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="scanner-error">
      <i class="bi bi-exclamation-triangle"></i>
      <p class="error-text">{{ errorMessage }}</p>
      <p v-if="showDebugInfo && debugInfo" class="debug-info">{{ debugInfo }}</p>
    </div>
  </div>
</template>

<script>
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'

let scannerIdCounter = 0

export default {
  name: 'QrCodeScanner',

  props: {
    fps: {
      type: Number,
      default: 10
    },
    qrboxWidth: {
      type: Number,
      default: 300
    },
    qrboxHeight: {
      type: Number,
      default: 150
    },
    clearOnScan: {
      type: Boolean,
      default: true
    },
    showDebugInfo: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      html5QrcodeScanner: null,
      errorMessage: '',
      debugInfo: '',
      scannerId: `qr-reader-${++scannerIdCounter}`,
      uiObserver: null
    }
  },

  methods: {
    onScanSuccess(decodedText, decodedResult) {
      this.$emit('scan', decodedText, decodedResult)

      if (this.clearOnScan && this.html5QrcodeScanner) {
        this.html5QrcodeScanner.clear()
      }
    },

    restart() {
      if (this.html5QrcodeScanner) {
        this.html5QrcodeScanner.clear()
        this.html5QrcodeScanner.render(this.onScanSuccess)
      }
    },

    setButtonTitles() {
      const container = document.getElementById(this.scannerId)
      if (!container) return

      const titles = {
        'html5-qrcode-button-camera-permission': 'เปิดกล้อง',
        'html5-qrcode-button-camera-start': 'เริ่มสแกน',
        'html5-qrcode-button-camera-stop': 'หยุดสแกน',
        'html5-qrcode-button-torch': 'เปิด/ปิดไฟฉาย',
        'html5-qrcode-anchor-scan-type-change': 'สแกนจากไฟล์'
      }

      Object.entries(titles).forEach(([id, title]) => {
        const el = container.querySelector(`#${id}`)
        if (el && !el.dataset.titled) {
          el.title = title
          el.dataset.titled = 'true'
        }
      })
    },

    autoStartScanning() {
      const container = document.getElementById(this.scannerId)
      if (!container) return

      const startBtn = container.querySelector('#html5-qrcode-button-camera-start')
      if (startBtn && !startBtn.dataset.autoStarted) {
        startBtn.dataset.autoStarted = 'true'
        startBtn.click()
      }
    }
  },

  mounted() {
    try {
      const isSecureContext = window.isSecureContext
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      this.debugInfo = `Protocol: ${protocol}, Host: ${hostname}, Secure: ${isSecureContext}`

      this.html5QrcodeScanner = new Html5QrcodeScanner(this.scannerId, {
        fps: 15,
        qrbox: { width: 280, height: 120 },
        rememberLastUsedCamera: true,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E
        ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        disableFlip: true,
        videoConstraints: {
          facingMode: { exact: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      this.html5QrcodeScanner.render(this.onScanSuccess)

      // Set tooltips + auto-start after render + observe for re-renders
      this.$nextTick(() => {
        this.setButtonTitles()
        this.autoStartScanning()
      })

      const container = document.getElementById(this.scannerId)
      if (container) {
        let debounceTimer = null
        this.uiObserver = new MutationObserver(() => {
          clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => {
            this.setButtonTitles()
            this.autoStartScanning()
          }, 150)
        })
        this.uiObserver.observe(container, { childList: true, subtree: true })
      }
    } catch (err) {
      this.errorMessage =
        `ไม่สามารถเริ่มต้น Scanner ได้\n\n` +
        `ข้อผิดพลาด: ${err.message || err}\n\n` +
        `กรุณาตรวจสอบ:\n` +
        `1. เข้าใช้งานผ่าน HTTPS หรือ localhost\n` +
        `2. อนุญาตการเข้าถึงกล้องในเบราว์เซอร์`
      this.$emit('error', err)
    }
  },

  beforeUnmount() {
    if (this.uiObserver) {
      this.uiObserver.disconnect()
    }
    if (this.html5QrcodeScanner) {
      try {
        this.html5QrcodeScanner.clear()
      } catch (err) {
        console.error('Error clearing scanner:', err)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// ──────────────────────────────────────
// Scanner Wrapper (parent card)
// ──────────────────────────────────────
.qr-scanner-wrapper {
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

// ──────────────────────────────────────
// Library Container Override
// ──────────────────────────────────────
.qr-scanner-wrapper > :deep(div) {
  border: none !important;
  padding: 0 !important;
  background: white !important;
}

// ──────────────────────────────────────
// Scan Region (video area)
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(video) {
  width: 100% !important;
  display: block !important;
  object-fit: cover !important;
}

// ──────────────────────────────────────
// Shaded Region (dark overlay around qrbox)
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(#qr-shaded-region) {
  border-color: rgba(0, 0, 0, 0.5) !important;
}

// Corner bracket shaders
.qr-scanner-wrapper :deep(#qr-shaded-region > div) {
  background-color: var(--base-font-color) !important;
}

// ──────────────────────────────────────
// Header message — hide for compact UI
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(div[id$='__header_message']) {
  display: none !important;
}

// ──────────────────────────────────────
// Library info icon — hide
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(img[alt='Info']) {
  display: none !important;
}

// ──────────────────────────────────────
// Dashboard (controls wrapper) — compact
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(div[id$='__dashboard']) {
  width: 100% !important;
  background: #f8f9fa !important;
  border-top: 1px solid #f0f0f0;
}

.qr-scanner-wrapper :deep(div[id$='__dashboard_section']) {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 10px 14px !important;
}

// ──────────────────────────────────────
// Camera Selection Panel — same row as scan type switch
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(div[id$='__dashboard_section_csr']) {
  flex: 1 !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 8px !important;
  min-width: 0 !important;
}

// Camera label span — hide text, show icon
.qr-scanner-wrapper :deep(span:has(> #html5-qrcode-select-camera)) {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 8px !important;
  flex: 1 !important;
  min-width: 0 !important;
  margin: 0 !important;
  font-size: 0 !important;
  color: transparent !important;

  &::before {
    font-family: 'bootstrap-icons' !important;
    content: '\f21c' !important; // bi-camera-video-fill
    font-size: 1.1rem !important;
    color: #666 !important;
    flex-shrink: 0;
  }
}

// Camera select dropdown — compact
.qr-scanner-wrapper :deep(#html5-qrcode-select-camera) {
  display: block !important;
  flex: 1 !important;
  width: auto !important;
  min-width: 0 !important;
  padding: 8px 10px !important;
  border-radius: 8px !important;
  border: 1px solid #e0e0e0 !important;
  font-size: 0.8rem !important;
  color: #333 !important;
  background: white !important;
  margin: 0 !important;
  outline: none !important;
  cursor: pointer !important;
  appearance: auto !important;

  &:focus {
    border-color: var(--base-font-color) !important;
  }
}

// ──────────────────────────────────────
// Hide Start/Stop buttons — camera auto-starts, always on
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(span:has(> #html5-qrcode-button-camera-start)),
.qr-scanner-wrapper :deep(span:has(> #html5-qrcode-button-camera-stop)) {
  display: none !important;
}

// ──────────────────────────────────────
// Buttons — Icon-only circular (base)
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(button.html5-qrcode-element) {
  font-size: 0 !important;
  color: transparent !important;
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  border-radius: 50% !important;
  padding: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: none !important;
  cursor: pointer !important;
  margin: 0 !important;
  opacity: 1 !important;
  transition: all 0.2s ease;
  background: var(--base-font-color) !important;
  flex: 0 0 auto !important;

  &:active {
    transform: scale(0.92);
    opacity: 0.85 !important;
  }
}

// ──────────────────────────────────────
// Permission button — full width, icon + text
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(#html5-qrcode-button-camera-permission) {
  width: 100% !important;
  height: auto !important;
  border-radius: 10px !important;
  padding: 14px 20px !important;
  flex: 1 1 auto !important;

  &::before {
    font-family: 'bootstrap-icons' !important;
    content: '\f21c' !important; // bi-camera-video-fill
    font-size: 1.2rem !important;
    color: white !important;
    margin-right: 8px;
  }

  &::after {
    content: 'เปิดกล้อง' !important;
    font-size: 0.95rem !important;
    font-weight: 500 !important;
    color: white !important;
  }
}

// Start/Stop buttons — hidden (auto-start, always on)
.qr-scanner-wrapper :deep(#html5-qrcode-button-camera-start),
.qr-scanner-wrapper :deep(#html5-qrcode-button-camera-stop) {
  display: none !important;
}

// ──────────────────────────────────────
// Torch button — lightning icon (outline)
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(#html5-qrcode-button-torch) {
  background: white !important;
  border: 1.5px solid var(--base-font-color) !important;

  &::before {
    font-family: 'bootstrap-icons' !important;
    content: '\f46e' !important; // bi-lightning-fill
    font-size: 1.2rem !important;
    color: var(--base-font-color) !important;
  }
}

// ──────────────────────────────────────
// File selection button — icon + text, compact
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(#html5-qrcode-button-file-selection) {
  width: auto !important;
  height: auto !important;
  border-radius: 10px !important;
  padding: 10px 18px !important;
  background: white !important;
  border: 1px solid #e0e0e0 !important;
  flex: 1 1 auto !important;

  &::before {
    font-family: 'bootstrap-icons' !important;
    content: '\f3d8' !important; // bi-folder2-open
    font-size: 1rem !important;
    color: #555 !important;
    margin-right: 6px;
  }

  &::after {
    content: 'เลือกไฟล์' !important;
    font-size: 0.85rem !important;
    font-weight: 500 !important;
    color: #555 !important;
  }

  &:active {
    background: #f0f0f0 !important;
  }
}

// ──────────────────────────────────────
// File selection area (drag & drop zone) — compact
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(div:has(> label > #html5-qrcode-button-file-selection)) {
  border: 2px dashed #e0e0e0 !important;
  border-radius: 10px !important;
  padding: 14px !important;
  margin: 0 !important;
  max-width: 100% !important;
  width: 100% !important;
}

// ──────────────────────────────────────
// Scan type switch — file icon, same row as camera select
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(div:has(> #html5-qrcode-anchor-scan-type-change)) {
  font-size: 0 !important;
  border-top: none !important;
  margin-top: 0 !important;
  padding-top: 0 !important;
  flex-shrink: 0 !important;
}

// Hide ⦵ span icon before the anchor
.qr-scanner-wrapper :deep(div:has(> #html5-qrcode-anchor-scan-type-change) > span) {
  display: none !important;
}

.qr-scanner-wrapper :deep(#html5-qrcode-anchor-scan-type-change) {
  font-size: 0 !important;
  color: transparent !important;
  text-decoration: none !important;
  width: 40px !important;
  height: 40px !important;
  border-radius: 10px !important;
  padding: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  border: 1.5px solid #e0e0e0 !important;
  background: white !important;
  transition: all 0.2s ease;

  &::before {
    font-family: 'bootstrap-icons' !important;
    content: '\f42a' !important; // bi-image (scan from file)
    font-size: 1.1rem !important;
    color: #666 !important;
  }

  &:active {
    background: #f0f0f0 !important;
    transform: scale(0.92);
  }
}

// ──────────────────────────────────────
// Zoom Slider — compact
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(div:has(> #html5-qrcode-input-range-zoom)) {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  padding: 2px 0 !important;
}

.qr-scanner-wrapper :deep(#html5-qrcode-input-range-zoom) {
  flex: 1 !important;
  height: 4px !important;
  background: #e0e0e0 !important;
  border-radius: 2px !important;
  outline: none !important;
  opacity: 1 !important;
  accent-color: var(--base-font-color);
}

// Zoom text label
.qr-scanner-wrapper :deep(div:has(> #html5-qrcode-input-range-zoom) > span) {
  font-size: 0.7rem !important;
  color: #999 !important;
  white-space: nowrap !important;
  margin: 0 !important;
}

// ──────────────────────────────────────
// Error Message
// ──────────────────────────────────────
.scanner-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  margin: 12px;
  background: rgba(250, 188, 63, 0.1);
  border: 1px solid var(--base-warning);
  border-radius: 8px;

  i {
    font-size: 1.5rem;
    color: var(--base-warning);
  }

  .error-text {
    margin: 0;
    font-size: 0.85rem;
    color: #666;
    text-align: left;
    white-space: pre-line;
    width: 100%;
    line-height: 1.5;
  }

  .debug-info {
    margin: 4px 0 0 0;
    padding: 8px 12px;
    font-size: 0.75rem;
    color: #999;
    background: #f8f9fa;
    border-radius: 6px;
    font-family: monospace;
    width: 100%;
    word-break: break-all;
  }
}
</style>
