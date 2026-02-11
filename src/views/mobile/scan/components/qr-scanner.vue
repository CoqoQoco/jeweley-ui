<template>
  <div class="qr-scanner-wrapper">
    <!-- Scanner Container -->
    <div v-if="isScanning" class="scanner-container">
      <div id="qr-reader" ref="qrReader"></div>

      <!-- Scanner Overlay -->
      <div class="scanner-overlay">
        <div class="scanner-frame">
          <div class="corner corner-tl"></div>
          <div class="corner corner-tr"></div>
          <div class="corner corner-bl"></div>
          <div class="corner corner-br"></div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="scanner-instructions">
        <p>{{ instructions }}</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="scanner-error">
      <i class="bi bi-exclamation-triangle"></i>
      <p>{{ errorMessage }}</p>
    </div>

    <!-- Control Buttons -->
    <div class="scanner-controls">
      <button
        v-if="!isScanning"
        class="mobile-btn mobile-btn-primary"
        @click="startScanning"
      >
        <i class="bi bi-camera"></i>
        เปิดกล้อง
      </button>
      <button
        v-else
        class="mobile-btn mobile-btn-secondary"
        @click="stopScanning"
      >
        <i class="bi bi-x-circle"></i>
        ปิดกล้อง
      </button>

      <!-- Switch Camera Button (if multiple cameras) -->
      <button
        v-if="isScanning && hasMultipleCameras"
        class="mobile-btn mobile-btn-outline mobile-btn-sm mobile-mt-2"
        @click="switchCamera"
      >
        <i class="bi bi-arrow-repeat"></i>
        สลับกล้อง
      </button>
    </div>
  </div>
</template>

<script>
import { Html5Qrcode } from 'html5-qrcode'

export default {
  name: 'QrScanner',

  data() {
    return {
      html5QrCode: null,
      isScanning: false,
      errorMessage: '',
      instructions: 'วาง QR Code หรือ Barcode ในกรอบ',
      cameras: [],
      currentCameraIndex: 0
    }
  },

  computed: {
    hasMultipleCameras() {
      return this.cameras.length > 1
    }
  },

  methods: {
    async startScanning() {
      this.errorMessage = ''

      try {
        // Get available cameras
        const devices = await Html5Qrcode.getCameras()

        if (!devices || devices.length === 0) {
          this.errorMessage = 'ไม่พบกล้องบนอุปกรณ์นี้'
          return
        }

        this.cameras = devices
        this.currentCameraIndex = 0

        // Initialize scanner
        this.html5QrCode = new Html5Qrcode('qr-reader')

        // Start scanning with back camera (if available) or first camera
        const cameraId = this.getPreferredCamera()

        await this.html5QrCode.start(
          cameraId,
          {
            fps: 10, // Frames per second for scanning
            qrbox: { width: 250, height: 250 }, // Scanner box size
            aspectRatio: 1.0
          },
          this.onScanSuccess,
          this.onScanFailure
        )

        this.isScanning = true
      } catch (err) {
        console.error('Error starting scanner:', err)
        this.errorMessage = 'ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการเข้าถึงกล้องในการตั้งค่าเบราว์เซอร์'
      }
    },

    async stopScanning() {
      if (this.html5QrCode && this.isScanning) {
        try {
          await this.html5QrCode.stop()
          await this.html5QrCode.clear()
          this.isScanning = false
        } catch (err) {
          console.error('Error stopping scanner:', err)
        }
      }
    },

    async switchCamera() {
      if (!this.hasMultipleCameras) return

      await this.stopScanning()

      // Switch to next camera
      this.currentCameraIndex = (this.currentCameraIndex + 1) % this.cameras.length

      await this.startScanning()
    },

    getPreferredCamera() {
      // Try to find back camera (usually better for scanning)
      const backCamera = this.cameras.find(
        (camera) =>
          camera.label.toLowerCase().includes('back') ||
          camera.label.toLowerCase().includes('rear') ||
          camera.label.toLowerCase().includes('environment')
      )

      if (backCamera) {
        return backCamera.id
      }

      // Otherwise use the selected camera
      return this.cameras[this.currentCameraIndex].id
    },

    onScanSuccess(decodedText, decodedResult) {
      // Emit scan result to parent
      this.$emit('scan', decodedText, decodedResult)

      // Stop scanning after successful scan
      this.stopScanning()
    },

    onScanFailure() {
      // This is called when no QR code is detected in frame
      // We don't need to show error here as it's normal
    }
  },

  beforeUnmount() {
    // Clean up when component is destroyed
    this.stopScanning()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.qr-scanner-wrapper {
  width: 100%;
}

.scanner-container {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

// QR Reader (camera feed)
#qr-reader {
  width: 100%;
  border: none;

  // Override default styles from html5-qrcode
  :deep(video) {
    border-radius: 12px;
  }

  :deep(#qr-shaded-region) {
    border: none !important;
  }
}

// Scanner Overlay (decorative frame)
.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scanner-frame {
  position: relative;
  width: 250px;
  height: 250px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;

  .corner {
    position: absolute;
    width: 20px;
    height: 20px;
    border-color: var(--base-font-color);
    border-style: solid;

    &.corner-tl {
      top: -2px;
      left: -2px;
      border-width: 3px 0 0 3px;
      border-radius: 12px 0 0 0;
    }

    &.corner-tr {
      top: -2px;
      right: -2px;
      border-width: 3px 3px 0 0;
      border-radius: 0 12px 0 0;
    }

    &.corner-bl {
      bottom: -2px;
      left: -2px;
      border-width: 0 0 3px 3px;
      border-radius: 0 0 0 12px;
    }

    &.corner-br {
      bottom: -2px;
      right: -2px;
      border-width: 0 3px 3px 0;
      border-radius: 0 0 12px 0;
    }
  }
}

// Scanner Instructions
.scanner-instructions {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  padding: 0 20px;
  pointer-events: none;

  p {
    margin: 0;
    padding: 8px 16px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 20px;
    font-size: 0.9rem;
    display: inline-block;
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
  margin-bottom: 16px;

  i {
    font-size: 2rem;
    color: #ff9800;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #856404;
    text-align: center;
  }
}

// Scanner Controls
.scanner-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
