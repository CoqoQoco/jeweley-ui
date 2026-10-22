<!--
  material-insight-view — แท็บ "คลังวัตถุดิบ" ของหน้า executive: ตัวสลับชนิดวัตถุดิบ (ทอง/โลหะ · พลอย = เร็วๆ นี้) + InsightPage + materialConfig ของชนิดนั้น (MaterialInsight/Overview)
  แต่ละชนิดมีแท็บ ⚠◔✓ และแท็บข้อมูลของตัวเอง (key=kind → เปลี่ยนชนิดแล้ว mount ใหม่/ยิงใหม่) · ไม่ผูก metal scope ของทั้งหน้า
  URL: sub= และ kind= (default ทอง ไม่เขียน) — รับค่าตั้งต้นจาก initialSub/initialKind (parent อ่านจาก query ตอนเข้าหน้าด้วย tab=material เท่านั้น) แล้ว $router.replace ตอนเปลี่ยน
  ปุ่มแก้ไขขั้นต่ำ/ตั้งค่าเกณฑ์ แสดงเฉพาะผู้มีสิทธิ์ material:manage-min (filter.canManage) · refreshToken เปลี่ยน → ยิง Overview ซ้ำ

  Props: refreshToken (0) · initialSub ('') · initialKind ('')
  Emits: update:sub · update:kind
-->
<template>
  <div class="material-insight-view">
    <ToggleGroupGeneric :modelValue="kind" size="sm" :options="kindOptions" :ariaLabel="$t('view.productionInsight.materialInsight.kindAria')" @update:modelValue="onKindChange" />
    <InsightPage :key="kind" ref="page" :config="config" :filter="pageFilter" :active="true" :sub="sub" @update:sub="onSubChange" />
  </div>
</template>

<script>
import { getMaterialConfig } from '../material/material.config.js'
import { hasMaterialManageAccess } from '../material/material-access.js'
import { parseKindQuery, kindToQuery } from '../material/material-helpers.js'
import { resolveSubTab, subTabToQuery, clearedSubTabQueryKeys } from '@/components/insight/page/insight-tabs-helpers.js'

import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import InsightPage from '@/components/insight/page/InsightPage.vue'

export default {
  name: 'MaterialInsightView',

  components: { ToggleGroupGeneric, InsightPage },

  emits: ['update:sub', 'update:kind'],

  props: {
    refreshToken: { type: Number, default: 0 },
    initialSub: { type: String, default: '' },
    initialKind: { type: String, default: '' }
  },

  data() {
    const kind = parseKindQuery(this.initialKind)
    return {
      kind,
      sub: resolveSubTab(this.initialSub, getMaterialConfig(kind))
    }
  },

  computed: {
    config() {
      return getMaterialConfig(this.kind)
    },

    canManage() {
      return hasMaterialManageAccess()
    },

    pageFilter() {
      return { kind: this.kind, canManage: this.canManage }
    },

    kindOptions() {
      return [
        { value: 'GOLD', label: this.$t('view.productionInsight.materialInsight.kind.GOLD') },
        { value: 'GEM', label: this.$t('view.productionInsight.materialInsight.kind.GEM'), disabled: true, title: this.$t('view.productionInsight.materialInsight.kind.comingSoon') }
      ]
    }
  },

  watch: {
    refreshToken() {
      this.$refs.page?.reload(['Overview'])
    }
  },

  methods: {
    writeQuery(sub, kind) {
      // tab: 'material' ระบุเองเสมอ — กัน route ของ parent ที่ยังไม่อัปเดตตอน emit
      const query = { ...this.$route.query, tab: 'material', ...subTabToQuery(sub), ...kindToQuery(kind) }
      clearedSubTabQueryKeys(sub).forEach((key) => delete query[key])
      if (!kindToQuery(kind).kind) delete query.kind
      this.$router.replace({ query }).catch(() => {})
    },

    onSubChange(value) {
      this.sub = value
      this.$emit('update:sub', value)
      this.writeQuery(value, this.kind)
    },

    // เปลี่ยนชนิด = กลับแท็บ ⚠ ของชนิดนั้น (แต่ละชนิดมีแท็บของตัวเอง ไม่ปนกัน)
    onKindChange(value) {
      const kind = parseKindQuery(value)
      if (kind === this.kind) return
      this.kind = kind
      this.sub = resolveSubTab('', getMaterialConfig(kind))
      this.$emit('update:kind', kind)
      this.$emit('update:sub', this.sub)
      this.writeQuery(this.sub, kind)
    }
  }
}
</script>

<style lang="scss" scoped>
.material-insight-view {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}
</style>
