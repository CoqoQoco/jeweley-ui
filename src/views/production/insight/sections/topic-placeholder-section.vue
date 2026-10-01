<!--
  topic-placeholder-section — ใช้ร่วมกัน 2 topic tab ที่ยังไม่ implement จริง (workers/materials — delivery/
  gold/capacity ย้ายไป delivery-section.vue/gold-section.vue/capacity-section.vue จริงแล้ว) — แสดง 4-part
  layout เดียวกับ wip-section (insight-tab-layout) แต่ problems/forecasts เป็น bullet ข้อความล้วน (severity
  'info', ไม่มี params จริง — รอ API ของหมวดนั้นแล้วเปลี่ยน code เป็นของจริง) ไม่มี actions (ยังไม่มีวิธีแก้
  ให้แนะนำจนกว่าจะมีข้อมูลจริง) ส่วนรายงาน = ลิงก์กลับไปหน้าเดิมที่ข้อมูลยังอยู่
-->
<template>
  <InsightTabLayout :title="$t(`view.productionInsight.nav.${topicKey}`)" :problems="content.problems" :forecasts="content.forecasts" :actions="[]">
    <template #report>
      <div id="insight-report-placeholderLink" class="topic-placeholder-section__anchor">
        <SectionCardGeneric :title="$t('view.productionInsight.placeholder.reportTitle')" icon="bi-signpost-2" accent="main" headerStyle="legend">
          <p class="topic-placeholder-section__message">{{ $t('view.productionInsight.placeholder.message') }}</p>
          <router-link :to="linkTo" class="topic-placeholder-section__link">
            {{ $t(`view.productionInsight.placeholder.link.${topicKey}`) }}
            <i class="bi bi-chevron-right"></i>
          </router-link>
        </SectionCardGeneric>
      </div>
    </template>
  </InsightTabLayout>
</template>

<script>
import InsightTabLayout from '@/components/insight/insight-tab-layout.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

// link ไปหน้าเดิมที่ข้อมูลของหมวดนั้นยังอยู่จนกว่าจะมี ProductionInsight endpoint ของหมวดนั้นจริง
const TOPIC_LINK = {
  workers: '/report-production-worker-wages',
  materials: '/stock-gem-dashboard'
}

// code ชั่วคราว (severity 'info' ล้วน ไม่มี params) — resolve ผ่าน view.productionInsight.rules.<CODE>
// เหมือน finding จริงทุกประการ (ใช้ insight-tab-layout ตัวเดียวกัน ไม่แยก logic) รอ API จริงของหมวดนั้น
// ค่อยเปลี่ยนเป็น code จริงพร้อม params — เนื้อหาตามที่ user ระบุไว้ในแผน (แบ่งปัญหาที่เกิดแล้ว/คาดการณ์
// ตามรูปแบบเดียวกับ WIP problem+forecast — materials ทั้ง 2 ข้อเป็นปัญหาปัจจุบันล้วน จึงไม่มี forecast)
const TOPIC_CODES = {
  workers: { problems: ['WORKERS_PLACEHOLDER_NO_WAGE'], forecasts: ['WORKERS_PLACEHOLDER_RISING_COST_PER_PIECE'] },
  materials: { problems: ['MATERIALS_PLACEHOLDER_GEM_LOW_STOCK', 'MATERIALS_PLACEHOLDER_NEGATIVE_GOLD'], forecasts: [] }
}

export default {
  name: 'ProductionInsightTopicPlaceholderSection',

  components: {
    InsightTabLayout,
    SectionCardGeneric
  },

  props: {
    topicKey: {
      type: String,
      required: true
    }
  },

  computed: {
    linkTo() {
      return TOPIC_LINK[this.topicKey] || '/production-dashboard'
    },

    content() {
      const codes = TOPIC_CODES[this.topicKey] || { problems: [], forecasts: [] }
      return {
        problems: codes.problems.map((code) => ({ code, severity: 'info', params: {} })),
        forecasts: codes.forecasts.map((code) => ({ code, severity: 'info', params: {} }))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.topic-placeholder-section__anchor {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
}

.topic-placeholder-section__message {
  margin: 0 0 var(--sp-md);
  color: var(--base-sub-color);
}

.topic-placeholder-section__link {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  color: var(--base-green);
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
}
</style>
