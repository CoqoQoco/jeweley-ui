<!--
  wip-standards-panel — ปุ่ม "กำหนดมาตรฐาน" (ส่วนที่ 5) + แผง DrawerGeneric ตั้งจำนวนวันมาตรฐานต่อแผนก —
  เห็นปุ่มได้ทุกคน แก้ไขค่าได้เฉพาะผู้มีสิทธิ์ production:standard-edit (hasStandardEditAccess) คนอื่นเห็น
  ค่าปัจจุบัน + ประวัติ แบบอ่านอย่างเดียว

  Draft semantics: แก้ค่าในแผง = DRAFT เท่านั้น (ยังไม่บันทึก) — emit `draft-change(payload)` แบบ debounce
  ให้ parent (wip-lead-time-panel.vue) เอาไปยิง StageLeadTime ใหม่พร้อม draftStandards ให้ตาราง/การ์ด
  preview ค่าใหม่แบบ real-time ก่อนกดบันทึกจริง — "บันทึกมาตรฐาน" ต้องมีหมายเหตุเสมอ (SaveStageStandards)
  ปิดแผงหรือกด "ยกเลิกร่าง" = ทิ้ง draft (emit draft-change([]) ให้ parent เลิก preview)

  Props:
    departments — Array (required) — StageLeadTime departments[] (ใช้ทำข้อความอ้างอิง "ค่ากลางจริง X · P90 Y")
    standards   — Array (required) — StageStandards ที่บันทึกไว้จริง [{deptKey,standardDays,effectiveFrom,createBy,remark}]

  Emits: draft-change(items), saved
-->
<template>
  <div class="wip-standards-panel">
    <ButtonGeneric variant="outline" icon="bi-gear" :label="$t('view.productionInsight.wip.standardsButton')" :title="$t('view.productionInsight.help.standardsButton')" @click="onOpen" />

    <DrawerGeneric :show="isOpen" :title="$t('view.productionInsight.wip.standardsPanelTitle')" width="440px" headerVariant="main" :isShowActionPart="canEdit" @close="onClose">
      <template #content>
        <div class="wip-standards-panel__body">
          <p v-if="!canEdit" class="wip-standards-panel__readonly-note">
            <i class="bi bi-info-circle"></i>
            {{ $t('view.productionInsight.wip.standardsReadOnlyNote') }}
          </p>

          <div v-for="dept in departmentRows" :key="dept.key" class="wip-standards-panel__field">
            <FormFieldGeneric :label="dept.label">
              <InputTextGeneric
                v-if="canEdit"
                v-model.number="draftMap[dept.key]"
                type="number"
                :min="1"
                :max="365"
                @update:modelValue="onDraftInput"
              />
              <span v-else class="wip-standards-panel__readonly-value">{{ dept.savedDays ?? '—' }}</span>
            </FormFieldGeneric>
            <p class="wip-standards-panel__reference">
              {{ $t('view.productionInsight.wip.standardsReferenceText', { median: formatDays(dept.medianTotal), p90: formatDays(dept.p90Total) }) }}
            </p>
            <ButtonGeneric variant="plain" :label="$t('view.productionInsight.wip.standardsHistoryLink')" @click="onOpenHistory(dept)" />
          </div>

          <FormFieldGeneric v-if="canEdit" :label="$t('view.productionInsight.wip.standardsRemarkLabel')" :required="true" :error="remarkError">
            <TextareaGeneric v-model="remark" :rows="3" :placeholder="$t('view.productionInsight.wip.standardsRemarkPlaceholder')" />
          </FormFieldGeneric>
        </div>
      </template>

      <template #action>
        <div class="wip-standards-panel__actions">
          <ButtonGeneric variant="outline" :disabled="!hasChanges" :label="$t('view.productionInsight.wip.standardsCancelDraftBtn')" @click="onCancelDraft" />
          <ButtonGeneric variant="main" icon="bi-check-lg" :disabled="!hasChanges" :label="$t('view.productionInsight.wip.standardsSaveBtn')" @click="onSave" />
        </div>
      </template>
    </DrawerGeneric>

    <WipStandardHistoryModal :show="isHistoryOpen" :deptKey="historyDeptKey" :deptLabel="historyDeptLabel" @closeModal="isHistoryOpen = false" />
  </div>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { hasStandardEditAccess } from '@/services/permission/standard-edit-access.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import { buildDraftStandardsPayload, hasDraftChanges } from './wip-lead-time-helpers.js'

import DrawerGeneric from '@/components/generic/DrawerGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import WipStandardHistoryModal from './wip-standard-history-modal.vue'

const DRAFT_DEBOUNCE_MS = 400

export default {
  name: 'WipStandardsPanel',

  components: {
    DrawerGeneric,
    ButtonGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    WipStandardHistoryModal
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  props: {
    departments: {
      type: Array,
      required: true
    },
    standards: {
      type: Array,
      required: true
    }
  },

  emits: ['draft-change', 'saved'],

  data() {
    return {
      isOpen: false,
      draftMap: {},
      remark: '',
      remarkError: '',
      isHistoryOpen: false,
      historyDeptKey: '',
      historyDeptLabel: '',
      draftDebounceTimer: null
    }
  },

  computed: {
    canEdit() {
      return hasStandardEditAccess()
    },

    savedMap() {
      const map = {}
      this.standards.forEach((s) => {
        map[s.deptKey] = s.standardDays
      })
      return map
    },

    departmentRows() {
      return this.departments.map((d) => ({
        key: d.key,
        label: this.$t(`view.executive.department.${d.key}`),
        savedDays: this.savedMap[d.key] ?? d.standardDays,
        medianTotal: d.median?.total,
        p90Total: d.p90?.total
      }))
    },

    hasChanges() {
      return hasDraftChanges(this.draftMap, this.savedMap)
    }
  },

  methods: {
    formatDays(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value) : '—'
    },

    resetDraftFromSaved() {
      this.draftMap = { ...this.savedMap }
      this.remark = ''
      this.remarkError = ''
    },

    onOpen() {
      this.resetDraftFromSaved()
      this.isOpen = true
    },

    onClose() {
      this.isOpen = false
      this.$emit('draft-change', [])
    },

    onDraftInput() {
      if (this.draftDebounceTimer) clearTimeout(this.draftDebounceTimer)
      this.draftDebounceTimer = setTimeout(() => {
        this.$emit('draft-change', hasDraftChanges(this.draftMap, this.savedMap) ? buildDraftStandardsPayload(this.draftMap) : [])
      }, DRAFT_DEBOUNCE_MS)
    },

    onCancelDraft() {
      this.resetDraftFromSaved()
      this.$emit('draft-change', [])
    },

    onOpenHistory(dept) {
      this.historyDeptKey = dept.key
      this.historyDeptLabel = dept.label
      this.isHistoryOpen = true
    },

    async onSave() {
      if (!this.remark.trim()) {
        this.remarkError = this.$t('view.productionInsight.wip.standardsRemarkRequired')
        warning(this.$t('view.productionInsight.wip.standardsRemarkRequired'))
        return
      }
      const items = buildDraftStandardsPayload(this.draftMap)
      await this.productionInsightStore.saveStageStandards({ items, remark: this.remark })
      success(this.$t('view.productionInsight.wip.standardsSaveSuccess'))
      this.isOpen = false
      this.$emit('draft-change', [])
      this.$emit('saved')
    }
  }
}
</script>

<style lang="scss" scoped>
.wip-standards-panel__body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
  padding: var(--sp-xl);
}

.wip-standards-panel__readonly-note {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  margin: 0;
  padding: var(--sp-sm) var(--sp-md);
  border-radius: var(--radius-md);
  background: var(--color-highlight-bg);
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}

.wip-standards-panel__field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: var(--sp-md);
  border-bottom: 1px solid var(--color-border);
}

.wip-standards-panel__readonly-value {
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--base-font-color);
}

.wip-standards-panel__reference {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.wip-standards-panel__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
}
</style>
