<template>
  <modal
    :showModal="isShow"
    @closeModal="$emit('closeModal')"
    width="900px"
    headerVariant="main"
    :isShowActionPart="true"
  >
    <template #title>
      <span class="title-text-lg d-block">{{ $t('view.production.goldLossTang.searchModalTitle') }}</span>
    </template>

    <template #content>
      <div class="p-3">
        <SectionCardGeneric
          :title="$t('view.production.goldLossTang.selectWorkerSection')"
          class="modal-section"
        >
          <InputTextGeneric
            v-model="workerSearch"
            icon="bi-search"
            :placeholder="$t('view.production.goldLossTang.searchWorkerPlaceholder')"
            class="mb-2"
          />

          <BaseDataTable
            :items="filteredWorkers"
            :totalRecords="filteredWorkers.length"
            :columns="workerColumns"
            :paginator="filteredWorkers.length > 10"
            :perPage="10"
            scrollHeight="200px"
            dataKey="code"
          >
            <template #selectTemplate="{ data }">
              <ButtonGeneric
                :variant="selectedWorkerCode === data.code ? 'main' : 'green'"
                :icon="selectedWorkerCode === data.code ? 'bi-check-circle-fill' : 'bi-person-check'"
                @click="onSelectWorker(data)"
              />
            </template>
            <template #codeTemplate="{ data }">
              <span :class="{ 'selected-row-text': selectedWorkerCode === data.code }">{{ data.code }}</span>
            </template>
            <template #nameThTemplate="{ data }">
              <span :class="{ 'selected-row-text': selectedWorkerCode === data.code }">{{ data.nameTh || data.name }}</span>
            </template>
          </BaseDataTable>
        </SectionCardGeneric>

        <SectionCardGeneric
          :title="$t('view.production.goldLossTang.dateGoldSection')"
          class="modal-section"
        >
          <div class="form-row two-col">
            <FormFieldGeneric :label="$t('view.production.goldLossTang.fieldDateStart')" :required="true">
              <CalendarGeneric
                v-model="localDateStart"
                dateFormat="dd/mm/yy"
                :placeholder="$t('view.production.goldLossTang.fieldDateStart')"
                :showIcon="true"
                :showButtonBar="true"
                :maxDate="localDateEnd || undefined"
              />
            </FormFieldGeneric>

            <FormFieldGeneric :label="$t('view.production.goldLossTang.fieldDateEnd')" :required="true">
              <CalendarGeneric
                v-model="localDateEnd"
                dateFormat="dd/mm/yy"
                :placeholder="$t('view.production.goldLossTang.fieldDateEnd')"
                :showIcon="true"
                :showButtonBar="true"
                :minDate="localDateStart || undefined"
              />
            </FormFieldGeneric>
          </div>

          <FormFieldGeneric :label="$t('view.production.goldLossTang.fieldGold')">
            <MultiSelectGeneric
              v-model="localGoldFilter"
              :options="goldOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('view.production.goldLossTang.placeholderGold')"
              :filter="false"
              :showClear="true"
            />
          </FormFieldGeneric>
        </SectionCardGeneric>
      </div>
    </template>

    <template #action>
      <ButtonGeneric
        variant="main"
        icon="bi-search"
        :label="$t('view.production.goldLossTang.btnOpenSearch')"
        @click="onSearch"
      />
      <ButtonGeneric
        variant="outline"
        :label="$t('common.btn.cancel')"
        class="ml-2"
        @click="$emit('closeModal')"
      />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import api from '@/axios/axios-helper.js'
import { warning } from '@/services/alert/sweetAlerts.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const GOLD_OPTIONS = [
  { label: '9K', value: '9K' },
  { label: '10K', value: '10K' },
  { label: '14K', value: '14K' },
  { label: '18K', value: '18K' },
  { label: '22K', value: '22K' },
  { label: 'Silver', value: 'Silver' }
]

export default {
  name: 'SearchJobsModal',

  components: {
    modal,
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    ButtonGeneric,
    BaseDataTable,
    CalendarGeneric,
    MultiSelectGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    workerCode: {
      type: String,
      default: ''
    },
    workerName: {
      type: String,
      default: ''
    },
    dateStart: {
      type: [Date, null],
      default: null
    },
    dateEnd: {
      type: [Date, null],
      default: null
    },
    goldFilter: {
      type: Array,
      default: () => []
    }
  },

  emits: ['closeModal', 'search'],

  data() {
    return {
      workerSearch: '',
      workers: [],
      selectedWorkerCode: '',
      selectedWorkerName: '',
      localDateStart: null,
      localDateEnd: null,
      localGoldFilter: [],
      goldOptions: GOLD_OPTIONS,
      workersLoaded: false
    }
  },

  computed: {
    workerColumns() {
      return [
        { field: 'select', header: '', width: '60px', sortable: false, align: 'center' },
        { field: 'code', header: this.$t('common.field.code'), minWidth: '100px', sortable: false },
        { field: 'nameTh', header: this.$t('common.field.name'), minWidth: '160px', sortable: false }
      ]
    },

    filteredWorkers() {
      const q = (this.workerSearch || '').trim().toLowerCase()
      if (!q) return this.workers
      return this.workers.filter((w) => {
        const name = (w.nameTh || w.name || '').toLowerCase()
        const code = (w.code || '').toLowerCase()
        return code.includes(q) || name.includes(q)
      })
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.prefillFromProps()
        if (!this.workersLoaded) {
          this.loadWorkers()
        }
      }
    }
  },

  methods: {
    prefillFromProps() {
      this.selectedWorkerCode = this.workerCode || ''
      this.selectedWorkerName = this.workerName || ''
      this.localDateStart = this.dateStart || null
      this.localDateEnd = this.dateEnd || null
      this.localGoldFilter = this.goldFilter ? [...this.goldFilter] : []
      this.workerSearch = ''
    },

    async loadWorkers() {
      const res = await api.jewelry.post('Worker/Search', {
        take: 0,
        skip: 0,
        search: { type: 50, active: 1 }
      })
      if (res && res.data) {
        this.workers = res.data.map((w) => ({
          code: w.code || w.workerCode || '',
          nameTh: w.nameTh || w.name || w.workerName || ''
        }))
        this.workersLoaded = true
      }
    },

    onSelectWorker(worker) {
      this.selectedWorkerCode = worker.code
      this.selectedWorkerName = worker.nameTh || worker.name
    },

    onSearch() {
      if (!this.selectedWorkerCode) {
        warning(this.$t('view.production.goldLossTang.validationSelectWorker'))
        return
      }
      if (!this.localDateStart || !this.localDateEnd) {
        warning(this.$t('view.production.goldLossTang.validationSelectDate'))
        return
      }

      this.$emit('search', {
        workerCode: this.selectedWorkerCode,
        workerName: this.selectedWorkerName,
        dateStart: this.localDateStart,
        dateEnd: this.localDateEnd,
        goldFilter: this.localGoldFilter || []
      })
      this.$emit('closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.modal-section {
  margin-bottom: var(--sp-lg);

  &:last-child {
    margin-bottom: 0;
  }
}

.form-row {
  display: grid;
  gap: var(--sp-md);
  margin-bottom: var(--sp-md);

  &.two-col {
    grid-template-columns: 1fr 1fr;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
}

.selected-row-text {
  font-weight: 700;
  color: var(--base-font-color);
}
</style>
