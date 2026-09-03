<!--
  BarcodeGeneric — render CODE128 (หรือ format อื่นที่ JsBarcode รองรับ) ลง <svg>
  ห่อ JsBarcode + fallback message เมื่อ value ว่าง/format ไม่รองรับค่านั้น (กัน component พังทั้งหน้า)

  ตัวอย่างการใช้งาน:
  <BarcodeGeneric ref="barcodeRef" :value="stockNumber" />
  <BarcodeGeneric :value="code" :height="60" :displayValue="false" />

  Props:
    value         — String, ค่าที่จะ encode (required ในทางปฏิบัติ)
    format        — 'CODE128' (default) หรือ format อื่นที่ JsBarcode รองรับ
    width         — ความกว้างเส้น (default 2)
    height        — ความสูงแถบ (default 80)
    displayValue  — โชว์ตัวเลขใต้แถบ (default true)
    margin        — margin รอบแถบ (default 10)

  Methods (เรียกผ่าน ref):
    toPngDataUrl() — คืน Promise<string> เป็น PNG data URL (พื้นหลังขาว)
-->
<template>
  <div class="barcode-generic">
    <svg v-show="!hasError" ref="svgEl"></svg>
    <div v-if="hasError" class="barcode-generic__error">
      {{ $t('common.label.barcodeInvalid') }}
    </div>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode'

export default {
  name: 'BarcodeGeneric',

  props: {
    value: {
      type: String,
      default: ''
    },
    format: {
      type: String,
      default: 'CODE128'
    },
    width: {
      type: Number,
      default: 2
    },
    height: {
      type: Number,
      default: 80
    },
    displayValue: {
      type: Boolean,
      default: true
    },
    margin: {
      type: Number,
      default: 10
    }
  },

  data() {
    return {
      hasError: false
    }
  },

  watch: {
    value: 'scheduleRender',
    format: 'scheduleRender',
    width: 'scheduleRender',
    height: 'scheduleRender',
    displayValue: 'scheduleRender',
    margin: 'scheduleRender'
  },

  mounted() {
    this.scheduleRender()
  },

  methods: {
    scheduleRender() {
      this.$nextTick(() => this.render())
    },

    render() {
      if (!this.$refs.svgEl || !this.value) {
        this.hasError = true
        return
      }

      try {
        JsBarcode(this.$refs.svgEl, this.value, {
          format: this.format,
          width: this.width,
          height: this.height,
          displayValue: this.displayValue,
          margin: this.margin
        })
        this.hasError = false
      } catch {
        this.hasError = true
      }
    },

    toPngDataUrl() {
      return new Promise((resolve, reject) => {
        const svgEl = this.$refs.svgEl
        if (!svgEl || this.hasError) {
          reject(new Error('barcode not ready'))
          return
        }

        const svgData = new XMLSerializer().serializeToString(svgEl)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)
        const img = new Image()

        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth || svgEl.clientWidth || 300
          canvas.height = img.naturalHeight || svgEl.clientHeight || 100

          const ctx = canvas.getContext('2d')
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)

          URL.revokeObjectURL(url)
          resolve(canvas.toDataURL('image/png'))
        }

        img.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error('failed to load barcode image'))
        }

        img.src = url
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.barcode-generic {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  svg {
    max-width: 100%;
  }

  &__error {
    color: var(--base-red);
    font-size: var(--fs-sm);
    padding: var(--sp-md);
    text-align: center;
  }
}
</style>
