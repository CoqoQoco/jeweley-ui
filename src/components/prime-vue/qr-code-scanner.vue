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
import { Html5QrcodeScanner } from 'html5-qrcode'

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
      scannerId: `qr-reader-${++scannerIdCounter}`
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
    }
  },

  mounted() {
    try {
      const isSecureContext = window.isSecureContext
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      this.debugInfo = `Protocol: ${protocol}, Host: ${hostname}, Secure: ${isSecureContext}`

      this.html5QrcodeScanner = new Html5QrcodeScanner(this.scannerId, {
        fps: this.fps,
        qrbox: { width: this.qrboxWidth, height: this.qrboxHeight }
      })

      this.html5QrcodeScanner.render(this.onScanSuccess)
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
// html5-qrcode injects inline:
//   border: 1px solid silver; padding: 0px; position: relative;
// ──────────────────────────────────────
.qr-scanner-wrapper > :deep(div) {
  border: none !important;
  padding: 0 !important;
  background: white !important;
}

// ──────────────────────────────────────
// Scan Region (video area)
// ID: ${elementId}__scan_region
// inline: width: 100%; min-height: 100px; text-align: center;
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

// Corner bracket shaders (white scan corners)
.qr-scanner-wrapper :deep(#qr-shaded-region > div) {
  background-color: var(--base-font-color) !important;
}

// ──────────────────────────────────────
// Header message (status bar)
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(div[id$='__header_message']) {
  font-size: 0.85rem !important;
  padding: 8px 12px !important;
  margin: 0 !important;
  border-top: none !important;
  border-bottom: 1px solid #f0f0f0 !important;
}

// ──────────────────────────────────────
// Library info icon (top-right "i" icon)
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(img[alt='Info']) {
  display: none !important;
}

// ──────────────────────────────────────
// Dashboard (full controls wrapper)
// ID: ${elementId}__dashboard
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(div[id$='__dashboard']) {
  width: 100% !important;
  background: #f8f9fa !important;
  border-top: 1px solid #f0f0f0;
}

// Dashboard Section (inner controls)
// ID: ${elementId}__dashboard_section
// inline: width: 100%; padding: 10px 0px; text-align: left;
.qr-scanner-wrapper :deep(div[id$='__dashboard_section']) {
  padding: 16px !important;
  text-align: center !important;
}

// ──────────────────────────────────────
// Camera Selection Panel
// ID: ${elementId}__dashboard_section_csr
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(div[id$='__dashboard_section_csr']) {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 12px !important;
  text-align: center !important;
}

// Camera label + select container (span wrapping select)
.qr-scanner-wrapper :deep(span:has(> #html5-qrcode-select-camera)) {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  gap: 6px !important;
  width: 100% !important;
  margin: 0 !important;
  font-size: 0.8rem !important;
  font-weight: 500 !important;
  color: #666 !important;
}

// Camera select dropdown
.qr-scanner-wrapper :deep(#html5-qrcode-select-camera) {
  display: block !important;
  width: 100% !important;
  padding: 10px 12px !important;
  border-radius: 8px !important;
  border: 1px solid #e0e0e0 !important;
  font-size: 0.85rem !important;
  color: #333 !important;
  background: white !important;
  margin: 0 !important;
  outline: none !important;
  cursor: pointer !important;
  appearance: auto !important;

  &:focus {
    border-color: var(--base-font-color) !important;
    box-shadow: 0 0 0 2px rgba(146, 19, 19, 0.1);
  }
}

// Action buttons container (span wrapping start/stop/torch)
.qr-scanner-wrapper :deep(span:has(> #html5-qrcode-button-camera-start)) {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
  gap: 8px !important;
  width: 100% !important;
}

// ──────────────────────────────────────
// Buttons
// ──────────────────────────────────────

// Base button style (all .html5-qrcode-element buttons)
.qr-scanner-wrapper :deep(button.html5-qrcode-element) {
  background: var(--base-font-color) !important;
  color: white !important;
  border: none !important;
  padding: 10px 20px !important;
  border-radius: 8px !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  margin: 0 !important;
  opacity: 1 !important;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.85 !important;
  }
}

// Request camera permission button (full width)
.qr-scanner-wrapper :deep(#html5-qrcode-button-camera-permission) {
  width: 100% !important;
  padding: 12px 20px !important;
}

// Start scanning button (primary - grows to fill)
.qr-scanner-wrapper :deep(#html5-qrcode-button-camera-start) {
  flex: 1 !important;
  min-width: 0 !important;
}

// Stop scanning button (danger style)
.qr-scanner-wrapper :deep(#html5-qrcode-button-camera-stop) {
  flex: 1 !important;
  min-width: 0 !important;
  background: var(--base-red) !important;
}

// Torch button (outline style)
.qr-scanner-wrapper :deep(#html5-qrcode-button-torch) {
  background: white !important;
  color: var(--base-font-color) !important;
  border: 1px solid var(--base-font-color) !important;
  margin-left: 0 !important;
  flex-shrink: 0 !important;
}

// Button - File selection (secondary)
.qr-scanner-wrapper :deep(#html5-qrcode-button-file-selection) {
  background: white !important;
  color: #333 !important;
  border: 1px solid #e0e0e0 !important;
  width: 100% !important;

  &:active {
    background: #f0f0f0 !important;
  }
}

// ──────────────────────────────────────
// Zoom Slider
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(div:has(> #html5-qrcode-input-range-zoom)) {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  padding: 4px 0 !important;
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

// Zoom text label ("1x zoom")
.qr-scanner-wrapper :deep(div:has(> #html5-qrcode-input-range-zoom) > span) {
  font-size: 0.75rem !important;
  color: #999 !important;
  white-space: nowrap !important;
  margin: 0 !important;
}

// ──────────────────────────────────────
// Scan type switch link
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(#html5-qrcode-anchor-scan-type-change) {
  color: var(--base-font-color) !important;
  font-size: 0.85rem !important;
  text-decoration: none !important;
  padding: 8px 16px !important;
  display: inline-block !important;
  cursor: pointer !important;
  border: 1px solid var(--base-font-color) !important;
  border-radius: 8px !important;
  transition: all 0.2s ease;

  &:active {
    background: rgba(146, 19, 19, 0.05);
    transform: scale(0.98);
  }
}

// Switch container (center alignment)
.qr-scanner-wrapper :deep(div:has(> #html5-qrcode-anchor-scan-type-change)) {
  text-align: center !important;
  padding-top: 12px !important;
  margin-top: 12px !important;
  border-top: 1px solid #f0f0f0;
}

// ──────────────────────────────────────
// File selection area (drag & drop zone)
// ──────────────────────────────────────
.qr-scanner-wrapper :deep(div:has(> label > #html5-qrcode-button-file-selection)) {
  border: 2px dashed #e0e0e0 !important;
  border-radius: 8px !important;
  padding: 16px !important;
  margin: 0 !important;
  max-width: 100% !important;
  width: 100% !important;
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
