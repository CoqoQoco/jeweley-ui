<!--
  showcase-camera-scan — กล้องเต็มจอสำหรับสแกนบาร์โค้ด/QR สินค้าในหน้าจอโชว์ลูกค้า

  หมายเหตุ: ตั้งใจไม่ reuse src/views/mobile/pos/components/pos-scan-fullscreen.vue เพราะไฟล์นั้นผูก
  logic เพิ่มสินค้าเข้าตะกร้า (usePosCartStore) ไว้ในตัวโดยตรง — คัดลอกเฉพาะ constants/แนวทางการสแกน
  (html5-qrcode, SUPPORTED_FORMATS, dedup window) มาปรับใหม่ให้เป็นกล้อง "เปล่า" ที่ emit โค้ดออกไปให้
  หน้า parent จัดการต่อเอง ไม่แตะไฟล์ POS เดิม
-->
<template>
  <Teleport to="body">
    <div v-if="visible" class="showcase-camera-scan">
      <div :id="readerId" class="scan-reader"></div>

      <ButtonGeneric variant="outline" icon="bi-x-lg" class="btn-close-scan" @click="onClose" />

      <div class="scan-overlay">
        <div class="scan-middle">
          <p v-if="cameraState === 'scanning'" class="scan-hint">
            {{ $t('view.public.scan.scanningHint') }}
          </p>
        </div>
      </div>

      <div v-if="cameraState === 'starting'" class="scan-state-panel">
        <i class="bi bi-arrow-repeat scan-spin"></i>
      </div>

      <div v-if="cameraState === 'error'" class="scan-state-panel">
        <i class="bi bi-camera-video-off scan-error-icon"></i>
        <p class="scan-error-desc">{{ errorMessage }}</p>
        <ButtonGeneric variant="main" :label="$t('view.public.scan.closeCameraBtn')" @click="onClose" />
      </div>
    </div>
  </Teleport>
</template>

<script>
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

let readerIdCounter = 0

const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E
]

const START_CONFIG_BASE = {
  fps: 15,
  qrbox: { width: 280, height: 120 },
  disableFlip: true
}

// กันยิงรหัสเดิมซ้ำจากเฟรมกล้องต่อเนื่อง (ค่าเดียวกับ pos-scan-fullscreen.vue)
const DEDUP_WINDOW_MS = 1500

export default {
  name: 'ShowcaseCameraScan',

  components: {
    ButtonGeneric
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  emits: ['detect', 'close'],

  data() {
    return {
      readerId: `showcase-scan-reader-${++readerIdCounter}`,
      html5Qrcode: null,
      cameraState: 'idle', // idle | starting | scanning | error
      errorMessage: '',
      lastScanCode: '',
      lastScanTime: 0
    }
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.openCamera()
      } else {
        this.stopCamera()
      }
    }
  },

  mounted() {
    if (this.visible) this.openCamera()
  },

  beforeUnmount() {
    this.stopCamera()
  },

  methods: {
    async openCamera() {
      this.cameraState = 'starting'
      this.errorMessage = ''

      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        this.setError(this.$t('view.public.scan.cameraErrorNotSupported'))
        return
      }

      await this.$nextTick()

      this.html5Qrcode = new Html5Qrcode(this.readerId, {
        formatsToSupport: SUPPORTED_FORMATS,
        verbose: false,
        experimentalFeatures: { useBarCodeDetectorIfSupported: true }
      })

      // fallback chain เหมือน pos-scan-fullscreen: กล้องหลัง (บังคับ) → กล้องหลัง (ไม่บังคับ) → กล้องใดก็ได้
      let lastError = await this.tryStart({ facingMode: { exact: 'environment' } }, 'exact')
      if (!lastError) return this.onCameraStarted()

      lastError = await this.tryStart({ facingMode: 'environment' }, 'loose')
      if (!lastError) return this.onCameraStarted()

      const cameras = await Html5Qrcode.getCameras().catch((err) => {
        lastError = err
        return []
      })
      if (cameras && cameras.length > 0) {
        lastError = await this.tryStart(cameras[0].id, 'any')
        if (!lastError) return this.onCameraStarted()
      }

      this.setError(this.classifyError(lastError))
    },

    async tryStart(cameraTarget, mode) {
      const videoConstraints =
        mode === 'any'
          ? undefined
          : {
              facingMode: mode === 'exact' ? { exact: 'environment' } : 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
      const config = videoConstraints ? { ...START_CONFIG_BASE, videoConstraints } : { ...START_CONFIG_BASE }

      try {
        await this.html5Qrcode.start(cameraTarget, config, this.onScanSuccess, () => {})
        return null
      } catch (err) {
        return err
      }
    },

    onCameraStarted() {
      this.cameraState = 'scanning'
    },

    classifyError(err) {
      const message = String((err && err.message) || err || '')
      if (/NotAllowedError|PermissionDeniedError|Permission denied/i.test(message)) {
        return this.$t('view.public.scan.cameraErrorPermission')
      }
      if (/NotFoundError|DevicesNotFoundError/i.test(message)) {
        return this.$t('view.public.scan.cameraErrorNotFound')
      }
      if (/NotSupportedError|SecurityError|not supported/i.test(message)) {
        return this.$t('view.public.scan.cameraErrorNotSupported')
      }
      return this.$t('view.public.scan.cameraErrorGeneric')
    },

    setError(message) {
      this.cameraState = 'error'
      this.errorMessage = message
    },

    // ปิดกล้องให้สนิท — เรียกได้ปลอดภัยแม้กล้องยังไม่เริ่ม/หยุดไปแล้ว
    async stopCamera() {
      const instance = this.html5Qrcode
      this.html5Qrcode = null
      if (instance) {
        try {
          await instance.stop()
        } catch {
          // ไม่ได้กำลังสแกนอยู่แล้ว หรือหยุดไปก่อนหน้านี้แล้ว — ไม่ต้องแจ้งเตือน
        }
      }
      this.cameraState = 'idle'
    },

    onScanSuccess(decodedText) {
      if (!decodedText) return
      const now = Date.now()
      if (decodedText === this.lastScanCode && now - this.lastScanTime < DEDUP_WINDOW_MS) return
      this.lastScanCode = decodedText
      this.lastScanTime = now
      this.$emit('detect', decodedText)
    },

    onClose() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.showcase-camera-scan {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #000;
  overflow: hidden;
}

.scan-reader {
  width: 100%;
  height: 100%;

  :deep(video) {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    display: block !important;
  }

  :deep(#qr-shaded-region) {
    border-color: rgba(0, 0, 0, 0.55) !important;
  }

  :deep(#qr-shaded-region > div) {
    background-color: var(--base-font-color) !important;
  }
}

.scan-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: calc(var(--sp-xl) * 2 + env(safe-area-inset-bottom, 0px));
}

.scan-middle {
  display: flex;
  justify-content: center;
}

.scan-hint {
  margin: 0;
  color: var(--on-inverse-muted);
  font-size: var(--fs-base);
  text-align: center;
}

.btn-close-scan {
  position: absolute;
  top: calc(var(--sp-md) + env(safe-area-inset-top, 0px));
  right: var(--sp-lg);
  z-index: 5;
  width: 40px;
  height: 40px;
  min-width: 40px;
  padding: 0;
  border-radius: 50%;
  border: none;
  background: var(--overlay-white-solid);
  color: var(--on-inverse);
}

.scan-state-panel {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-sm);
  padding: var(--sp-xl);
  text-align: center;
  background: #000;
}

.scan-spin {
  font-size: 2rem;
  color: var(--on-inverse);
  animation: showcase-scan-spin 0.8s linear infinite;
}

.scan-error-icon {
  font-size: 2.5rem;
  color: var(--base-warning);
  margin-bottom: var(--sp-sm);
}

.scan-error-desc {
  margin: 0 0 var(--sp-md);
  color: var(--on-inverse-muted);
  font-size: var(--fs-base);
  max-width: 320px;
}

@keyframes showcase-scan-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
