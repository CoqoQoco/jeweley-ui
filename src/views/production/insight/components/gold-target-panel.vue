<!--
  gold-target-panel — ปุ่ม "ตั้งเป้า Loss" + แผง DrawerGeneric ตั้งเป้า % Loss ต่อ (ประเภทช่าง, โลหะ) — 4 แถว
  คงที่ จัดกลุ่มตามโลหะ (ทอง → ช่างฝัง/ช่างแต่ง, เงิน → ช่างฝัง/ช่างแต่ง — ไม่ใช่รายแผนกแบบ
  wip-standards-panel.vue ไม่ใช่ค่าเดียวแบบ delivery-target-panel.vue) — เห็นปุ่มได้ทุกคน แก้ไขค่าได้เฉพาะผู้มี
  สิทธิ์ production:standard-edit (hasStandardEditAccess) คนอื่นเห็นค่าปัจจุบัน + ประวัติ แบบอ่านอย่างเดียว

  Draft semantics: แก้ค่าในแผง = DRAFT เท่านั้น (ยังไม่บันทึก) — emit `draft-change(items)` แบบ debounce ให้
  parent (gold-section.vue) เอาไปยิง Gold ใหม่พร้อม draftTargets ให้ KPI/กราฟ preview ค่าใหม่แบบ real-time
  ก่อนกดบันทึกจริง — "บันทึกเป้า" ต้องมีหมายเหตุเสมอ (SaveGoldLossTargets) ปิดแผงหรือกด "ยกเลิกร่าง" = ทิ้ง
  draft (emit draft-change([]) ให้ parent เลิก preview)

  Props:
    targets     — Array (required) — GoldLossTargets ที่บันทึกไว้จริงครบทั้ง 4 ชุด
                  [{workerType,metal,targetPercent,effectiveFrom,createBy,remark}]
    kpi         — Array (required) — Gold.kpi ของโลหะที่กำลังดูอยู่เท่านั้น (activeMetal) — ใช้ทำข้อความ
                  อ้างอิง "% Loss จริงตอนนี้" เฉพาะแถวของโลหะนั้น แถวโลหะอื่นไม่มีอ้างอิงให้ (ไม่มีข้อมูล)
    activeMetal — String ('GOLD') — โลหะที่หน้ากำลังแสดงอยู่ตอนนี้ (ตัดสินว่าแถวไหนมีข้อความอ้างอิงจาก kpi)

  Emits: draft-change(items), saved
-->
<template>
  <div class="gold-target-panel">
    <ButtonGeneric variant="outline" icon="bi-gear" :label="$t('view.productionInsight.gold.targetButton')" @click="onOpen" />

    <DrawerGeneric :show="isOpen" :title="$t('view.productionInsight.gold.targetPanelTitle')" width="440px" headerVariant="main" :isShowActionPart="canEdit" @close="onClose">
      <template #content>
        <div class="gold-target-panel__body">
          <p v-if="!canEdit" class="gold-target-panel__readonly-note">
            <i class="bi bi-info-circle"></i>
            {{ $t('view.productionInsight.gold.targetReadOnlyNote') }}
          </p>

          <div v-for="group in groupedRows" :key="group.metal" class="gold-target-panel__metal-group">
            <p class="gold-target-panel__metal-title">{{ group.label }}</p>
            <div v-for="row in group.rows" :key="row.key" class="gold-target-panel__field">
              <FormFieldGeneric :label="row.label">
                <InputTextGeneric
                  v-if="canEdit"
                  v-model.number="draftMap[row.key]"
                  type="number"
                  :min="0"
                  :max="100"
                  @update:modelValue="onDraftInput"
                />
                <span v-else class="gold-target-panel__readonly-value">{{ row.savedPercent ?? '—' }}%</span>
              </FormFieldGeneric>
              <p v-if="row.currentLossPercent != null" class="gold-target-panel__reference">
                {{ $t('view.productionInsight.gold.targetReferenceText', { percent: formatPercent(row.currentLossPercent) }) }}
              </p>
              <ButtonGeneric variant="plain" :label="$t('view.productionInsight.gold.targetHistoryLink')" @click="onOpenHistory(row)" />
            </div>
          </div>

          <FormFieldGeneric v-if="canEdit" :label="$t('view.productionInsight.wip.standardsRemarkLabel')" :required="true" :error="remarkError">
            <TextareaGeneric v-model="remark" :rows="3" :placeholder="$t('view.productionInsight.wip.standardsRemarkPlaceholder')" />
          </FormFieldGeneric>
        </div>
      </template>

      <template #action>
        <div class="gold-target-panel__actions">
          <ButtonGeneric variant="outline" :disabled="!hasChanges" :label="$t('view.productionInsight.gold.targetCancelDraftBtn')" @click="onCancelDraft" />
          <ButtonGeneric variant="main" icon="bi-check-lg" :disabled="!hasChanges" :label="$t('view.productionInsight.gold.targetSaveBtn')" @click="onSave" />
        </div>
      </template>
    </DrawerGeneric>

    <GoldTargetHistoryModal
      :show="isHistoryOpen"
      :workerType="historyWorkerType"
      :metal="historyMetal"
      :label="historyLabel"
      @closeModal="isHistoryOpen = false"
    />
  </div>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { hasStandardEditAccess } from '@/services/permission/standard-edit-access.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import { buildGoldDraftTargetsPayload, buildGoldTargetKey, hasGoldDraftChanges } from './gold-helpers.js'

import DrawerGeneric from '@/components/generic/DrawerGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import GoldTargetHistoryModal from './gold-target-history-modal.vue'

const WORKER_TYPE_ORDER = [80, 50]
const METAL_ORDER = ['GOLD', 'SILVER']
const DRAFT_DEBOUNCE_MS = 400

export default {
  name: 'GoldTargetPanel',

  components: {
    DrawerGeneric,
    ButtonGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    GoldTargetHistoryModal
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  props: {
    targets: {
      type: Array,
      required: true
    },
    kpi: {
      type: Array,
      required: true
    },
    activeMetal: {
      type: String,
      default: 'GOLD'
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
      historyWorkerType: null,
      historyMetal: null,
      historyLabel: '',
      draftDebounceTimer: null
    }
  },

  computed: {
    canEdit() {
      return hasStandardEditAccess()
    },

    savedMap() {
      const map = {}
      this.targets.forEach((t) => {
        map[buildGoldTargetKey(t.workerType, t.metal)] = t.targetPercent
      })
      return map
    },

    // แถวโลหะที่ตรงกับ activeMetal เท่านั้นที่มีข้อความอ้างอิง "% Loss จริงตอนนี้" ได้ (kpi prop เป็นของโลหะ
    // ที่กำลังดูอยู่เพียงโลหะเดียว — แถวโลหะอื่นไม่มีข้อมูลให้แสดง ไม่ใช่โชว์เลขของอีกโลหะมาแทน)
    rows() {
      return METAL_ORDER.flatMap((metal) =>
        WORKER_TYPE_ORDER.map((workerType) => {
          const key = buildGoldTargetKey(workerType, metal)
          return {
            key,
            workerType,
            metal,
            label: this.$t(`view.productionInsight.gold.workerType.${workerType}`),
            savedPercent: this.savedMap[key] ?? null,
            currentLossPercent: metal === this.activeMetal ? this.kpi.find((k) => k.workerType === workerType)?.lossPercent ?? null : null
          }
        })
      )
    },

    groupedRows() {
      return METAL_ORDER.map((metal) => ({
        metal,
        label: this.$t(`view.productionInsight.gold.metalLabel.${metal}`),
        rows: this.rows.filter((row) => row.metal === metal)
      }))
    },

    hasChanges() {
      return hasGoldDraftChanges(this.draftMap, this.savedMap)
    }
  },

  methods: {
    formatPercent(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)}%` : '—'
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
        this.$emit('draft-change', hasGoldDraftChanges(this.draftMap, this.savedMap) ? buildGoldDraftTargetsPayload(this.draftMap) : [])
      }, DRAFT_DEBOUNCE_MS)
    },

    onCancelDraft() {
      this.resetDraftFromSaved()
      this.$emit('draft-change', [])
    },

    onOpenHistory(row) {
      this.historyWorkerType = row.workerType
      this.historyMetal = row.metal
      this.historyLabel = `${row.label} — ${this.$t(`view.productionInsight.gold.metalLabel.${row.metal}`)}`
      this.isHistoryOpen = true
    },

    async onSave() {
      if (!this.remark.trim()) {
        this.remarkError = this.$t('view.productionInsight.wip.standardsRemarkRequired')
        warning(this.$t('view.productionInsight.wip.standardsRemarkRequired'))
        return
      }
      const items = buildGoldDraftTargetsPayload(this.draftMap)
      await this.productionInsightStore.saveGoldLossTargets({ items, remark: this.remark })
      success(this.$t('view.productionInsight.gold.targetSaveSuccess'))
      this.isOpen = false
      this.$emit('draft-change', [])
      this.$emit('saved')
    }
  }
}
</script>

<style lang="scss" scoped>
.gold-target-panel__body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
  padding: var(--sp-xl);
}

.gold-target-panel__readonly-note {
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

.gold-target-panel__metal-group + .gold-target-panel__metal-group {
  margin-top: var(--sp-md);
}

.gold-target-panel__metal-title {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--base-sub-color);
  text-transform: uppercase;
}

.gold-target-panel__field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: var(--sp-md);
  border-bottom: 1px solid var(--color-border);
}

.gold-target-panel__readonly-value {
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--base-font-color);
}

.gold-target-panel__reference {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.gold-target-panel__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
}
</style>
