<!--
  digest-view — "สถานะรายโดเมน" + "เรื่องที่ต้องดูก่อน" (Executive Digest) ใต้การ์ดสรุปของหน้า /executive

  Props:
    digest  — Object|null — response ของ ExecutiveReport/Digest (null = ยังไม่โหลด/โหลดไม่ได้ → การ์ดโดเมนเป็น unknown ทั้ง 4)
    loading — Boolean (false)

  Emits: select-tab(domain, target) — กดการ์ดโดเมน (target = null) หรือปุ่ม [ดู ›] ของ finding (target = { tab, reportRef, code, params })
-->
<template>
  <SectionCardGeneric :title="$t('view.executive.digest.title')" icon="bi-activity" accent="main" headerStyle="dashboard" class="section-card-block">
    <div class="digest-domains">
      <div
        v-for="card in cards"
        :key="card.key"
        class="digest-domain"
        :class="[`digest-domain--${card.statusView.variant}`, { 'digest-domain--muted': !card.available }]"
        :data-domain="card.key"
        role="button"
        tabindex="0"
        @click="onDomainClick(card.key)"
        @keydown.enter="onDomainClick(card.key)"
        @keydown.space.prevent="onDomainClick(card.key)"
      >
        <div class="digest-domain__head">
          <i :class="['bi', card.icon]"></i>
          <span class="digest-domain__name">{{ $t(card.labelKey) }}</span>
          <span class="digest-domain__chip" :class="`digest-domain__chip--${card.statusView.variant}`">
            {{ loading ? '…' : $t(card.statusView.labelKey) }}
          </span>
        </div>
        <div v-if="loading" class="digest-domain__skeleton"></div>
        <div v-else-if="!card.available" class="digest-domain__unavailable">{{ $t('view.executive.digest.unavailable') }}</div>
        <div v-else class="digest-domain__counts">
          <span>{{ $t('view.executive.digest.problemCount', { count: card.problemCount }) }}</span>
          <span>{{ $t('view.executive.digest.forecastCount', { count: card.forecastCount }) }}</span>
        </div>
      </div>
    </div>

    <div class="digest-top">
      <div class="digest-top__title">{{ $t('view.executive.digest.topTitle') }}</div>
      <InsightFindingList :findings="topFindings" :loading="loading" @goto-report="onGotoReport" />
    </div>
  </SectionCardGeneric>
</template>

<script>
import { buildDomainCards, buildTopFindings } from '../executive-digest-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import InsightFindingList from '@/components/insight/insight-finding-list.vue'

export default {
  name: 'ExecutiveDigestView',

  components: {
    SectionCardGeneric,
    InsightFindingList
  },

  props: {
    digest: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['select-tab'],

  computed: {
    cards() {
      return buildDomainCards(this.digest)
    },

    topFindings() {
      return buildTopFindings(this.digest?.top, (key, params) => this.$t(key, params))
    }
  },

  methods: {
    onDomainClick(domain) {
      this.$emit('select-tab', domain, null)
    },

    onGotoReport(tab, reportParams) {
      this.$emit('select-tab', reportParams.domain, { tab: reportParams.tab || tab, reportRef: reportParams.reportRef, code: reportParams.code, params: reportParams.params })
    }
  }
}
</script>

<style lang="scss" scoped>
.section-card-block {
  margin-bottom: var(--sp-lg);
}

.digest-domains {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--sp-md);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.digest-domain {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  padding: var(--sp-md) var(--sp-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.15s ease;

  &:hover,
  &:focus-visible {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid var(--base-font-color);
    outline-offset: 2px;
  }

  &--muted {
    opacity: 0.7;
  }
}

.digest-domain__head {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  min-width: 0;

  > i {
    font-size: var(--fs-lg);
    color: var(--base-sub-color);
    flex-shrink: 0;
  }
}

.digest-domain__name {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  color: var(--base-font-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.digest-domain__chip {
  flex-shrink: 0;
  padding: 0 var(--sp-sm);
  border: 1px solid var(--base-sub-color);
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--base-sub-color);
  white-space: nowrap;

  &--critical {
    border-color: var(--base-red);
    color: var(--base-red);
  }

  &--warning {
    border-color: var(--base-warning);
    color: var(--base-warning);
  }

  &--ok {
    border-color: var(--base-green);
    color: var(--base-green);
  }
}

.digest-domain__counts {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);

  > span:first-child {
    font-size: var(--fs-base);
    font-weight: 600;
    color: var(--base-font-color);
  }
}

.digest-domain__unavailable {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

@keyframes digest-skeleton-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.digest-domain__skeleton {
  width: 72px;
  height: var(--fs-base);
  border-radius: var(--radius-sm);
  background: var(--color-border);
  animation: digest-skeleton-pulse 1.2s ease-in-out infinite;
}

.digest-top {
  margin-top: var(--sp-lg);
}

.digest-top__title {
  margin-bottom: var(--sp-sm);
  font-weight: 600;
  color: var(--base-font-color);
}
</style>
