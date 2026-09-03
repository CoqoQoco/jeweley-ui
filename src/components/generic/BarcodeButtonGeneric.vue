<!--
  BarcodeButtonGeneric — ปุ่ม icon-only เปิด modal แสดงบาร์โค้ด CODE128 ของค่าที่ส่งมา
  พร้อมปุ่มดาวน์โหลด PNG และพิมพ์ — ทำงานฝั่ง client ล้วนด้วย jsbarcode (ไม่พึ่ง Zebra print service)

  ตัวอย่างการใช้งาน:
  <BarcodeButtonGeneric :value="data.stockNumber" :title="$t('common.btn.genBarcode')" />

  Props:
    value    — String, โค้ดที่จะทำบาร์โค้ด — ปุ่ม disabled อัตโนมัติเมื่อว่าง/null
    title    — String, tooltip ปุ่ม (ถ้าไม่ส่งใช้ default $t)
    disabled — Boolean, บังคับ disabled เพิ่มเติม
-->
<template>
  <div class="barcode-button-generic">
    <ButtonGeneric
      variant="plain"
      icon="bi-upc"
      :disabled="isDisabled"
      :title="buttonTitle"
      @click="isShowModal = true"
    />

    <modal
      :showModal="isShowModal"
      width="520px"
      :clickToClose="true"
      :isShowActionPart="true"
      @closeModal="isShowModal = false"
    >
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ $t('common.label.barcode') }}</span>
      </template>
      <template #content>
        <div class="p-3 barcode-button-generic__content">
          <BarcodeGeneric ref="barcodeRef" :value="value" />
        </div>
      </template>
      <template #action>
        <ButtonGeneric variant="main" icon="bi-download" :label="$t('common.btn.downloadPng')" @click="onDownload" />
        <ButtonGeneric variant="outline" icon="bi-printer" :label="$t('common.btn.print')" class="ml-2" @click="onPrint" />
        <ButtonGeneric variant="outline" :label="$t('common.btn.close')" class="ml-2" @click="isShowModal = false" />
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { warning } from '@/services/alert/sweetAlerts.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BarcodeGeneric from '@/components/generic/BarcodeGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'BarcodeButtonGeneric',

  components: {
    modal,
    ButtonGeneric,
    BarcodeGeneric
  },

  props: {
    value: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isShowModal: false
    }
  },

  computed: {
    isDisabled() {
      return this.disabled || !this.value
    },

    buttonTitle() {
      return this.title || this.$t('common.btn.genBarcode')
    }
  },

  methods: {
    async onDownload() {
      const barcodeRef = this.$refs.barcodeRef
      if (!barcodeRef) return

      try {
        const pngDataUrl = await barcodeRef.toPngDataUrl()
        const link = document.createElement('a')
        link.href = pngDataUrl
        link.download = `${this.value}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch {
        warning(this.$t('common.label.barcodeInvalid'))
      }
    },

    async onPrint() {
      const barcodeRef = this.$refs.barcodeRef
      if (!barcodeRef) return

      let pngDataUrl
      try {
        pngDataUrl = await barcodeRef.toPngDataUrl()
      } catch {
        warning(this.$t('common.label.barcodeInvalid'))
        return
      }

      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      document.body.appendChild(iframe)

      const cleanup = () => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe)
        }
      }

      const doc = iframe.contentWindow.document
      doc.open()
      doc.write(
        `<html><head><title>${this.value}</title></head>` +
          '<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;">' +
          `<img id="barcode-print-img" src="${pngDataUrl}" style="max-width:100%;" />` +
          '</body></html>'
      )
      doc.close()

      const imgEl = doc.getElementById('barcode-print-img')
      const startPrint = () => {
        iframe.contentWindow.onafterprint = cleanup
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
        setTimeout(cleanup, 2000)
      }

      if (imgEl.complete && imgEl.naturalWidth > 0) {
        startPrint()
      } else {
        imgEl.onload = startPrint
        imgEl.onerror = cleanup
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.barcode-button-generic {
  display: inline-flex;

  &__content {
    display: flex;
    justify-content: center;
  }
}
</style>
