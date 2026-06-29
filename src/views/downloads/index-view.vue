<template>
  <div class="downloads-view">
    <pageTitle :title="$t('view.downloads.pageTitle')" :isShowBtnClose="false" />

    <div class="downloads-grid">
      <SectionCardGeneric v-for="item in downloadItems" :key="item.id" class="download-card">
        <div class="download-card-inner">
          <div class="download-card-icon">
            <i :class="['bi', item.icon]"></i>
          </div>
          <div class="download-card-info">
            <div class="download-card-title-row">
              <span class="download-name">{{ $t(item.nameKey) }}</span>
              <span class="download-version-badge">{{ item.version }}</span>
            </div>
            <p class="download-desc">{{ $t(item.descKey) }}</p>
            <p class="download-meta">{{ item.sizeLabel }} &middot; {{ item.os }}</p>
            <div class="download-actions">
              <ButtonGeneric
                variant="main"
                icon="bi-download"
                :label="$t('common.btn.download')"
                @click="download(item)"
              />
              <ButtonGeneric
                v-if="item.hasManual"
                variant="outline"
                icon="bi-journal-text"
                :label="$t('view.downloads.manualBtn')"
                class="ml-2"
                @click="openManual(item)"
              />
            </div>
          </div>
        </div>
      </SectionCardGeneric>
    </div>

    <printBridgeManualView
      v-if="activeManualId === 'print-bridge'"
      :isShow="isShowManual"
      @closeModal="closeManual"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import { DOWNLOAD_ITEMS } from '@/config/downloads-config.js'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
const printBridgeManualView = defineAsyncComponent(
  () => import('./modal/print-bridge-manual-view.vue')
)

export default {
  name: 'DownloadsIndexView',

  components: {
    pageTitle,
    SectionCardGeneric,
    ButtonGeneric,
    printBridgeManualView
  },

  data() {
    return {
      downloadItems: DOWNLOAD_ITEMS,
      isShowManual: false,
      activeManualId: null
    }
  },

  methods: {
    download(item) {
      window.location.href = item.url
    },

    openManual(item) {
      this.activeManualId = item.id
      this.isShowManual = true
    },

    closeManual() {
      this.isShowManual = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.downloads-view {
  padding: var(--sp-lg);
}

.downloads-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: var(--sp-lg);
  margin-top: var(--sp-lg);
}

.download-card-inner {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-lg);
}

.download-card-icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-highlight-bg);
  border-radius: var(--radius-lg);
  font-size: 1.75rem;
  color: var(--base-font-color);
}

.download-card-info {
  flex: 1;
  min-width: 0;
}

.download-card-title-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-xs);
  flex-wrap: wrap;
}

.download-name {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: var(--base-font-color);
}

.download-version-badge {
  display: inline-block;
  padding: 2px var(--sp-sm);
  background: var(--color-highlight-bg);
  color: var(--base-font-color);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;
  border: 1px solid var(--color-border);
}

.download-desc {
  font-size: var(--fs-base);
  color: var(--base-font-color);
  line-height: var(--lh-md);
  margin-bottom: var(--sp-xs);
  opacity: 0.8;
}

.download-meta {
  font-size: var(--fs-sm);
  color: var(--base-font-color);
  opacity: 0.55;
  margin-bottom: var(--sp-md);
}

.download-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .downloads-grid {
    grid-template-columns: 1fr;
  }

  .download-card-inner {
    flex-direction: column;
  }
}
</style>
