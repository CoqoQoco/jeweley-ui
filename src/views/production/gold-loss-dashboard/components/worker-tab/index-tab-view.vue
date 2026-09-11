<template>
  <div>
    <SourceStripGeneric source="plan" />

    <div class="local-filter-row">
      <div class="local-filter-field">
        <span class="title-text">{{ $t('view.production.goldLossByWorkerAllStages.gold') }}</span>
        <MultiSelectGeneric
          v-model="localGold"
          :options="masterApiStore.gold"
          optionLabel="nameTh"
          optionValue="nameEn"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div class="local-filter-field local-filter-field--narrow">
        <span class="title-text">{{ $t('view.production.goldLossByWorkerAllStages.minJobCount') }}</span>
        <InputTextGeneric v-model.number="localMinJobCount" type="number" :min="1" />
      </div>

      <CheckboxGeneric
        v-model="localHideTestWorkers"
        class="local-filter-checkbox"
        :label="$t('view.production.goldLossByWorkerAllStages.hideTestWorkers')"
      />

      <ButtonGeneric
        variant="green"
        icon="bi-file-earmark-excel"
        class="local-filter-export"
        :title="$t('common.btn.export')"
        @click="onExport"
      />
    </div>

    <ByWorkerView
      ref="resultRef"
      :modelForm="mergedFilter"
      :hideTestWorkers="localHideTestWorkers"
      @navigate-tab="$emit('navigate-tab', $event)"
    />
  </div>
</template>

<script>
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SourceStripGeneric from '@/components/generic/SourceStripGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import ByWorkerView from './by-worker-view.vue'

export default {
  name: 'GoldLossWorkerTabView',

  components: {
    SourceStripGeneric,
    ButtonGeneric,
    InputTextGeneric,
    CheckboxGeneric,
    MultiSelectGeneric,
    ByWorkerView
  },

  setup() {
    const masterApiStore = useMasterApiStore()
    return { masterApiStore }
  },

  props: {
    filter: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['navigate-tab'],

  data() {
    return {
      localGold: [],
      localMinJobCount: 10,
      // ค่าเริ่มต้น = ซ่อน — ช่างทดสอบ (TEST TEST TEST) มีข้อมูลจริงปนอยู่และจะติดอันดับ 1 ทุกตารางถ้าไม่กรอง
      localHideTestWorkers: true
    }
  },

  computed: {
    mergedFilter() {
      return {
        start: this.filter.start,
        end: this.filter.end,
        status: this.filter.status,
        workerCode: this.filter.workerCode,
        gold: this.localGold,
        minJobCount: this.localMinJobCount || 10
      }
    }
  },

  methods: {
    onExport() {
      if (this.$refs.resultRef) this.$refs.resultRef.exportExcel()
    }
  },

  created() {
    this.masterApiStore.fetchGold()
  }
}
</script>

<style lang="scss" scoped>
.local-filter-row {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: var(--sp-md);
  margin-bottom: var(--sp-lg);

  .title-text {
    display: block;
    margin-bottom: var(--sp-xs);
    white-space: nowrap;
  }
}

.local-filter-field {
  min-width: 220px;

  &--narrow {
    min-width: 120px;
    max-width: 140px;
  }
}

.local-filter-checkbox {
  margin-bottom: var(--sp-xs);
  white-space: nowrap;
}
</style>
