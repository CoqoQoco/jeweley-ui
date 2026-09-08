<template>
  <div class="showcase-contact">
    <ButtonGeneric
      variant="outline"
      icon="bi-share"
      :label="shareLabel"
      block
      @click="onShare"
    />

    <div class="contact-channels">
      <ButtonGeneric
        v-for="channel in channels"
        :key="channel.key"
        variant="outline"
        :icon="channel.icon"
        :title="$t(channel.labelKey)"
        @click="onOpenChannel(channel.url)"
      />
    </div>
  </div>
</template>

<script>
import PUBLIC_CONTACT_CHANNELS from '@/config/public-contact-config.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'ShowcaseContact',

  components: {
    ButtonGeneric
  },

  props: {
    productName: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      justCopied: false
    }
  },

  computed: {
    channels() {
      return PUBLIC_CONTACT_CHANNELS.filter((channel) => !!channel.url)
    },

    shareLabel() {
      return this.justCopied
        ? this.$t('view.public.showcase.shareCopiedLabel')
        : this.$t('view.public.showcase.shareBtn')
    }
  },

  methods: {
    onOpenChannel(url) {
      window.open(url, '_blank', 'noopener')
    },

    async onShare() {
      const shareUrl = window.location.href

      if (navigator.share) {
        try {
          await navigator.share({ title: this.productName, url: shareUrl })
        } catch {
          // ผู้ใช้กดยกเลิก share sheet — ไม่ต้องแจ้งเตือนอะไร
        }
        return
      }

      try {
        await navigator.clipboard.writeText(shareUrl)
        this.justCopied = true
        setTimeout(() => {
          this.justCopied = false
        }, 2000)
      } catch {
        // clipboard API ใช้ไม่ได้ (เช่น เบราว์เซอร์เก่า) — ปล่อยผ่าน ไม่ทำให้หน้าลูกค้าพัง
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.showcase-contact {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.contact-channels {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-sm);

  :deep(.btn) {
    width: 100%;
  }
}
</style>
