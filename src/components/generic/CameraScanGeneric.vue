<!--
  CameraScanGeneric — กล้องเต็มจอสแกนบาร์โค้ด/QR ทั่วไป (promote จาก showcase-camera-scan.vue
  + torch/visibilitychange/route-watcher จาก pos-scan-fullscreen.vue)

  ตัวอย่างการใช้งาน:
  <CameraScanGeneric :visible="showCamera" @detect="onDetect" @close="showCamera = false" />
  <CameraScanGeneric :visible="showCamera" :hint="$t('view.public.scan.scanningHint')" @detect="onDetect" @close="showCamera = false" />

  Props:
    visible — Boolean, เปิด/ปิดกล้อง
    title   — String (default '' → fallback $t('common.scan.title'))
    hint    — String (default '' → fallback $t('common.scan.hint'))

  Emits: detect(code), close

  หมายเหตุ: ไม่มี logic เฉพาะโดเมน (เพิ่มตะกร้า/ค้นสินค้า) ในตัวนี้ — caller จัดการเองผ่าน @detect
-->
<template>
  <Teleport to="body">
    <div v-if="visible" class="camera-scan-generic">
      <div :id="readerId" class="scan-reader"></div>

      <ButtonGeneric variant="outline" icon="bi-x-lg" class="btn-close-scan" @click="onClose" />

      <div class="scan-overlay">
        <div class="scan-topbar">
          <span class="scan-title">{{ displayTitle }}</span>
        </div>

        <div class="scan-middle">
          <p v-if="cameraState === 'scanning'" class="scan-hint">{{ displayHint }}</p>

          <ButtonGeneric
            v-if="torchAvailable"
            variant="outline"
            icon="bi-lightning-charge-fill"
            :label="$t('common.scan.torch')"
            class="btn-torch"
            :class="{ active: torchOn }"
            @click="toggleTorch"
          />
        </div>
      </div>

      <div v-if="cameraState === 'starting'" class="scan-state-panel">
        <i class="bi bi-arrow-repeat scan-spin"></i>
      </div>

      <div v-if="cameraState === 'error'" class="scan-state-panel">
        <i class="bi bi-camera-video-off scan-error-icon"></i>
        <p class="scan-error-title">{{ $t('common.scan.cameraErrorTitle') }}</p>
        <p class="scan-error-desc">{{ errorMessage }}</p>
        <ButtonGeneric variant="main" icon="bi-x-lg" :label="$t('common.scan.close')" @click="onClose" />
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

// กันยิงรหัสเดิมซ้ำจากเฟรมกล้องต่อเนื่อง (สแกนติดเฟรมเดียวกันหลายสิบครั้งต่อวินาที)
const DEDUP_WINDOW_MS = 1500

export default {
  name: 'CameraScanGeneric',

  components: {
    ButtonGeneric
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    hint: {
      type: String,
      default: ''
    }
  },

  emits: ['detect', 'close'],

  data() {
    return {
      readerId: `camera-scan-generic-reader-${++readerIdCounter}`,
      html5Qrcode: null,
      cameraState: 'idle', // idle | starting | scanning | error
      errorMessage: '',
      torchAvailable: false,
      torchOn: false,
      lastScanCode: '',
      lastScanTime: 0
    }
  },

  computed: {
    displayTitle() {
      return this.title || this.$t('common.scan.title')
    },

    displayHint() {
      return this.hint || this.$t('common.scan.hint')
    }
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.openCamera()
      } else {
        this.stopCamera()
      }
    },

    // เปลี่ยนหน้าขณะกล้องเปิดอยู่ — ปิดกล้องทันที ไม่รอ parent สั่งผ่าน prop
    '$route.fullPath'(newPath, oldPath) {
      if (newPath !== oldPath && this.visible) {
        this.stopCamera()
        this.$emit('close')
      }
    }
  },

  mounted() {
    if (this.visible) this.openCamera()
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  },

  beforeUnmount() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    this.stopCamera()
  },

  methods: {
    // สลับแอป/ปิดจอ — ปล่อยกล้องทันที กลับมาเปิดใหม่อัตโนมัติถ้า overlay ยังเปิดค้างอยู่
    handleVisibilityChange() {
      if (!this.visible) return
      if (document.hidden) {
        this.stopCamera()
      } else if (this.cameraState !== 'scanning') {
        this.openCamera()
      }
    },

    async openCamera() {
      this.cameraState = 'starting'
      this.errorMessage = ''
      this.torchAvailable = false
      this.torchOn = false

      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        this.setError(this.$t('common.scan.cameraErrorNotSupported'))
        return
      }

      await this.$nextTick()

      this.html5Qrcode = new Html5Qrcode(this.readerId, {
        formatsToSupport: SUPPORTED_FORMATS,
        verbose: false,
        experimentalFeatures: { useBarCodeDetectorIfSupported: true }
      })

      // fallback chain: กล้องหลัง (บังคับ) → กล้องหลัง (ไม่บังคับ ให้ browser เลือกได้) → กล้องใดก็ได้จาก device list
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
      this.detectTorch()
    },

    detectTorch() {
      if (!this.html5Qrcode) return
      try {
        const caps = this.html5Qrcode.getRunningTrackCapabilities()
        this.torchAvailable = !!(caps && caps.torch)
      } catch (err) {
        this.torchAvailable = false
      }
    },

    async toggleTorch() {
      if (!this.html5Qrcode || !this.torchAvailable) return
      const next = !this.torchOn
      try {
        await this.html5Qrcode.applyVideoConstraints({ advanced: [{ torch: next }] })
        this.torchOn = next
      } catch (err) {
        // บางอุปกรณ์รายงานว่ารองรับ torch แต่ apply แล้ว fail จริง — เงียบไว้ ไม่ขวางการสแกนต่อ
      }
    },

    classifyError(err) {
      const message = String((err && err.message) || err || '')
      if (/NotAllowedError|PermissionDeniedError|Permission denied/i.test(message)) {
        return this.$t('common.scan.cameraErrorPermission')
      }
      if (/NotFoundError|DevicesNotFoundError/i.test(message)) {
        return this.$t('common.scan.cameraErrorNotFound')
      }
      if (/NotSupportedError|SecurityError|not supported/i.test(message)) {
        return this.$t('common.scan.cameraErrorNotSupported')
      }
      return this.$t('common.scan.cameraErrorGeneric')
    },

    setError(message) {
      this.cameraState = 'error'
      this.errorMessage = message
    },

    // ปิดกล้องให้สนิท — เรียกได้ปลอดภัยแม้กล้องยังไม่เริ่ม/หยุดไปแล้ว (stop() throw กรณีนั้น จับไว้เงียบๆ)
    async stopCamera() {
      const instance = this.html5Qrcode
      this.html5Qrcode = null
      if (instance) {
        try {
          await instance.stop()
        } catch (err) {
          // ไม่ได้กำลังสแกนอยู่แล้ว หรือหยุดไปก่อนหน้านี้แล้ว — ไม่ต้องแจ้งเตือน
        }
      }
      this.cameraState = 'idle'
      this.torchAvailable = false
      this.torchOn = false
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
.camera-scan-generic {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #000;
  overflow: hidden;
}

.scan-reader {
  width: 100%;
  height: 100%;

  // library เซ็ต video width เป็น px ตรงๆ ไม่ตั้ง height — บังคับเต็มจอ cover ด้วย !important
  :deep(video) {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    display: block !important;
  }

  // shading ของ html5-qrcode เอง
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
}

.scan-topbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-sm);
  padding: var(--sp-md) calc(var(--sp-lg) + 48px);
  padding-top: calc(var(--sp-md) + env(safe-area-inset-top, 0px));
}

.scan-title {
  color: var(--on-inverse);
  font-size: var(--fs-lg);
  font-weight: 600;
}

// ปุ่มปิดลอยเหนือทุก state (starting/scanning/error) — ต้องกดปิดได้เสมอไม่ว่ากล้องจะอยู่สถานะไหน
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

  &:active {
    background: var(--overlay-white-strong);
  }
}

.scan-middle {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-lg);
  padding-bottom: calc(var(--sp-xl) + env(safe-area-inset-bottom, 0px));
}

.scan-hint {
  margin: 0;
  color: var(--on-inverse-muted);
  font-size: var(--fs-base);
  text-align: center;
}

.btn-torch {
  background: var(--overlay-white-chip);
  color: var(--on-inverse);
  border: 1px solid var(--overlay-white-solid);

  &.active {
    background: var(--base-warning);
    border-color: var(--base-warning);
    color: #1a1200;
  }
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
  animation: camera-scan-spin 0.8s linear infinite;
}

.scan-error-icon {
  font-size: 2.5rem;
  color: var(--base-warning);
  margin-bottom: var(--sp-sm);
}

.scan-error-title {
  margin: 0;
  color: var(--on-inverse);
  font-size: var(--fs-lg);
  font-weight: 700;
}

.scan-error-desc {
  margin: 0 0 var(--sp-md);
  color: var(--on-inverse-muted);
  font-size: var(--fs-base);
  max-width: 320px;
}

@keyframes camera-scan-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
