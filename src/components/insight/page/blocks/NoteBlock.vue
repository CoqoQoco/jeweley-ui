<!--
  NoteBlock — ข้อความอธิบายบรรทัดเดียว (ไอคอน + ข้อความ) ไม่มีกรอบ — ใช้คู่กับ node.visible(ctx) เป็นข้อความแบบมีเงื่อนไข
    text = i18n key หรือ function(ctx, t) · icon (default 'bi-info-circle')
-->
<template>
  <p class="note-block">
    <i :class="['bi', node.icon || 'bi-info-circle']"></i>
    {{ text }}
  </p>
</template>

<script>
import { resolveText } from '../insight-page-helpers.js'
import blockMixin from './block-mixin.js'

export default {
  name: 'NoteBlock',

  mixins: [blockMixin],

  computed: {
    text() {
      return resolveText(this.node.text, this.ctx, (key, params) => this.$t(key, params))
    }
  }
}
</script>

<style lang="scss" scoped>
.note-block {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
