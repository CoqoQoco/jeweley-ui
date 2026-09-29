<!--
  FilterPanelGeneric — thin wrapper รอบ DrawerGeneric สำหรับ "panel ตัวกรอง" แบบ Dashboard v2
  (ปุ่ม "ตัวกรอง (n)" เปิด slide panel แทน SearchBarGeneric เต็มความกว้าง — ใช้เมื่อ filter เกิน ~4 ช่อง)

  Draft semantics: component นี้ไม่ถือค่าตัวกรองเอง — parent เป็นคนสร้าง "draft" (สำเนาค่าที่ apply อยู่)
  แล้ว bind field ใน slot #global/#section เข้ากับ draft นั้นโดยตรง ปิด panel โดยไม่กด "ใช้ตัวกรอง"
  (Esc/✕/คลิก backdrop) = ทิ้ง draft ไปเฉยๆ ไม่กระทบค่าที่ apply อยู่จริง — parent ฟัง event `close`
  แล้วเลือกเองว่าจะทิ้ง draft หรือไม่

  ตัวอย่างการใช้งาน:
  <FilterPanelGeneric
    :show="isFilterPanelOpen"
    :title="$t('view.x.filter.title')"
    @apply="onFilterApply"
    @clear="onFilterClear"
    @close="onFilterPanelClose"
  >
    <template #global>
      <FormFieldGeneric :label="$t('view.x.filter.dateRange')">
        <DateRangeGeneric :startDate="draft.start" :endDate="draft.end" @update:startDate="draft.start = $event" @update:endDate="draft.end = $event" />
      </FormFieldGeneric>
    </template>
    <template #section-title>{{ $t('view.x.filter.sectionWip') }}</template>
    <template #section>
      <FormFieldGeneric :label="$t('common.field.status')">
        <MultiSelectGeneric v-model="draft.status" :options="statusOptions" />
      </FormFieldGeneric>
    </template>
  </FilterPanelGeneric>

  Props:
    show   — Boolean (required) — เปิด/ปิด panel
    title  — String ('') — หัวข้อ panel (header filled)
    width  — String ('420px') — ความกว้าง panel — ≤768px บังคับเป็น 100vw เสมอ (CSS, ไม่ต้องส่ง prop)

  Slots:
    #global        — ฟิลด์ที่ใช้กับทุกหมวด (เช่น ช่วงวันที่, ชนิดทอง)
    #section-title — label ของกลุ่มฟิลด์เฉพาะหมวดที่เปิดอยู่ (ไม่ส่ง = ไม่แสดงกลุ่มนี้เลย)
    #section       — ฟิลด์เฉพาะหมวดที่เปิดอยู่

  Emits: apply, clear, close
-->
<template>
  <DrawerGeneric
    class="filter-panel-generic"
    :show="show"
    :title="title"
    :width="width"
    headerVariant="main"
    :isShowActionPart="true"
    @close="$emit('close')"
  >
    <template #content>
      <div class="filter-panel-generic__body">
        <div class="filter-panel-generic__section-label">{{ $t('view.productionInsight.filter.globalLabel') }}</div>
        <div class="filter-panel-generic__fields">
          <slot name="global" />
        </div>

        <template v-if="$slots['section-title'] || $slots.section">
          <div class="filter-panel-generic__divider"></div>
          <div class="filter-panel-generic__section-label">
            <slot name="section-title" />
          </div>
          <div class="filter-panel-generic__fields">
            <slot name="section" />
          </div>
        </template>
      </div>
    </template>

    <template #action>
      <div class="filter-panel-generic__actions">
        <ButtonGeneric variant="outline" :label="$t('common.btn.clear')" @click="$emit('clear')" />
        <ButtonGeneric variant="main" icon="bi-check-lg" :label="$t('view.productionInsight.filter.apply')" @click="$emit('apply')" />
      </div>
    </template>
  </DrawerGeneric>
</template>

<script>
import DrawerGeneric from '@/components/generic/DrawerGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'FilterPanelGeneric',

  components: {
    DrawerGeneric,
    ButtonGeneric
  },

  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '420px'
    }
  },

  emits: ['apply', 'clear', 'close']
}
</script>

<style lang="scss" scoped>
.filter-panel-generic {
  :deep(.drawer-panel) {
    @media (max-width: 768px) {
      width: 100vw !important;
    }
  }

  :deep(.drawer-footer) {
    text-align: left;
  }
}

.filter-panel-generic__body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
  padding: var(--sp-xl);
}

.filter-panel-generic__fields {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}

.filter-panel-generic__section-label {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--base-sub-color);
}

.filter-panel-generic__divider {
  border-top: 1px solid var(--color-border);
}

.filter-panel-generic__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
}
</style>
