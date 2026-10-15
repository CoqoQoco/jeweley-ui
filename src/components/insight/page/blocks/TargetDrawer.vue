<!--
  TargetDrawer — ปุ่ม + DrawerGeneric ตั้งค่าเป้า/มาตรฐานรายแถวแบบ generic (draft → preview → บันทึกพร้อมหมายเหตุ → ประวัติ)
  พฤติกรรมเหมือน wip-standards-panel.vue เดิมทุกประการ แต่ผูกกับ preset (target-presets.js) แทน hardcode:
    - เห็นปุ่มได้ทุกคน แก้ค่าได้เฉพาะผู้มีสิทธิ์ (preset.canEdit) คนอื่นเห็นค่า+ประวัติอย่างเดียว
    - แก้ค่า = DRAFT เท่านั้น → ctx.setState(preset.draftStateKey, items) แบบ debounce ให้ source ที่อ่าน draft ยิง preview ใหม่
    - บันทึกต้องมีหมายเหตุเสมอ · ปิด/ยกเลิก = ทิ้ง draft · บันทึกสำเร็จ → ctx.reload(preset.reloadSources)

  Props: preset (string) ชื่อใน TARGET_PRESETS · ctx (Object) context ของ InsightPage
-->
<template>
  <div class="target-drawer">
    <ButtonGeneric variant="outline" icon="bi-gear" :label="$t(presetDef.text.button)" :title="presetDef.text.buttonTip ? $t(presetDef.text.buttonTip) : ''" @click="onOpen" />

    <DrawerGeneric :show="isOpen" :title="$t(presetDef.text.title)" :width="presetDef.width" headerVariant="main" :isShowActionPart="canEdit" @close="onClose">
      <template #content>
        <div class="target-drawer__body">
          <p v-if="!canEdit" class="target-drawer__readonly-note">
            <i class="bi bi-info-circle"></i>
            {{ $t(presetDef.text.readOnly) }}
          </p>

          <template v-for="(row, index) in rows" :key="row.key">
            <!-- row.section / row.group = หัวข้อกลุ่ม (เช่น "เป้าตามใบ slip" > "ทอง") แสดงเมื่อต่างจากแถวก่อนหน้า -->
            <p v-if="row.section && row.section !== rows[index - 1]?.section" :class="['target-drawer__section-title', { 'target-drawer__section-title--divided': index > 0 }]">{{ row.section }}</p>
            <p v-if="row.group && (row.group !== rows[index - 1]?.group || row.section !== rows[index - 1]?.section)" class="target-drawer__group-title">{{ row.group }}</p>
            <div class="target-drawer__field" :class="{ 'target-drawer__field--single': rows.length === 1 }">
              <FormFieldGeneric :label="row.label">
                <InputTextGeneric
                  v-if="canEdit"
                  v-model.number="draftMap[row.key]"
                  type="number"
                  :min="presetDef.min"
                  :max="presetDef.max"
                  @update:modelValue="onDraftInput"
                />
                <span v-else class="target-drawer__readonly-value">{{ presetDef.savedText(row) }}</span>
              </FormFieldGeneric>
              <p v-if="referenceText(row)" class="target-drawer__reference">
                {{ referenceText(row) }}
              </p>
              <ButtonGeneric variant="plain" :label="$t(presetDef.text.historyLink)" @click="onOpenHistory(row)" />
            </div>
          </template>

          <FormFieldGeneric v-if="canEdit" :label="$t(presetDef.text.remarkLabel)" :required="true" :error="remarkError">
            <TextareaGeneric v-model="remark" :rows="3" :placeholder="$t(presetDef.text.remarkPlaceholder)" />
          </FormFieldGeneric>
        </div>
      </template>

      <template #action>
        <div class="target-drawer__actions">
          <ButtonGeneric variant="outline" :disabled="!hasChanges" :label="$t(presetDef.text.cancelBtn)" @click="onCancelDraft" />
          <ButtonGeneric variant="main" icon="bi-check-lg" :disabled="!hasChanges" :label="$t(presetDef.text.saveBtn)" @click="onSave" />
        </div>
      </template>
    </DrawerGeneric>

    <modal :showModal="isHistoryOpen" width="600px" @closeModal="isHistoryOpen = false">
      <template #title>
        <span class="title-text-lg">{{ $t(presetDef.text.historyTitle, { name: historyLabel }) }}</span>
      </template>
      <template #content>
        <div v-if="!historyRows.length" class="target-drawer__empty">{{ $t(presetDef.text.historyEmpty) }}</div>
        <div v-else class="responsive-table-wrapper">
          <BaseDataTable :items="historyRows" :columns="historyColumns" :paginator="false" :dataKey="presetDef.historyDataKey">
            <template v-for="col in formattedColumns" :key="col.field" #[`${col.field}Template`]="{ data }">
              <div :class="{ 'text-right': col.align === 'right' }">{{ formatCell(col, data) }}</div>
            </template>
          </BaseDataTable>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import { getTargetPreset } from './target-presets.js'
import { buildDraftEmission, emptyDraftOf, validateRemark, formatHistoryCell } from './target-drawer-helpers.js'

import DrawerGeneric from '@/components/generic/DrawerGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'TargetDrawer',

  components: { DrawerGeneric, ButtonGeneric, FormFieldGeneric, InputTextGeneric, TextareaGeneric, BaseDataTable, modal },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  props: {
    preset: { type: String, required: true },
    ctx: { type: Object, required: true }
  },

  data() {
    return {
      isOpen: false,
      draftMap: {},
      remark: '',
      remarkError: '',
      isHistoryOpen: false,
      historyLabel: '',
      historyRows: [],
      draftTimer: null
    }
  },

  computed: {
    presetDef() {
      return getTargetPreset(this.preset)
    },

    canEdit() {
      return this.presetDef.canEdit()
    },

    rows() {
      return this.presetDef.rows(this.ctx, (key) => this.$t(key))
    },

    savedMap() {
      return this.presetDef.savedMap(this.ctx)
    },

    hasChanges() {
      return this.presetDef.hasChanges(this.draftMap, this.savedMap)
    },

    historyColumns() {
      return this.presetDef.historyColumns.map((col) => ({ field: col.field, header: this.$t(col.header), sortable: false, minWidth: col.minWidth, align: col.align }))
    },

    // คอลัมน์ประวัติที่ต้องจัดรูปแบบเอง (วันที่ / ต่อท้าย % / จัดชิดขวา)
    formattedColumns() {
      return this.presetDef.historyColumns.filter((col) => col.date || col.suffix)
    }
  },

  beforeUnmount() {
    if (this.draftTimer) clearTimeout(this.draftTimer)
  },

  methods: {
    formatCell: formatHistoryCell,

    translate(key, params) {
      return this.$t(key, params)
    },

    referenceText(row) {
      return this.presetDef.referenceText(row, this.ctx, this.translate)
    },

    resetDraftFromSaved() {
      this.draftMap = { ...this.savedMap }
      this.remark = ''
      this.remarkError = ''
    },

    emitDraft(items) {
      this.ctx.setState(this.presetDef.draftStateKey, items)
    },

    onOpen() {
      this.resetDraftFromSaved()
      this.isOpen = true
    },

    onClose() {
      this.isOpen = false
      this.emitDraft(emptyDraftOf(this.presetDef))
    },

    onDraftInput() {
      if (this.draftTimer) clearTimeout(this.draftTimer)
      this.draftTimer = setTimeout(() => this.emitDraft(buildDraftEmission(this.presetDef, this.draftMap, this.savedMap)), this.presetDef.debounceMs)
    },

    onCancelDraft() {
      this.resetDraftFromSaved()
      this.emitDraft(emptyDraftOf(this.presetDef))
    },

    async onOpenHistory(row) {
      this.historyLabel = row.historyLabel || row.label
      this.historyRows = (await this.presetDef.history(this.productionInsightStore, row.key, row)) || []
      this.isHistoryOpen = true
    },

    async onSave() {
      if (!validateRemark(this.remark)) {
        this.remarkError = this.$t(this.presetDef.text.remarkRequired)
        warning(this.remarkError)
        return
      }
      await this.presetDef.save(this.productionInsightStore, { items: this.presetDef.buildPayload(this.draftMap), remark: this.remark })
      success(this.$t(this.presetDef.text.saveSuccess))
      this.isOpen = false
      this.emitDraft(emptyDraftOf(this.presetDef))
      this.ctx.reload(this.presetDef.reloadSources)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.target-drawer__body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
  padding: var(--sp-xl);
}

.target-drawer__readonly-note {
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

.target-drawer__field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: var(--sp-md);
  border-bottom: 1px solid var(--color-border);
}

.target-drawer__field--single {
  padding-bottom: 0;
  border-bottom: 0;
}

.target-drawer__section-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--base-font-color);

  &--divided {
    padding-top: var(--sp-lg);
    border-top: 1px solid var(--color-border);
  }
}

.target-drawer__group-title {
  margin: 0;
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--base-sub-color);
  text-transform: uppercase;
}

.target-drawer__readonly-value {
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--base-font-color);
}

.target-drawer__reference {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.target-drawer__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
}

.target-drawer__empty {
  padding: var(--sp-xl) 0;
  text-align: center;
  color: var(--base-sub-color);
}
</style>
