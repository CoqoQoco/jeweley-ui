<!--
  BlockFrame — กรอบมาตรฐานของ block ใน InsightPage: anchor `insight-report-<id>` + SectionCardGeneric + note ใต้หัวข้อ
  (ข้อความ note/title ถูก resolve มาแล้วจาก block) — id เว้นว่างได้ (block ที่อยู่ใน group ซึ่งมี anchor ของ group เอง)

  Props: id, title, titleTip, icon, accent, headerStyle, notes (string[])
  Slots: default · header-actions (มุมขวาบนของหัวกรอบ — ส่งต่อให้ SectionCardGeneric)
-->
<template>
  <div :id="anchorId" class="block-frame">
    <SectionCardGeneric :title="title" :titleTip="titleTip" :icon="icon" :accent="accent" :headerStyle="headerStyle">
      <template v-if="$slots['header-actions']" #header-actions>
        <slot name="header-actions" />
      </template>
      <p v-for="(note, index) in notes" :key="index" class="block-frame__note">{{ note }}</p>
      <slot />
    </SectionCardGeneric>
  </div>
</template>

<script>
import { buildAnchorId } from '../insight-page-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

export default {
  name: 'BlockFrame',

  components: { SectionCardGeneric },

  props: {
    id: { type: String, default: '' },
    title: { type: String, default: '' },
    titleTip: { type: String, default: '' },
    icon: { type: String, default: '' },
    accent: { type: String, default: 'main' },
    headerStyle: { type: String, default: 'legend' },
    notes: { type: Array, default: () => [] }
  },

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

.block-frame__note {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}
</style>
