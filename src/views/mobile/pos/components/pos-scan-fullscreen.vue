<template>
  <Teleport to="body">
    <div v-if="visible" class="pos-scan-fullscreen">
      <div :id="readerId" class="scan-reader"></div>

      <ButtonGeneric variant="outline" icon="bi-x-lg" class="btn-close-scan" @click="onClose" />

      <div class="scan-overlay">
        <div class="scan-topbar">
          <span class="scan-title">{{ $t('view.mobile.pos.scanFullscreenTitle') }}</span>
        </div>

        <div class="scan-middle">
          <p v-if="cameraState === 'scanning'" class="scan-hint">
            {{ $t('view.mobile.pos.scanFullscreenHint') }}
          </p>

          <ButtonGeneric
            v-if="torchAvailable"
            variant="outline"
            icon="bi-lightning-charge-fill"
            :label="$t('view.mobile.pos.torchBtn')"
            class="btn-torch"
            :class="{ active: torchOn }"
            @click="toggleTorch"
          />
        </div>

        <div class="scan-bottom">
          <div class="scan-bottom-row">
            <span class="scan-cart-count">
              {{ $t('view.mobile.pos.scanCartCountLabel', { count: cartItemCount }) }}
            </span>
            <ButtonGeneric variant="main" :label="$t('view.mobile.pos.scanDoneBtn')" @click="onClose" />
          </div>
          <ButtonGeneric
            v-if="cameraState !== 'error'"
            variant="outline"
            :label="$t('view.mobile.pos.scanTypeInsteadBtn')"
            class="btn-type-instead"
            @click="onClose"
          />
        </div>
      </div>

      <div v-if="cameraState === 'starting'" class="scan-state-panel">
        <i class="bi bi-arrow-repeat scan-spin"></i>
      </div>

      <div v-if="cameraState === 'error'" class="scan-state-panel">
        <i class="bi bi-camera-video-off scan-error-icon"></i>
        <p class="scan-error-title">{{ $t('view.mobile.pos.scanCameraErrorTitle') }}</p>
        <p class="scan-error-desc">{{ errorMessage }}</p>
        <ButtonGeneric
          variant="main"
          icon="bi-keyboard"
          :label="$t('view.mobile.pos.scanTypeInsteadBtn')"
          @click="onClose"
        />
      </div>

      <div v-if="toast.show" class="scan-toast" :class="toast.type">
        <i :class="['bi', toastIcon]"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { usePosCartStore } from '@/stores/modules/pos/pos-cart-store.js'

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
// เวลาแสดง toast บนกล้อง — ต้องสั้นพอไม่บังจอนาน (ตามแผน ~1.5 วิ, ให้ error/warning อ่านทันเพิ่มอีกนิด)
const TOAST_DURATION_MS = 1800

export default {
  name: 'PosScanFullscreen',

  components: {
    ButtonGeneric
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close'],

  setup() {
    const productStore = usrStockProductApiStore()
    const posCartStore = usePosCartStore()
    return { productStore, posCartStore }
  },

  data() {
    return {
      readerId: `pos-scan-reader-${++readerIdCounter}`,
      html5Qrcode: null,
      cameraState: 'idle', // idle | starting | scanning | error
      errorMessage: '',
      torchAvailable: false,
      torchOn: false,
      lastScanCode: '',
      lastScanTime: 0,
      isSearching: false,
      toast: {
        show: false,
        type: 'success',
        message: ''
      },
      toastTimer: null
    }
  },

  computed: {
    cartItemCount() {
      return this.posCartStore.cartItemCount()
    },

    toastIcon() {
      if (this.toast.type === 'success') return 'bi-check-circle-fill'
      if (this.toast.type === 'warning') return 'bi-exclamation-triangle-fill'
      return 'bi-x-circle-fill'
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
    clearTimeout(this.toastTimer)
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
        this.setError(this.$t('view.mobile.pos.scanCameraErrorNotSupported'))
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
        return this.$t('view.mobile.pos.scanCameraErrorPermission')
      }
      if (/NotFoundError|DevicesNotFoundError/i.test(message)) {
        return this.$t('view.mobile.pos.scanCameraErrorNotFound')
      }
      if (/NotSupportedError|SecurityError|not supported/i.test(message)) {
        return this.$t('view.mobile.pos.scanCameraErrorNotSupported')
      }
      return this.$t('view.mobile.pos.scanCameraErrorGeneric')
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
      if (!decodedText || this.isSearching) return
      const now = Date.now()
      if (decodedText === this.lastScanCode && now - this.lastScanTime < DEDUP_WINDOW_MS) return
      this.lastScanCode = decodedText
      this.lastScanTime = now
      this.searchAndAddProduct(decodedText)
    },

    // ลองรหัสเก่า (stockNumberOrigin) ก่อนเสมอ — user สแกนป้ายรหัสเก่าเป็นหลักที่หน้างาน
    // ไม่เจอค่อยลองรหัสใหม่ (stockNumber) อัตโนมัติ — ผู้ใช้ไม่ต้องเลือกเอง
    async findProduct(searchValue) {
      const byOriginCode = await this.productStore.fetchDataGet({
        formValue: { stockNumberOrigin: searchValue },
        skipError: true
      })
      if (byOriginCode) return byOriginCode

      return await this.productStore.fetchDataGet({
        formValue: { stockNumber: searchValue },
        skipError: true
      })
    },

    // fetchDataGet ดัก error ไว้เองและคืน undefined ทั้งกรณี "ไม่พบ" และกรณีเน็ตพัง แยกจาก return value ไม่ได้
    // ใช้ navigator.onLine เป็นสัญญาณเดียวที่เช็คได้จากฝั่ง client เพื่อไม่ให้ผู้ใช้เข้าใจผิดว่าสินค้าไม่มีทั้งที่เน็ตหลุด
    statusWarnKey(status) {
      if (status === 'SOLD') return 'view.mobile.pos.warnSoldItem'
      if (status === 'RESERVED') return 'view.mobile.pos.warnReservedItem'
      return 'view.mobile.pos.warnUnavailableItem'
    },

    // ผลลัพธ์เดียวกับ pos-scan-bar.vue (ค้นสินค้า + เพิ่มตะกร้า) แต่แจ้งผลด้วย toast แทน sweetAlerts
    // เพื่อไม่ให้มี dialog บล็อกจอกล้องระหว่างสแกนต่อเนื่อง
    async searchAndAddProduct(searchValue) {
      this.isSearching = true
      const response = await this.findProduct(searchValue)

      if (!response) {
        if (!navigator.onLine) {
          this.showToast('error', this.$t('view.mobile.pos.errorNetworkIssue'))
        } else {
          this.showToast('error', this.$t('view.mobile.pos.errorProductNotFound'))
        }
        this.isSearching = false
        return
      }

      // status อาจไม่มีมาใน response (backend ยังไม่ deploy) — ทำงานเหมือนเดิม (ใส่ตะกร้าได้) ในกรณีนั้น
      if (response.status && response.status !== 'IN_STOCK') {
        this.showToast('warning', this.$t(this.statusWarnKey(response.status)))
        this.isSearching = false
        return
      }

      const costPrice = Number(response.productPrice) || 0
      const tagPriceMultiplier = Number(response.tagPriceMultiplier) || 1
      const tagPrice = costPrice * tagPriceMultiplier

      const result = this.posCartStore.addItem({
        stockNumber: response.stockNumber,
        stockNumberOrigin: response.stockNumberOrigin || '',
        productNumber: response.productNumber || '',
        description: response.productNameTh || response.productNameEn || '',
        costPrice: costPrice,
        price: tagPrice,
        appraisalPrice: tagPrice,
        tagPriceMultiplier: tagPriceMultiplier,
        discountPercent: 0,
        qty: 1,
        materials: response.materials || [],
        imagePath: response.imagePath || ''
      })

      if (!result.success) {
        if (result.reason === 'duplicate') {
          this.showToast('warning', this.$t('view.mobile.pos.warnDuplicateItem'))
        }
        this.isSearching = false
        return
      }

      if (navigator.vibrate) navigator.vibrate(80)
      this.showToast('success', `${this.$t('view.mobile.pos.successAddProduct')} ${response.stockNumber}`)
      this.isSearching = false
    },

    showToast(type, message) {
      clearTimeout(this.toastTimer)
      this.toast = { show: true, type, message }
      this.toastTimer = setTimeout(() => {
        this.toast.show = false
      }, TOAST_DURATION_MS)
    },

    onClose() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.pos-scan-fullscreen {
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

  // shading ของ html5-qrcode เอง (ตัวเดียวกับ qr-scanner เดิม) — ปรับให้เข้มขึ้นสำหรับพื้นเต็มจอ
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
  padding-bottom: var(--sp-xl);
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

.scan-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-lg);
  padding-bottom: calc(var(--sp-lg) + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--overlay-white-solid);
}

.scan-bottom-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
}

.scan-cart-count {
  color: var(--on-inverse);
  font-size: var(--fs-base);
  font-weight: 600;
}

.btn-type-instead {
  border: none;
  background: none;
  color: var(--on-inverse-dim);
  text-decoration: underline;
  padding: var(--sp-xs) var(--sp-sm);
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
  animation: pos-scan-spin 0.8s linear infinite;
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

.scan-toast {
  position: absolute;
  left: 50%;
  bottom: calc(140px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  z-index: 4;
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-sm) var(--sp-lg);
  border-radius: var(--radius-lg);
  color: var(--on-inverse);
  font-size: var(--fs-base);
  font-weight: 600;
  max-width: calc(100vw - var(--sp-xl) * 2);
  text-align: center;
  line-height: var(--lh-sm);
  box-shadow: var(--shadow-md);

  &.success {
    background: var(--base-green);
  }

  &.warning {
    background: var(--base-warning);
    color: #1a1200;
  }

  &.error {
    background: var(--base-red);
  }
}

@keyframes pos-scan-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
