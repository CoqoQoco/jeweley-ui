<!--
  insight-finding-list — severity icon + text + [ดู ›] ต่อ finding (ใช้ใน insight-tab-layout.vue สำหรับ
  ปัญหาที่เกิดแล้ว/คาดการณ์ปัญหาที่จะเกิด) — ไม่มี logic แปล i18n เอง (รับ text ที่ resolve มาแล้วจาก parent)

  ตัวอย่างการใช้งาน:
  <InsightFindingList :findings="resolvedProblems" :loading="loading" @goto-report="onGotoReport" />

  Props:
    findings — Array (required) ของ { key, severity: 'critical'|'warning'|'info', text, helpText?, reportRef? }
               `helpText` ว่าง = ไม่แสดงไอคอน ⓘ (ไม่ใช่ทุก finding จะมีคำอธิบาย)
    loading  — Boolean (false)

  Emits: goto-report(reportRef) — เมื่อกดปุ่ม [ดู ›] ของ finding ที่มี reportRef
-->
<template>
  <div class="insight-finding-list">
    <div v-if="loading" class="insight-finding-list__loading">
      <i class="bi bi-arrow-repeat spin"></i>
    </div>
    <div v-else-if="!findings.length" class="insight-finding-list__empty">
      <i class="bi bi-check-circle-fill"></i>
      <span>{{ $t('view.productionInsight.findingEmpty') }}</span>
    </div>
    <div v-else class="insight-finding-list__items">
      <div
        v-for="finding in findings"
        :key="finding.key"
        class="insight-finding-list__item"
        :class="`insight-finding-list__item--${finding.severity}`"
      >
        <i :class="['bi', severityIcon(finding.severity)]"></i>
        <span class="insight-finding-list__text">{{ finding.text }}</span>
        <InfoTipGeneric v-if="finding.helpText" :text="finding.helpText" />
        <ButtonGeneric
          v-if="finding.reportRef"
          variant="plain"
          icon="bi-chevron-right"
          class="insight-finding-list__link"
          :label="$t('common.btn.view')"
          @click="$emit('goto-report', finding.reportRef)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { resolveFindingSeverityIcon } from './insight-helpers.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'

export default {
  name: 'InsightFindingList',

  components: {
    ButtonGeneric,
    InfoTipGeneric
  },

  props: {
    findings: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['goto-report'],

  methods: {
    severityIcon: resolveFindingSeverityIcon
  }
}
</script>

<style lang="scss" scoped>
@keyframes insight-finding-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.insight-finding-list__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-xl) 0;

  i {
    font-size: var(--fs-lg);
    color: var(--base-sub-color);
    animation: insight-finding-spin 0.8s linear infinite;
  }
}

.insight-finding-list__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-sm);
  padding: var(--sp-xl) 0;
  color: var(--base-green);
  font-weight: 600;

  i {
    font-size: var(--fs-lg);
  }
}

.insight-finding-list__items {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.insight-finding-list__item {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-sm) var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);

  > i:first-child {
    font-size: var(--fs-lg);
    flex-shrink: 0;
  }

  &--critical {
    border-color: var(--base-red);
    color: var(--base-red);

    > i:first-child { color: var(--base-red); }
  }

  &--warning {
    border-color: var(--base-warning);
    color: var(--base-warning);

    > i:first-child { color: var(--base-warning); }
  }

  &--info {
    border-color: var(--base-green);
    color: var(--base-green);

    > i:first-child { color: var(--base-green); }
  }
}

.insight-finding-list__text {
  flex: 1;
  font-size: var(--fs-base);
}

.insight-finding-list__link.btn {
  flex-shrink: 0;
  padding: 0;
}
</style>
