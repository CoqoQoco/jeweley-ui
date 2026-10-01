<!--
  insight-tab-layout — โครง 4 ส่วนมาตรฐานของทุก topic tab ใน Production Insight (Revision 2):
  (1) ปัญหาที่เกิดแล้ว (2) คาดการณ์ปัญหาที่จะเกิด — 2 กล่อง legend ข้างกัน สูงเท่ากัน (≤1024px stack)
  (3) วิธีแก้ / สิ่งที่ควรทำ — กล่อง legend เต็มความกว้าง
  (4) รายงาน — slot #report เต็มความกว้าง (กล่องของตัวเอง จัดการ id="insight-report-<reportRef>" เอง)

  แปล code -> ข้อความผ่าน i18n `${i18nPrefix}.<CODE>` พร้อม params (deptKey resolve เป็นชื่อแผนกที่แปลแล้ว
  ผ่าน view.executive.department.* ก่อนเสมอ) — [ดู ›] ใน insight-finding-list เลื่อนไปยัง DOM id
  `insight-report-<reportRef>` ที่เนื้อหาใน slot #report ต้องกำกับเอง (ตรงกับ reportRef ที่ API ส่งมา)

  ตัวอย่างการใช้งาน:
  <InsightTabLayout
    :title="$t('view.productionInsight.nav.wip')"
    :status="status"
    :problems="problems"
    :forecasts="forecasts"
    :actions="actions"
    :loading="loading"
  >
    <template #report>
      <div id="insight-report-departments">...</div>
    </template>
  </InsightTabLayout>

  Props:
    title      — String (required)
    status     — String ('critical'|'warning'|'ok'|''), default '' (ไม่แสดง chip)
    problems   — Array ของ { code, severity, params, reportRef? } (default [])
    forecasts  — Array เหมือน problems (default [])
    actions    — Array ของ { code, priority, ownerRole, relatedCodes, params } (default [])
    loading    — Boolean (false)
    i18nPrefix — String (default 'view.productionInsight.rules') namespace สำหรับ code -> ข้อความ
    helpParams — Object ({}) — ค่าพารามิเตอร์เสริมสำหรับ resolve ข้อความคำอธิบาย (view.productionInsight.help.<CODE>)
                 ที่ไม่ได้มากับ finding เอง (เช่น staleDays จาก filter ปัจจุบัน) — params ของ finding เอง
                 (ถ้ามี field ชนกัน) ชนะเสมอ

  Slots: #report (เต็มความกว้าง)
-->
<template>
  <div class="insight-tab-layout">
    <div class="insight-tab-layout__header">
      <h3 class="insight-tab-layout__title">{{ title }}</h3>
      <span v-if="status" class="insight-tab-layout__status" :class="`insight-tab-layout__status--${status}`">
        <i :class="['bi', statusIcon]"></i>
        {{ $t(`view.productionInsight.status.${status}`) }}
        <InfoTipGeneric :text="$t('view.productionInsight.help.statusMeaning')" />
      </span>
    </div>

    <div class="insight-tab-layout__row insight-tab-layout__row--split">
      <SectionCardGeneric
        :title="$t('view.productionInsight.section.problems')"
        :titleTip="$t('view.productionInsight.help.sectionProblems')"
        icon="bi-exclamation-triangle"
        accent="warning"
        headerStyle="legend"
      >
        <InsightFindingList :findings="resolvedProblems" :loading="loading" @goto-report="scrollToReport" />
      </SectionCardGeneric>

      <SectionCardGeneric
        :title="$t('view.productionInsight.section.forecasts')"
        :titleTip="$t('view.productionInsight.help.sectionForecasts')"
        icon="bi-graph-up-arrow"
        accent="main"
        headerStyle="legend"
      >
        <InsightFindingList :findings="resolvedForecasts" :loading="loading" @goto-report="scrollToReport" />
      </SectionCardGeneric>
    </div>

    <SectionCardGeneric
      :title="$t('view.productionInsight.section.actions')"
      :titleTip="$t('view.productionInsight.help.sectionActions')"
      icon="bi-list-check"
      accent="green"
      headerStyle="legend"
    >
      <InsightActionList :actions="resolvedActions" :loading="loading" />
    </SectionCardGeneric>

    <div class="insight-tab-layout__report">
      <slot name="report" />
    </div>
  </div>
</template>

<script>
import { resolveStatusIcon, resolveFindingParams, resolveHelpKey, buildFindingKey } from './insight-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import InsightFindingList from './insight-finding-list.vue'
import InsightActionList from './insight-action-list.vue'

export default {
  name: 'InsightTabLayout',

  components: {
    SectionCardGeneric,
    InfoTipGeneric,
    InsightFindingList,
    InsightActionList
  },

  props: {
    title: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: ''
    },
    problems: {
      type: Array,
      default: () => []
    },
    forecasts: {
      type: Array,
      default: () => []
    },
    actions: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    i18nPrefix: {
      type: String,
      default: 'view.productionInsight.rules'
    },
    helpParams: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    statusIcon() {
      return resolveStatusIcon(this.status)
    },

    resolvedProblems() {
      return this.resolveFindings(this.problems)
    },

    resolvedForecasts() {
      return this.resolveFindings(this.forecasts)
    },

    resolvedActions() {
      return (this.actions || []).map((action) => ({
        key: buildFindingKey(action.code, action.params),
        text: this.resolveText(action.code, action.params),
        ownerRoleLabel: action.ownerRole ? this.$t(`view.productionInsight.ownerRole.${action.ownerRole}`) : '',
        relatedText: this.buildRelatedText(action.relatedCodes, action.params)
      }))
    }
  },

  methods: {
    translateDept(key) {
      return this.$t(`view.executive.department.${key}`)
    },

    // workerType = เลขรหัสประเภทช่าง (50=ช่างแต่ง/80=ช่างฝัง) — ใช้โดย finding/action ของหมวด "ทองและ Loss"
    translateWorkerType(workerType) {
      return this.$t(`view.productionInsight.gold.workerType.${workerType}`)
    },

    // metal = 'GOLD'|'SILVER' — ใช้โดย finding/action ของหมวด "ทองและ Loss" (reuse namespace เดียวกับที่
    // ToggleGroupGeneric ทอง/เงิน ใช้อยู่แล้วใน gold-kpi-group.vue — ไม่สร้างคำแปลซ้ำ)
    translateMetal(metal) {
      return this.$t(`view.productionInsight.gold.metalLabel.${metal}`)
    },

    // ACT_TALK_WORKER โชว์รายชื่อได้ถึง 5 คน (ตามที่สั่ง) ส่วน code อื่นที่มี workers[] (เช่น
    // GOLD_REPEAT_OFFENDER) ใช้ default 3 คนของ formatWorkerNameList เอง
    resolveMaxWorkerNames(code) {
      return code === 'ACT_TALK_WORKER' ? 5 : undefined
    },

    resolveText(code, params) {
      return this.$t(
        `${this.i18nPrefix}.${code}`,
        resolveFindingParams(params, this.translateDept, this.translateWorkerType, this.translateMetal, this.resolveMaxWorkerNames(code))
      )
    },

    // คำอธิบาย "วิธีคำนวณ/เกณฑ์ด่วน" ของ finding — คืนค่าว่างเมื่อ code นั้นยังไม่มีคำอธิบาย (resolveHelpKey)
    // เพื่อให้ caller (insight-finding-list.vue) ไม่ render ไอคอน ⓘ เลย — ผสม helpParams (เช่น staleDays
    // จาก filter ปัจจุบัน) เข้ากับ params ของ finding เอง (params ของ finding ชนะถ้าชื่อ field ชนกัน)
    resolveHelpText(code, params) {
      const helpKey = resolveHelpKey(code)
      if (!helpKey) return ''
      return this.$t(helpKey, {
        ...this.helpParams,
        ...resolveFindingParams(params, this.translateDept, this.translateWorkerType, this.translateMetal, this.resolveMaxWorkerNames(code))
      })
    },

    resolveFindings(items) {
      return (items || []).map((item) => ({
        key: buildFindingKey(item.code, item.params),
        severity: item.severity,
        text: this.resolveText(item.code, item.params),
        helpText: this.resolveHelpText(item.code, item.params),
        reportRef: item.reportRef
      }))
    },

    // params มาจาก action เดิมที่เป็นเจ้าของ relatedCodes — ใช้ metal (ถ้ามี) แปลผ่าน translateMetal ให้
    // codeLabel.* ของหมวด "ทองและ Loss" ที่มี {metal} param (เช่น GOLD_EXCESS_OVER_ALLOWANCE) — หมวดอื่นไม่มี
    // {metal} ใน codeLabel ของตัวเอง ส่ง undefined ไปเฉยๆ ไม่กระทบ
    buildRelatedText(relatedCodes, params = {}) {
      if (!relatedCodes || !relatedCodes.length) return ''
      const metal = params.metal != null ? this.translateMetal(params.metal) : undefined
      const labels = relatedCodes.map((code) => this.$t(`view.productionInsight.codeLabel.${code}`, { metal }))
      return `${this.$t('view.productionInsight.relatedPrefix')} ${labels.join(', ')}`
    },

    scrollToReport(reportRef) {
      const el = document.getElementById(`insight-report-${reportRef}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}
</script>

<style lang="scss" scoped>
// legend-style SectionCardGeneric ต้องการ margin-top var(--sp-2xl) เพื่อเผื่อชิป title ที่คร่อมขอบบน —
// container sibling-spacing ที่นี่ต้อง >= ค่านั้นเสมอ (ห้ามเล็กกว่า) เพราะ specificity เท่ากับ
// .section-card--legend ของ SectionCardGeneric เอง (class selector ทั้งคู่) ผลชนะขึ้นกับลำดับ bundle ไม่ใช่
// specificity ล้วน — ใช้ค่าเดียวกันตัดปัญหาสูงไม่เท่ากันไปเลย (ดู Decision Log docs/design-system.md)
.insight-tab-layout > * + * {
  margin-top: var(--sp-2xl);
}

.insight-tab-layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
  flex-wrap: wrap;
}

.insight-tab-layout__title {
  margin: 0;
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--base-font-color);
}

.insight-tab-layout__status {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  padding: var(--sp-xs) var(--sp-md);
  border-radius: var(--radius-lg);
  border: 1px solid currentColor;
  font-size: var(--fs-sm);
  font-weight: 700;

  &--critical { color: var(--base-red); }
  &--warning { color: var(--base-warning); }
  &--ok { color: var(--base-green); }
}

// row1 (ปัญหา|คาดการณ์) — 2 กล่อง legend เท่ากันทุกประการ: เผื่อ clearance ของ legend chip ที่ระดับ
// container (padding-top) แทน margin-top ของ .section-card--legend เอง กัน 2 กล่องเริ่มคนละ y เมื่อ
// โครง DOM/wrapper ต่างกัน (ดู Decision Log docs/design-system.md 2026-09-29 layout follow-up)
.insight-tab-layout__row--split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  gap: var(--sp-md);
  padding-top: var(--sp-2xl);

  > * {
    min-width: 0;
  }

  :deep(.section-card) {
    height: 100%;
  }

  :deep(.section-card--legend) {
    margin-top: 0 !important;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding-top: 0;

    :deep(.section-card--legend) {
      margin-top: var(--sp-2xl) !important;
    }
  }
}
</style>
