<template>
  <div class="showcase-contact">
    <ButtonGeneric
      variant="main"
      icon="bi-share"
      :label="shareLabel"
      block
      class="showcase-contact-share"
      @click="onShare"
    />

    <div class="contact-channels">
      <a
        v-for="channel in channels"
        :key="channel.key"
        :href="channel.url"
        target="_blank"
        rel="noopener"
        class="contact-channel"
        :aria-label="$t(channel.labelKey)"
        :title="$t(channel.labelKey)"
      >
        <i :class="['bi', channel.icon]"></i>
        <span class="contact-channel-label">{{ $t(channel.labelKey) }}</span>
      </a>
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

.showcase-contact-share {
  height: var(--showcase-btn-h);
}

.contact-channels {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-sm);
}

.contact-channel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-xs);
  padding: var(--sp-sm);
  border: 1px solid var(--showcase-box-border);
  border-radius: var(--showcase-radius-sm);
  background: var(--color-card-bg);
  color: inherit;
  text-decoration: none;

  i {
    color: var(--base-font-color);
    font-size: var(--fs-lg);
  }
}

.contact-channel-label {
  font-size: var(--fs-sm);
  color: var(--showcase-text-soft);
}

@media (min-width: 900px) {
  .showcase-contact {
    display: grid;
    grid-template-columns: minmax(0, 1fr) repeat(4, var(--showcase-btn-h));
    align-items: stretch;
    gap: var(--showcase-gap-sm);
  }

  .contact-channels {
    display: contents;
  }

  .contact-channel {
    width: var(--showcase-btn-h);
    height: var(--showcase-btn-h);
    padding: 0;
  }

  .contact-channel-label {
    display: none;
  }
}
</style>
