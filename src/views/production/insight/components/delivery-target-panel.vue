<!--
  delivery-target-panel — ปุ่ม "ตั้งเป้าส่งตรงเวลา" + แผง DrawerGeneric ตั้งเป้า % ตรงเวลา (ค่าเดียว
  ระดับทั้งบริษัท ไม่ใช่รายแผนกแบบ wip-standards-panel.vue) — เห็นปุ่มได้ทุกคน แก้ไขค่าได้เฉพาะผู้มีสิทธิ์
  production:standard-edit (hasStandardEditAccess) คนอื่นเห็นค่าปัจจุบัน + ประวัติ แบบอ่านอย่างเดียว

  Draft semantics: แก้ค่าในแผง = DRAFT เท่านั้น (ยังไม่บันทึก) — emit `draft-change(percent|null)` แบบ
  debounce ให้ parent (delivery-section.vue) เอาไปยิง Delivery ใหม่พร้อม draftTargetPercent ให้ KPI/กราฟ
  preview ค่าใหม่แบบ real-time ก่อนกดบันทึกจริง — "บันทึกเป้า" ต้องมีหมายเหตุเสมอ (SaveDeliveryTarget)
  ปิดแผงหรือกด "ยกเลิกร่าง" = ทิ้ง draft (emit draft-change(null) ให้ parent เลิก preview)

  Props:
    savedTarget          — Object (required) — DeliveryTarget ที่บันทึกไว้จริง {targetPercent,effectiveFrom,createBy,remark}
    currentOnTimePercent — Number|null (null) — % ตรงเวลาจริงในช่วงที่เลือกตอนนี้ (ใช้เป็นข้อความอ้างอิง)

  Emits: draft-change(percent|null), saved
-->
<template>
  <div class="delivery-target-panel">
    <ButtonGeneric variant="outline" icon="bi-gear" :label="$t('view.productionInsight.delivery.targetButton')" @click="onOpen" />

    <DrawerGeneric :show="isOpen" :title="$t('view.productionInsight.delivery.targetPanelTitle')" width="400px" headerVariant="main" :isShowActionPart="canEdit" @close="onClose">
      <template #content>
        <div class="delivery-target-panel__body">
          <p v-if="!canEdit" class="delivery-target-panel__readonly-note">
            <i class="bi bi-info-circle"></i>
            {{ $t('view.productionInsight.delivery.targetReadOnlyNote') }}
          </p>

          <FormFieldGeneric :label="$t('view.productionInsight.delivery.targetLabel')">
            <InputTextGeneric v-if="canEdit" v-model.number="draftTarget" type="number" :min="0" :max="100" @update:modelValue="onDraftInput" />
            <span v-else class="delivery-target-panel__readonly-value">{{ savedTarget.targetPercent ?? '—' }}%</span>
          </FormFieldGeneric>
          <p class="delivery-target-panel__reference">
            {{ $t('view.productionInsight.delivery.targetReferenceText', { percent: formatPercent(currentOnTimePercent) }) }}
          </p>
          <ButtonGeneric variant="plain" :label="$t('view.productionInsight.delivery.targetHistoryLink')" @click="isHistoryOpen = true" />

          <FormFieldGeneric v-if="canEdit" :label="$t('view.productionInsight.wip.standardsRemarkLabel')" :required="true" :error="remarkError">
            <TextareaGeneric v-model="remark" :rows="3" :placeholder="$t('view.productionInsight.delivery.targetRemarkPlaceholder')" />
          </FormFieldGeneric>
        </div>
      </template>

      <template #action>
        <div class="delivery-target-panel__actions">
          <ButtonGeneric variant="outline" :disabled="!hasChanges" :label="$t('view.productionInsight.delivery.targetCancelDraftBtn')" @click="onCancelDraft" />
          <ButtonGeneric variant="main" icon="bi-check-lg" :disabled="!hasChanges" :label="$t('view.productionInsight.delivery.targetSaveBtn')" @click="onSave" />
        </div>
      </template>
    </DrawerGeneric>

    <DeliveryTargetHistoryModal :show="isHistoryOpen" @closeModal="isHistoryOpen = false" />
  </div>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { hasStandardEditAccess } from '@/services/permission/standard-edit-access.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'

import DrawerGeneric from '@/components/generic/DrawerGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import DeliveryTargetHistoryModal from './delivery-target-history-modal.vue'

const DRAFT_DEBOUNCE_MS = 400

export default {
  name: 'DeliveryTargetPanel',

  components: {
    DrawerGeneric,
    ButtonGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    DeliveryTargetHistoryModal
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  props: {
    savedTarget: {
      type: Object,
      required: true
    },
    currentOnTimePercent: {
      type: Number,
      default: null
    }
  },

  emits: ['draft-change', 'saved'],

  data() {
    return {
      isOpen: false,
      draftTarget: null,
      remark: '',
      remarkError: '',
      isHistoryOpen: false,
      draftDebounceTimer: null
    }
  },

  computed: {
    canEdit() {
      return hasStandardEditAccess()
    },

    hasChanges() {
      return (this.draftTarget ?? null) !== (this.savedTarget.targetPercent ?? null)
    }
  },

  methods: {
    formatPercent(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)}%` : '—'
    },

    resetDraftFromSaved() {
      this.draftTarget = this.savedTarget.targetPercent ?? null
      this.remark = ''
      this.remarkError = ''
    },

    onOpen() {
      this.resetDraftFromSaved()
      this.isOpen = true
    },

    onClose() {
      this.isOpen = false
      this.$emit('draft-change', null)
    },

    onDraftInput() {
      if (this.draftDebounceTimer) clearTimeout(this.draftDebounceTimer)
      this.draftDebounceTimer = setTimeout(() => {
        this.$emit('draft-change', this.hasChanges ? this.draftTarget : null)
      }, DRAFT_DEBOUNCE_MS)
    },

    onCancelDraft() {
      this.resetDraftFromSaved()
      this.$emit('draft-change', null)
    },

    async onSave() {
      if (!this.remark.trim()) {
        this.remarkError = this.$t('view.productionInsight.wip.standardsRemarkRequired')
        warning(this.$t('view.productionInsight.wip.standardsRemarkRequired'))
        return
      }
      await this.productionInsightStore.saveDeliveryTarget({ targetPercent: this.draftTarget, remark: this.remark })
      success(this.$t('view.productionInsight.delivery.targetSaveSuccess'))
      this.isOpen = false
      this.$emit('draft-change', null)
      this.$emit('saved')
    }
  }
}
</script>

<style lang="scss" scoped>
.delivery-target-panel__body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
  padding: var(--sp-xl);
}

.delivery-target-panel__readonly-note {
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

.delivery-target-panel__readonly-value {
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--base-font-color);
}

.delivery-target-panel__reference {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.delivery-target-panel__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
}
</style>
