<!--
  gold-target-panel — ปุ่ม "ตั้งเป้า Loss" + แผง DrawerGeneric ตั้งเป้า 2 กลุ่ม: (1) "เป้า % Loss ตามใบ slip"
  ต่อ (ประเภทช่าง, โลหะ) 4 แถวคงที่ scope='SLIP' (2) "เป้าตามแผนก (จ่าย − รับ)" ต่อ (แผนก, โลหะ) 6 แถวคงที่
  scope='STAGE' — ทั้ง 2 กลุ่มจัดกลุ่มย่อยตามโลหะ (ทอง → .../เงิน → ...) — เห็นปุ่มได้ทุกคน แก้ไขค่าได้เฉพาะผู้มี
  สิทธิ์ production:standard-edit (hasStandardEditAccess) คนอื่นเห็นค่าปัจจุบัน + ประวัติ แบบอ่านอย่างเดียว

  Draft semantics: แก้ค่าในแผง = DRAFT เท่านั้น (ยังไม่บันทึก) — emit `draft-change({slip,stage})` แบบ debounce
  ให้ parent (gold-section.vue) เอา slip ไปยิง Gold ใหม่ + stage ไปยิง GoldByStage ใหม่ (ทั้งคู่พร้อมกันทุกครั้ง
  ไม่ได้แยกว่าใครแก้กลุ่มไหน — ง่ายกว่า ไม่ error-prone) ให้ preview ค่าใหม่แบบ real-time ก่อนกดบันทึกจริง —
  "บันทึกเป้า" ต้องมีหมายเหตุเสมอ (SaveGoldLossTargets รวม items ทั้ง 2 scope ในคำขอเดียว) ปิดแผงหรือกด
  "ยกเลิกร่าง" = ทิ้ง draft ทั้ง 2 กลุ่ม (emit draft-change({slip:[],stage:[]}) ให้ parent เลิก preview)

  Props:
    targets          — Array (required) — GoldLossTargets ที่บันทึกไว้จริงครบทั้ง SLIP(4, workerType 50/80)+
                        STAGE(6, workerType 60/80/90) = 10 ชุด แยกด้วย field `scope` ต่อแถว [{scope,workerType,
                        metal,targetPercent,...}] — field ชื่อ workerType เสมอไม่ว่า scope ไหน (ไม่มี deptKey
                        ใน target record — ยืนยันจาก API agent)
    kpi              — Array (required) — Gold.kpi ของโลหะที่กำลังดูอยู่เท่านั้น ใช้ทำข้อความอ้างอิงกลุ่ม SLIP
    stageDepartments — Array (required) — GoldByStage.departments ของโลหะที่กำลังดูอยู่เท่านั้น ใช้ทำข้อความ
                        อ้างอิงกลุ่ม STAGE (diffPercent ปัจจุบัน)
    activeMetal      — String ('GOLD') — โลหะที่หน้ากำลังแสดงอยู่ตอนนี้ (ตัดสินว่าแถวไหนมีข้อความอ้างอิง)

  Emits: draft-change({slip:Array, stage:Array}), saved
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

          <div class="gold-target-panel__section">
            <p class="gold-target-panel__section-title">{{ $t('view.productionInsight.gold.targetSlipSectionTitle') }}</p>
            <div v-for="group in groupedRows" :key="group.metal" class="gold-target-panel__metal-group">
              <p class="gold-target-panel__metal-title">{{ group.label }}</p>
              <div v-for="row in group.rows" :key="row.key" class="gold-target-panel__field">
                <FormFieldGeneric :label="row.label">
                  <InputTextGeneric v-if="canEdit" v-model.number="draftMap[row.key]" type="number" :min="0" :max="100" @update:modelValue="onDraftInput" />
                  <span v-else class="gold-target-panel__readonly-value">{{ row.savedPercent ?? '—' }}%</span>
                </FormFieldGeneric>
                <p v-if="row.currentLossPercent != null" class="gold-target-panel__reference">
                  {{ $t('view.productionInsight.gold.targetReferenceText', { percent: formatPercent(row.currentLossPercent) }) }}
                </p>
                <ButtonGeneric variant="plain" :label="$t('view.productionInsight.gold.targetHistoryLink')" @click="onOpenHistory(row, 'SLIP')" />
              </div>
            </div>
          </div>

          <div class="gold-target-panel__section">
            <p class="gold-target-panel__section-title">{{ $t('view.productionInsight.gold.targetStageSectionTitle') }}</p>
            <div v-for="group in stageGroupedRows" :key="group.metal" class="gold-target-panel__metal-group">
              <p class="gold-target-panel__metal-title">{{ group.label }}</p>
              <div v-for="row in group.rows" :key="row.key" class="gold-target-panel__field">
                <FormFieldGeneric :label="row.label">
                  <InputTextGeneric
                    v-if="canEdit"
                    v-model.number="stageDraftMap[row.key]"
                    type="number"
                    :min="0"
                    :max="100"
                    @update:modelValue="onDraftInput"
                  />
                  <span v-else class="gold-target-panel__readonly-value">{{ row.savedPercent ?? '—' }}%</span>
                </FormFieldGeneric>
                <p v-if="row.currentDiffPercent != null" class="gold-target-panel__reference">
                  {{ $t('view.productionInsight.gold.targetReferenceText', { percent: formatPercent(row.currentDiffPercent) }) }}
                </p>
                <ButtonGeneric variant="plain" :label="$t('view.productionInsight.gold.targetHistoryLink')" @click="onOpenHistory(row, 'STAGE')" />
              </div>
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
      :scope="historyScope"
      :workerType="historyKey"
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
import { STAGE_TARGET_WORKER_TYPE_ORDER, resolveStageTargetDeptKey, buildGoldStageDraftTargetsPayload } from './gold-stage-helpers.js'

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
    stageDepartments: {
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
      stageDraftMap: {},
      remark: '',
      remarkError: '',
      isHistoryOpen: false,
      historyScope: 'SLIP',
      historyKey: null,
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
      this.targets.filter((t) => (t.scope ?? 'SLIP') === 'SLIP').forEach((t) => {
        map[buildGoldTargetKey(t.workerType, t.metal)] = t.targetPercent
      })
      return map
    },

    // ⚠️ STAGE target item ใช้ field ชื่อ `workerType` เหมือน SLIP เป๊ะ (ไม่ใช่ `deptKey`) — ยืนยันจาก API
    // agent ตรงๆ แม้ scope จะเป็น STAGE (field นี้ไม่เกี่ยวกับ deptKey ของ GoldByStage.departments/series)
    stageSavedMap() {
      const map = {}
      this.targets.filter((t) => t.scope === 'STAGE').forEach((t) => {
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

    // คู่ขนานกับ rows/groupedRows ด้านบนแต่ไล่ตาม workerType ตัวเลขของ target record (STAGE_TARGET_WORKER_TYPE_ORDER
    // = 60/80/90) แทนประเภทช่าง — label/currentDiffPercent แปลงเป็น string deptKey ก่อน (resolveStageTargetDeptKey)
    // แล้วเทียบ/แปลผ่าน view.executive.department.* ตัวเดียวกับ GoldByStage.departments[] (ของ activeMetal
    // เท่านั้นเหมือนกัน)
    stageRows() {
      return METAL_ORDER.flatMap((metal) =>
        STAGE_TARGET_WORKER_TYPE_ORDER.map((workerType) => {
          const key = buildGoldTargetKey(workerType, metal)
          const deptKey = resolveStageTargetDeptKey(workerType)
          return {
            key,
            workerType,
            metal,
            label: this.$t(`view.executive.department.${deptKey}`),
            savedPercent: this.stageSavedMap[key] ?? null,
            currentDiffPercent: metal === this.activeMetal ? this.stageDepartments.find((d) => d.deptKey === deptKey)?.diffPercent ?? null : null
          }
        })
      )
    },

    stageGroupedRows() {
      return METAL_ORDER.map((metal) => ({
        metal,
        label: this.$t(`view.productionInsight.gold.metalLabel.${metal}`),
        rows: this.stageRows.filter((row) => row.metal === metal)
      }))
    },

    hasChanges() {
      return hasGoldDraftChanges(this.draftMap, this.savedMap) || hasGoldDraftChanges(this.stageDraftMap, this.stageSavedMap)
    }
  },

  methods: {
    formatPercent(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)}%` : '—'
    },

    resetDraftFromSaved() {
      this.draftMap = { ...this.savedMap }
      this.stageDraftMap = { ...this.stageSavedMap }
      this.remark = ''
      this.remarkError = ''
    },

    onOpen() {
      this.resetDraftFromSaved()
      this.isOpen = true
    },

    onClose() {
      this.isOpen = false
      this.$emit('draft-change', { slip: [], stage: [] })
    },

    // debounce ร่วมกันทั้ง 2 กลุ่ม (ไม่ว่าแก้ฝั่งไหนก็ยิง preview ใหม่ทั้งคู่ — ง่ายกว่าแยก ไม่ error-prone)
    onDraftInput() {
      if (this.draftDebounceTimer) clearTimeout(this.draftDebounceTimer)
      this.draftDebounceTimer = setTimeout(() => {
        this.$emit('draft-change', {
          slip: hasGoldDraftChanges(this.draftMap, this.savedMap) ? buildGoldDraftTargetsPayload(this.draftMap) : [],
          stage: hasGoldDraftChanges(this.stageDraftMap, this.stageSavedMap) ? buildGoldStageDraftTargetsPayload(this.stageDraftMap) : []
        })
      }, DRAFT_DEBOUNCE_MS)
    },

    onCancelDraft() {
      this.resetDraftFromSaved()
      this.$emit('draft-change', { slip: [], stage: [] })
    },

    // ทั้ง SLIP/STAGE row ใช้ field ชื่อ workerType เหมือนกันเสมอ (ยืนยันจาก API agent — ไม่มี field แยกชื่อ
    // deptKey ใน target record) ไม่ต้องแยก key ตาม scope อีกต่อไป
    onOpenHistory(row, scope) {
      this.historyScope = scope
      this.historyKey = row.workerType
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
      const items = [...buildGoldDraftTargetsPayload(this.draftMap), ...buildGoldStageDraftTargetsPayload(this.stageDraftMap)]
      await this.productionInsightStore.saveGoldLossTargets({ items, remark: this.remark })
      success(this.$t('view.productionInsight.gold.targetSaveSuccess'))
      this.isOpen = false
      this.$emit('draft-change', { slip: [], stage: [] })
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

.gold-target-panel__section + .gold-target-panel__section {
  padding-top: var(--sp-lg);
  border-top: 1px solid var(--color-border);
}

.gold-target-panel__section-title {
  margin: 0 0 var(--sp-md);
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--base-font-color);
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
