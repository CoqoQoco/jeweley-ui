<!--
  BlockFrame — กรอบมาตรฐานของ block ใน InsightPage: anchor `insight-report-<id>` + SectionCardGeneric + note ใต้หัวข้อ
  (ข้อความ note/title ถูก resolve มาแล้วจาก block) — id เว้นว่างได้ (block ที่อยู่ใน group ซึ่งมี anchor ของ group เอง)

  Props: id, title, titleTip, icon, accent, headerStyle, notes (string[]), bare (ไม่วาด SectionCard), subtitle (ใช้กับ bare),
    sourceStrip ('plan'|'slip'|... = แถบ SourceStripGeneric ใต้หัวข้อ, ว่าง = ไม่แสดง),
    collapsible (opt-in — แสดงปุ่มพับ/กาง, ไม่ผูกกับ state: parent คุมผ่าน collapsed + @toggle), collapsed (พับ = เรนเดอร์หัวกรอบ + ปุ่มกางเท่านั้น ไม่เรนเดอร์ slot)
  Slots: default · header-actions (มุมขวาบนของหัวกรอบ — ส่งต่อให้ SectionCardGeneric)
  Emits: toggle
-->
<template>
  <div :id="anchorId" class="block-frame">
    <template v-if="bare">
      <p v-if="subtitle" class="block-frame__subtitle">{{ subtitle }}</p>
      <p v-for="(note, index) in notes" :key="index" class="block-frame__note">{{ note }}</p>
      <slot />
    </template>
    <SectionCardGeneric v-else :title="title" :titleTip="titleTip" :icon="icon" :accent="accent" :headerStyle="headerStyle">
      <template v-if="$slots['header-actions']" #header-actions>
        <slot name="header-actions" />
      </template>
      <div v-if="collapsible" :class="['block-frame__collapse', { 'block-frame__collapse--collapsed': collapsed }]">
        <ButtonGeneric
          variant="plain"
          :icon="collapsed ? 'bi-chevron-down' : 'bi-chevron-up'"
          :label="collapsed ? $t('view.productionInsight.blockCollapse.expand') : $t('view.productionInsight.blockCollapse.collapse')"
          :block="collapsed"
          :aria-expanded="String(!collapsed)"
          @click="$emit('toggle')"
        />
      </div>
      <template v-if="!collapsed">
        <SourceStripGeneric v-if="sourceStrip" :source="sourceStrip" />
        <p v-for="(note, index) in notes" :key="index" class="block-frame__note">{{ note }}</p>
        <slot />
      </template>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { buildAnchorId } from '../insight-page-helpers.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import SourceStripGeneric from '@/components/generic/SourceStripGeneric.vue'

export default {
  name: 'BlockFrame',

  components: { ButtonGeneric, SectionCardGeneric, SourceStripGeneric },

  props: {
    id: { type: String, default: '' },
    title: { type: String, default: '' },
    titleTip: { type: String, default: '' },
    icon: { type: String, default: '' },
    accent: { type: String, default: 'main' },
    headerStyle: { type: String, default: 'legend' },
    notes: { type: Array, default: () => [] },
    bare: { type: Boolean, default: false },
    subtitle: { type: String, default: '' },
    sourceStrip: { type: String, default: '' },
    collapsible: { type: Boolean, default: false },
    collapsed: { type: Boolean, default: false }
  },

  emits: ['toggle'],

  computed: {
    anchorId() {
      return buildAnchorId(this.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.block-frame {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.block-frame__subtitle {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--base-font-color);
}

.block-frame__note {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.block-frame__collapse {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--sp-sm);

  &--collapsed {
    margin-bottom: 0;
  }
}
</style>
