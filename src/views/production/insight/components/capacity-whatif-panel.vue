<!--
  capacity-whatif-panel — "ลองจำลองเพิ่ม/ลดคน" (reportRef: capWhatIf) ของหมวด "กำลังการผลิต" — client-side
  ล้วน ไม่มี API ไม่มีการบันทึก (แก้เลขแล้วเห็นผลทันทีในเบราว์เซอร์ตัวเอง ปิดหน้าแล้วหาย) สมมติอัตราใบ/ช่างคงที่
  เท่าปัจจุบัน (คำนวณจาก exitsPerMonth ÷ workersMedian แบบไม่ปัดเศษ ไม่ใช่ field plansPerWorker ที่ API ปัดมา
  ให้แล้ว — กันสถานการณ์ "ไม่เปลี่ยนอะไรเลย" ดันได้เลขไม่เท่าเดิมจาก rounding error) คำนวณ exits/คิวเทียบเท่าใหม่
  จากจำนวนช่างที่จำลอง — ไม่รวมแผนก "บัตรต้นทุน" (วิเคราะห์แยกที่กล่อง "บัตรต้นทุน → สำเร็จ") และไม่รวมแผนกที่
  ไม่มีช่างเลย (workersMedian 0/null เช่น "ออกแบบ" — ไม่มีฐานให้จำลองคำนวณได้) ยังคงอยู่ในตารางหลัก
  (capacity-department-table.vue) ตามปกติ มีแค่แผงจำลองนี้ที่ตัดออก พร้อม note บอกรายชื่อแผนกที่ไม่รวม

  Props:
    departments — Array (required) จาก Capacity.departments
    loading     — Boolean (false)
-->
<template>
  <div id="insight-report-capWhatIf" class="capacity-whatif-panel">
    <SectionCardGeneric
      :title="$t('view.productionInsight.capacity.whatIfTitle')"
      :titleTip="$t('view.productionInsight.help.capacityWhatIf')"
      icon="bi-sliders"
      accent="main"
      headerStyle="legend"
    >
      <div class="capacity-whatif-panel__toolbar">
        <p class="capacity-whatif-panel__hint">{{ $t('view.productionInsight.capacity.whatIfAssumptionNote') }}</p>
        <ButtonGeneric variant="outline" :label="$t('common.btn.reset')" @click="onReset" />
      </div>

      <div class="responsive-table-wrapper">
        <BaseDataTable :items="rows" :columns="columns" :paginator="false" dataKey="key" :loading="loading">
          <template #labelTemplate="{ data }">
            <strong>{{ data.label }}</strong>
            <span v-if="data.key === bottleneckNowKey" class="capacity-whatif-panel__bottleneck-chip">{{ $t('view.productionInsight.capacity.deptBottleneckChip') }}</span>
          </template>

          <template #workersMedianTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.workersMedian) }}</div>
          </template>

          <template #workersTemplate="{ data }">
            <InputTextGeneric :modelValue="data.workers" type="number" :min="0" :max="50" @update:modelValue="onWorkersInput(data.key, $event)" />
          </template>

          <template #exitsTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.exitsPerMonth) }} → {{ formatCount(data.exitsNew) }}</div>
          </template>

          <template #queueDaysTemplate="{ data }">
            <div class="text-right capacity-whatif-panel__queue-cell">
              {{ formatDays(data.queueDaysNow) }} → {{ formatDays(data.queueDaysNew) }}
              <span v-if="data.key === bottleneckNewKey" class="capacity-whatif-panel__bottleneck-chip">{{ $t('view.productionInsight.capacity.deptBottleneckChip') }}</span>
            </div>
          </template>
        </BaseDataTable>
      </div>

      <p class="capacity-whatif-panel__total">
        {{ $t('view.productionInsight.capacity.whatIfTotalQueueDays', { now: formatDays(totalQueueDaysNow), new: formatDays(totalQueueDaysNew) }) }}
      </p>
      <p class="capacity-whatif-panel__total">
        {{
          $t('view.productionInsight.capacity.whatIfTotalBottleneck', {
            now: bottleneckNowLabel,
            new: bottleneckNewLabel
          })
        }}
      </p>

      <p class="capacity-whatif-panel__note">
        <i class="bi bi-info-circle"></i>
        {{ $t('view.productionInsight.capacity.whatIfInflowNote') }}
      </p>
      <p v-if="excludedDeptLabels" class="capacity-whatif-panel__note">
        <i class="bi bi-info-circle"></i>
        {{ $t('view.productionInsight.capacity.whatIfExcludedNote', { depts: excludedDeptLabels }) }}
      </p>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { buildWhatIfDefaultMap, buildWhatIfRows, resolveWhatIfExcludedDeptKeys, sumWhatIfField, resolveWhatIfBottleneck } from './capacity-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'CapacityWhatIfPanel',

  components: {
    SectionCardGeneric,
    ButtonGeneric,
    InputTextGeneric,
    BaseDataTable
  },

  props: {
    departments: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      workersMap: {}
    }
  },

  computed: {
    columns() {
      return [
        { field: 'label', header: this.$t('view.productionInsight.capacity.deptColDept'), sortable: false, minWidth: '110px' },
        { field: 'workersMedian', header: this.$t('view.productionInsight.capacity.whatIfColWorkersNow'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'workers', header: this.$t('view.productionInsight.capacity.whatIfColWorkersNew'), sortable: false, minWidth: '110px' },
        { field: 'exits', header: this.$t('view.productionInsight.capacity.whatIfColExits'), sortable: false, minWidth: '140px', align: 'right' },
        { field: 'queueDays', header: this.$t('view.productionInsight.capacity.whatIfColQueueDays'), sortable: false, minWidth: '160px', align: 'right' }
      ]
    },

    rows() {
      return buildWhatIfRows(this.departments, this.workersMap).map((r) => ({ ...r, label: this.$t(`view.executive.department.${r.key}`) }))
    },

    totalQueueDaysNow() {
      return sumWhatIfField(this.rows, 'queueDaysNow')
    },

    totalQueueDaysNew() {
      return sumWhatIfField(this.rows, 'queueDaysNew')
    },

    bottleneckNowKey() {
      return resolveWhatIfBottleneck(this.rows, 'queueDaysNow')
    },

    bottleneckNewKey() {
      return resolveWhatIfBottleneck(this.rows, 'queueDaysNew')
    },

    bottleneckNowLabel() {
      return this.bottleneckNowKey ? this.$t(`view.executive.department.${this.bottleneckNowKey}`) : '—'
    },

    bottleneckNewLabel() {
      return this.bottleneckNewKey ? this.$t(`view.executive.department.${this.bottleneckNewKey}`) : '—'
    },

    // รายชื่อแผนกที่ไม่รวมในแผงจำลอง (ไม่มีช่างให้จำลอง/บัตรต้นทุน) — ใช้ทำ note ใต้ตาราง ว่างเมื่อไม่มีแผนก
    // ไหนถูกตัดออกเลย (ไม่ render note)
    excludedDeptLabels() {
      const keys = resolveWhatIfExcludedDeptKeys(this.departments)
      if (!keys.length) return ''
      return keys.map((key) => this.$t(`view.executive.department.${key}`)).join(', ')
    }
  },

  watch: {
    // เซ็ตค่าเริ่มต้นแค่ครั้งแรกที่ departments มีข้อมูลจริง (ไม่ reset ทับค่าที่ผู้ใช้กำลังจำลองอยู่ทุกครั้งที่
    // ตัวกรองเปลี่ยนแล้วแผนกยิงใหม่ — มีปุ่ม "รีเซ็ต" ให้กดเองตอนอยากเริ่มใหม่)
    departments: {
      immediate: true,
      handler(deps) {
        if (!Object.keys(this.workersMap).length && deps && deps.length) {
          this.workersMap = buildWhatIfDefaultMap(deps)
        }
      }
    }
  },

  methods: {
    onWorkersInput(key, value) {
      const workers = Number(value)
      this.workersMap = { ...this.workersMap, [key]: Number.isFinite(workers) ? Math.min(50, Math.max(0, workers)) : 0 }
    },

    onReset() {
      this.workersMap = buildWhatIfDefaultMap(this.departments)
    },

    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    formatDays(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)} ${this.$t('view.productionInsight.capacity.daysUnit')}` : '—'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.capacity-whatif-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.capacity-whatif-panel__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
  margin-bottom: var(--sp-md);
}

.capacity-whatif-panel__hint {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.capacity-whatif-panel__queue-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-xs);
}

// ชิปคอขวด — พื้นเต็มสีแดง ไม่ใช้แถบซ้าย (ห้าม border-left accent ตาม Core Principle #14)
.capacity-whatif-panel__bottleneck-chip {
  display: inline-flex;
  align-items: center;
  padding: 1px var(--sp-xs);
  margin-left: var(--sp-xs);
  border-radius: var(--radius-sm);
  background: var(--base-red);
  color: var(--on-inverse);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.capacity-whatif-panel__total {
  margin: var(--sp-sm) 0 0;
  font-size: var(--fs-sm);
  color: var(--base-font-color);
  font-weight: 600;
}

.capacity-whatif-panel__note {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  margin: var(--sp-md) 0 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}
</style>
