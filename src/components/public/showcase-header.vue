<template>
  <div class="showcase-header">
    <img src="@/assets/duangkaew-logo.png" alt="Duangkaew Jewelry" class="showcase-logo" />

    <div class="lang-toggle">
      <button
        type="button"
        class="lang-btn"
        :class="{ 'lang-btn--active': locale === 'th' }"
        @click="changeLocale('th')"
      >
        TH
      </button>
      <span class="lang-sep">|</span>
      <button
        type="button"
        class="lang-btn"
        :class="{ 'lang-btn--active': locale === 'en' }"
        @click="changeLocale('en')"
      >
        EN
      </button>
    </div>
  </div>
</template>

<script>
import { setLocale } from '@/plugins/i18n/config.js'

export default {
  name: 'ShowcaseHeader',

  computed: {
    locale() {
      return this.$i18n.locale
    }
  },

  methods: {
    changeLocale(lang) {
      if (lang === this.locale) return
      // ลูกค้าอาจเปิดหน้านี้ในโหมด private/incognito — localStorage.setItem อาจ throw
      // (storage service ห่อ localStorage ไว้แล้ว แต่ setLocale เรียกมันตรงๆ จึงกันพังไว้ชั้นนอกอีกที)
      try {
        setLocale(lang)
      } catch {
        // เปลี่ยนภาษาไม่สำเร็จ (จำค่าไว้ไม่ได้) — ปล่อยผ่าน ไม่ทำให้หน้าลูกค้าพัง
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.showcase-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-lg) var(--sp-xl);
}

.showcase-logo {
  height: 36px;
  width: auto;
  object-fit: contain;
}

.lang-toggle {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
}

.lang-btn {
  border: none;
  background: none;
  padding: var(--sp-xs) var(--sp-xs);
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--color-border);
  cursor: pointer;

  &--active {
    color: var(--base-font-color);
  }
}

.lang-sep {
  color: var(--color-border);
}
</style>
