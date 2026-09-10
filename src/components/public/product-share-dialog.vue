<template>
  <modal :showModal="visible" @closeModal="handleClose" width="420px" :isShowActionPart="true">
    <template #title>
      <span class="title-text-lg bi bi-qr-code mr-2"></span>
      <span class="title-text-lg">{{ $t('view.public.share.dialogTitle') }}</span>
    </template>

    <template #content>
      <div class="product-share-dialog__content">
        <imagePreview v-if="qrDataUrl" :src="qrDataUrl" :width="240" :height="240" :preview="false" />

        <div v-if="shareUrl" class="share-url-text">{{ shareUrl }}</div>
      </div>
    </template>

    <template #action>
      <ButtonGeneric
        variant="main"
        icon="bi-clipboard"
        :label="copyLabel"
        :disabled="!shareUrl"
        @click="onCopy"
      />
      <ButtonGeneric
        v-if="canNativeShare"
        variant="outline"
        icon="bi-share"
        :label="$t('view.public.share.shareBtn')"
        class="ml-2"
        :disabled="!shareUrl"
        @click="onShare"
      />
      <ButtonGeneric
        variant="outline"
        icon="bi-box-arrow-up-right"
        :label="$t('view.public.share.openBtn')"
        class="ml-2"
        :disabled="!shareUrl"
        @click="onOpen"
      />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import QRCode from 'qrcode'

import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { buildPublicUrl } from '@/config/public-site-config.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import imagePreview from '@/components/prime-vue/ImagePreview.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'ProductShareDialog',

  components: {
    modal,
    ButtonGeneric,
    imagePreview
  },

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    stockNumber: {
      type: String,
      default: ''
    }
  },

  emits: ['update:visible'],

  data() {
    return {
      shareUrl: '',
      qrDataUrl: '',
      justCopied: false
    }
  },

  computed: {
    canNativeShare() {
      return !!navigator.share
    },

    copyLabel() {
      return this.justCopied ? this.$t('view.public.share.copiedLabel') : this.$t('view.public.share.copyBtn')
    }
  },

  watch: {
    visible: {
      handler(val) {
        if (val && this.stockNumber) {
          this.loadShareLink()
        } else if (!val) {
          this.shareUrl = ''
          this.qrDataUrl = ''
          this.justCopied = false
        }
      },
      immediate: true
    }
  },

  methods: {
    async loadShareLink() {
      const res = await this.productStore.fetchPublicLink(this.stockNumber)
      if (!res?.path) return

      this.shareUrl = buildPublicUrl(res.path)
      this.qrDataUrl = await QRCode.toDataURL(this.shareUrl, { width: 240, margin: 1 })
    },

    async onCopy() {
      if (!this.shareUrl) return
      try {
        await navigator.clipboard.writeText(this.shareUrl)
        this.justCopied = true
        setTimeout(() => {
          this.justCopied = false
        }, 2000)
      } catch {
        // clipboard API ใช้ไม่ได้ (สิทธิ์/เบราว์เซอร์เก่า) — ผู้ใช้ยังคัดลอกจากข้อความใต้ QR เองได้
      }
    },

    async onShare() {
      if (!this.shareUrl) return
      try {
        await navigator.share({ url: this.shareUrl })
      } catch {
        // ผู้ใช้กดยกเลิก share sheet — ไม่ต้องแจ้งเตือนอะไร
      }
    },

    onOpen() {
      if (!this.shareUrl) return
      window.open(this.shareUrl, '_blank', 'noopener')
    },

    handleClose() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.product-share-dialog__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-lg);
}

.share-url-text {
  width: 100%;
  text-align: center;
  word-break: break-all;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  padding: var(--sp-sm) var(--sp-md);
  background: var(--color-highlight-bg);
  border-radius: var(--radius-md);
}
</style>
