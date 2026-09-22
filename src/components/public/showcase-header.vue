<template>
  <div class="showcase-header">
    <div class="showcase-header-inner">
      <div class="showcase-header-spacer" aria-hidden="true"></div>

      <img :src="logoSrc" alt="Duangkaew Jewelry" class="showcase-logo" />

      <div class="lang-toggle">
        <button
          type="button"
          class="lang-btn"
          :class="{ 'lang-btn--active': locale === 'en' }"
          @click="changeLocale('en')"
        >
          EN
        </button>
        <span class="lang-sep">|</span>
        <button
          type="button"
          class="lang-btn"
          :class="{ 'lang-btn--active': locale === 'th' }"
          @click="changeLocale('th')"
        >
          TH
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { applyLocale } from '@/plugins/i18n/config.js'

import logoSrc from '@/assets/duangkaew-logo-trim.png'

export default {
  name: 'ShowcaseHeader',

  data() {
    return {
      logoSrc
    }
  },

  computed: {
    locale() {
      return this.$i18n.locale
    }
  },

  methods: {
    // ในหน่วยความจำเท่านั้น — ไม่เขียน storage เพื่อไม่ให้ทับภาษาระบบหลังบ้าน (ดู index-view.vue)
    changeLocale(lang) {
      if (lang === this.locale) return
      applyLocale(lang)
    }
  }
}
</script>

<style lang="scss" scoped>
.showcase-header {
  padding: var(--showcase-header-pad-top) var(--sp-lg) var(--sp-xl);
  border-bottom: 1px solid var(--showcase-line);
}

.showcase-header-inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.showcase-header-spacer {
  grid-column: 1;
}

.showcase-logo {
  grid-column: 2;
  width: var(--showcase-logo-w);
  height: auto;
  object-fit: contain;
}

.lang-toggle {
  grid-column: 3;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
}

.lang-btn {
  border: none;
  background: none;
  min-height: var(--showcase-touch-min);
  padding: var(--sp-xs) var(--sp-sm);
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--showcase-toggle-off);
  cursor: pointer;

  &--active {
    color: var(--base-font-color);
  }
}

.lang-sep {
  color: var(--showcase-line);
}

@media (min-width: 900px) {
  .showcase-header {
    padding: var(--showcase-header-pad-top-lg) 0 var(--showcase-header-pad-bottom-lg);
  }

  .showcase-header-inner {
    width: min(var(--showcase-container-w), calc(100% - 2 * var(--sp-2xl)));
    margin: 0 auto;
  }

  .showcase-logo {
    width: var(--showcase-logo-w-lg);
  }
}
</style>
