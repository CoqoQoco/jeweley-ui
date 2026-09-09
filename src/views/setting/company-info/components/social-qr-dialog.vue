<template>
  <modal :showModal="visible" @closeModal="handleClose" width="420px" :isShowActionPart="true">
    <template #title>
      <span class="title-text-lg bi bi-qr-code mr-2"></span>
      <span class="title-text-lg">{{ $t('view.setting.companyInfo.qrDialogTitle') }} {{ channelLabel }}</span>
    </template>

    <template #content>
      <div class="social-qr-dialog__content">
        <imagePreview v-if="qrDataUrl" :src="qrDataUrl" :width="240" :height="240" :preview="false" />

        <div v-if="targetUrl" class="share-url-text">{{ targetUrl }}</div>
      </div>
    </template>

    <template #action>
      <ButtonGeneric
        variant="main"
        icon="bi-download"
        :label="$t('view.setting.companyInfo.qrDownloadBtn')"
        :disabled="!qrDataUrl"
        @click="onDownload"
      />
      <ButtonGeneric
        variant="outline"
        icon="bi-clipboard"
        :label="copyLabel"
        class="ml-2"
        :disabled="!targetUrl"
        @click="onCopy"
      />
      <ButtonGeneric
        variant="outline"
        icon="bi-box-arrow-up-right"
        :label="$t('view.setting.companyInfo.qrOpenBtn')"
        class="ml-2"
        :disabled="!targetUrl"
        @click="onOpen"
      />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import QRCode from 'qrcode'

import { socialUrl } from '@/config/company-info.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import imagePreview from '@/components/prime-vue/ImagePreview.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'SocialQrDialog',

  components: {
    modal,
    ButtonGeneric,
    imagePreview
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    channel: {
      type: String,
      default: ''
    },
    handle: {
      type: String,
      default: ''
    }
  },

  emits: ['update:visible'],

  data() {
    return {
      targetUrl: '',
      qrDataUrl: '',
      justCopied: false
    }
  },

  computed: {
    channelLabel() {
      return this.channel ? this.$t(`view.setting.companyInfo.${this.channel}`) : ''
    },

    copyLabel() {
      return this.justCopied
        ? this.$t('view.setting.companyInfo.qrCopiedLabel')
        : this.$t('view.setting.companyInfo.qrCopyBtn')
    }
  },

  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.loadQrCode()
        } else {
          this.targetUrl = ''
          this.qrDataUrl = ''
          this.justCopied = false
        }
      },
      immediate: true
    }
  },

  methods: {
    async loadQrCode() {
      this.targetUrl = socialUrl(this.channel, this.handle)
      if (!this.targetUrl) return

      this.qrDataUrl = await QRCode.toDataURL(this.targetUrl, { width: 240, margin: 1 })
    },

    onDownload() {
      if (!this.qrDataUrl) return
      const a = document.createElement('a')
      a.href = this.qrDataUrl
      a.download = `qr-${this.channel}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
    },

    async onCopy() {
      if (!this.targetUrl) return
      try {
        await navigator.clipboard.writeText(this.targetUrl)
        this.justCopied = true
        setTimeout(() => {
          this.justCopied = false
        }, 2000)
      } catch {
        // clipboard API ใช้ไม่ได้ (สิทธิ์/เบราว์เซอร์เก่า) — ผู้ใช้ยังคัดลอกจากข้อความใต้ QR เองได้
      }
    },

    onOpen() {
      if (!this.targetUrl) return
      window.open(this.targetUrl, '_blank', 'noopener')
    },

    handleClose() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.social-qr-dialog__content {
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
