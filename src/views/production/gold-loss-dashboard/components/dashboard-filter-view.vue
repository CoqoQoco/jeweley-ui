<template>
  <SearchBarGeneric
    :title="$t('view.production.goldLossDashboard.filterTitle')"
    :description="$t('view.production.goldLossDashboard.filterDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.goldLossDashboard.filterDateRange') }}</span>
        <DateRangeGeneric
          :startDate="form.start"
          :endDate="form.end"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.start = $event"
          @update:endDate="form.end = $event"
        />
      </div>

      <div>
        <span
          class="title-text"
          :class="{ 'title-text--faded': !isDeptUsed }"
          :title="isDeptUsed ? '' : $t('view.production.goldLossDashboard.filterDeptDisabledTooltip')"
        >
          {{ $t('view.production.goldLossDashboard.filterDepartment') }}
        </span>
        <MultiSelectGeneric
          v-model="form.status"
          :options="departmentOptions"
          optionLabel="nameTh"
          optionValue="id"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span
          class="title-text"
          :class="{ 'title-text--faded': !isWorkerUsed }"
          :title="isWorkerUsed ? '' : $t('view.production.goldLossDashboard.filterWorkerDisabledTooltip')"
        >
          {{ $t('view.production.goldLossDashboard.filterWorker') }}
        </span>
        <DropdownGeneric
          v-model="form.workerCode"
          :options="workers"
          optionLabel="label"
          optionValue="code"
          :filter="true"
          :showClear="true"
          :placeholder="$t('view.production.goldLossDashboard.filterWorkerPlaceholder')"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
    </template>
  </SearchBarGeneric>
</template>

<script>
import api from '@/axios/axios-helper.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

// แผนกที่มีการคืนทองจริง — ห้ามรวม 95 (บัตรต้นทุน) / 100 (สำเร็จ) / 500 เพราะไม่มีการคืนทองให้คำนวณ loss
const GOLD_LOSS_STAGE_CODES = [50, 60, 70, 80, 90]

// tab ที่ "ไม่ใช้" ตัวกรองแผนก/ช่าง ตามตาราง "พฤติกรรมของ filter" ในพิมพ์เขียว ข้อ 09
const TABS_WITHOUT_DEPARTMENT = ['slip-tang', 'slip-setter']
const TABS_WITHOUT_WORKER = ['overview', 'stage']

export default {
  name: 'GoldLossDashboardFilterView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    DateRangeGeneric,
    MultiSelectGeneric,
    DropdownGeneric
  },

  setup() {
    const masterApiStore = useMasterApiStore()
    return { masterApiStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    activeTab: {
      type: String,
      default: 'overview'
    }
  },

  emits: ['search', 'clear'],

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },

  data() {
    return {
      form: { ...this.modelForm },
      workers: []
    }
  },

  computed: {
    departmentOptions() {
      return this.masterApiStore.planStatus.filter((item) => GOLD_LOSS_STAGE_CODES.includes(item.id))
    },

    isDeptUsed() {
      return !TABS_WITHOUT_DEPARTMENT.includes(this.activeTab)
    },

    isWorkerUsed() {
      return !TABS_WITHOUT_WORKER.includes(this.activeTab)
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    async loadWorkers() {
      const res = await api.jewelry.post('Worker/Search', {
        take: 0,
        skip: 0,
        sort: [],
        search: { active: 1 }
      })
      if (res && res.data) {
        this.workers = res.data.map((w) => {
          const code = w.code || w.workerCode || ''
          const name = w.nameTh || w.name || w.workerName || ''
          return { code, name, label: `${code} - ${name}` }
        })
      }
    }
  },

  created() {
    this.masterApiStore.fetchPlanStatus()
    this.loadWorkers()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.title-text--faded {
  opacity: 0.45;
}
</style>
