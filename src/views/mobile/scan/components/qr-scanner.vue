<template>
  <div class="qr-scanner-wrapper">
    <!-- Scanner Container -->
    <div id="qr-reader"></div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="scanner-error">
      <i class="bi bi-exclamation-triangle"></i>
      <p class="error-text">{{ errorMessage }}</p>
      <p v-if="debugInfo" class="debug-info">{{ debugInfo }}</p>
    </div>
  </div>
</template>

<script>
import { Html5QrcodeScanner } from 'html5-qrcode'

export default {
  name: 'QrScanner',

  data() {
    return {
      html5QrcodeScanner: null,
      errorMessage: '',
      debugInfo: ''
    }
  },

  methods: {
    onScanSuccess(decodedText, decodedResult) {
      console.log('Scan success:', decodedText)

      // Emit scan result to parent
      this.$emit('scan', decodedText, decodedResult)

      // Clear scanner after successful scan
      if (this.html5QrcodeScanner) {
        this.html5QrcodeScanner.clear()
      }
    },

    onScanError() {
      // This is called when scan fails
      // We don't show error for every failed scan attempt
      // Only log to console for debugging
    }
  },

  mounted() {
    try {
      // Check if HTTPS or localhost
      const isSecureContext = window.isSecureContext
      const protocol = window.location.protocol
      const hostname = window.location.hostname

      this.debugInfo = `Protocol: ${protocol}, Host: ${hostname}, Secure: ${isSecureContext}`

      if (!isSecureContext && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        this.errorMessage =
          'กล้องทำงานได้เฉพาะ HTTPS หรือ localhost เท่านั้น\n' +
          'กรุณาเข้าใช้งานผ่าน:\n' +
          '- https://... (สำหรับ production)\n' +
          '- http://localhost:... (สำหรับ development)'
        return
      }

      // Initialize Html5QrcodeScanner
      this.html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: 250,
          aspectRatio: 1.0,
          // Prefer back camera on mobile
          videoConstraints: {
            facingMode: 'environment'
          }
        },
        false // verbose logging
      )

      // Render the scanner
      this.html5QrcodeScanner.render(this.onScanSuccess, this.onScanError)

      console.log('Html5QrcodeScanner initialized successfully')
    } catch (err) {
      console.error('Error initializing scanner:', err)
      this.errorMessage =
        `ไม่สามารถเริ่มต้น Scanner ได้\n\n` +
        `ข้อผิดพลาด: ${err.message || err}\n\n` +
        `กรุณาตรวจสอบ:\n` +
        `1. เข้าใช้งานผ่าน HTTPS หรือ localhost\n` +
        `2. อนุญาตการเข้าถึงกล้องในเบราว์เซอร์`
    }
  },

  beforeUnmount() {
    // Clean up when component is destroyed
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
@import '@/assets/scss/responsive-style/mobile';

.qr-scanner-wrapper {
  width: 100%;
}

// QR Reader (built-in UI from html5-qrcode)
#qr-reader {
  width: 100%;
  border: none;

  // Override default styles from html5-qrcode
  :deep(video) {
    border-radius: 12px;
    width: 100% !important;
  }

  :deep(#qr-shaded-region) {
    border: none !important;
  }

  // Style the built-in buttons
  :deep(button) {
    background: var(--base-font-color) !important;
    color: white !important;
    border: none !important;
    padding: 12px 24px !important;
    border-radius: 8px !important;
    font-size: 1rem !important;
    font-weight: 500 !important;
    cursor: pointer !important;
    margin: 8px 4px !important;

    &:hover {
      opacity: 0.9 !important;
    }
  }

  // Style the file input section
  :deep(#html5-qrcode-button-file-selection) {
    background: #f0f0f0 !important;
    color: #333 !important;
  }

  // Style select dropdown
  :deep(select) {
    padding: 8px 12px !important;
    border-radius: 8px !important;
    border: 1px solid #ddd !important;
    font-size: 0.9rem !important;
    margin: 8px 4px !important;
  }
}

// Error Message
.scanner-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  margin-top: 16px;

  i {
    font-size: 2rem;
    color: #ff9800;
  }

  .error-text {
    margin: 0;
    font-size: 0.9rem;
    color: #856404;
    text-align: left;
    white-space: pre-line;
    width: 100%;
  }

  .debug-info {
    margin: 8px 0 0 0;
    padding: 8px;
    font-size: 0.75rem;
    color: #666;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    font-family: monospace;
    width: 100%;
    word-break: break-all;
  }
}
</style>
