<template>
  <SectionCardGeneric :title="$t('view.production.goldLossTang.searchTitle')">
    <form @submit.prevent="onSearch">
      <div class="form-row four-col">
        <FormFieldGeneric :label="$t('view.production.goldLossTang.fieldWorker')" :required="true">
          <DropdownGeneric
            :modelValue="workerCode"
            :options="workerOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('view.production.goldLossTang.placeholderWorker')"
            :showClear="true"
            :filter="true"
            @update:modelValue="onWorkerChange"
          />
        </FormFieldGeneric>

        <FormFieldGeneric :label="$t('view.production.goldLossTang.fieldDateStart')" :required="true">
          <CalendarGeneric
            class="w-100"
            :modelValue="dateStart"
            :maxDate="dateEnd"
            :manualInput="false"
            :showIcon="true"
            dateFormat="dd/mm/yy"
            :placeholder="$t('common.label.start')"
            @update:modelValue="$emit('update:dateStart', $event)"
          />
        </FormFieldGeneric>

        <FormFieldGeneric :label="$t('view.production.goldLossTang.fieldDateEnd')" :required="true">
          <CalendarGeneric
            class="w-100"
            :modelValue="dateEnd"
            :minDate="dateStart"
            :manualInput="false"
            :showIcon="true"
            dateFormat="dd/mm/yy"
            :placeholder="$t('common.label.end')"
            @update:modelValue="$emit('update:dateEnd', $event)"
          />
        </FormFieldGeneric>

        <FormFieldGeneric :label="$t('view.production.goldLossTang.fieldGold')">
          <MultiSelectGeneric
            :modelValue="goldFilter"
            :options="goldOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('view.production.goldLossTang.placeholderGold')"
            :filter="true"
            :showClear="true"
            @update:modelValue="$emit('update:goldFilter', $event)"
          />
        </FormFieldGeneric>
      </div>

      <div class="d-flex justify-content-end mt-2">
        <ButtonGeneric
          variant="main"
          icon="bi-search"
          :label="$t('common.btn.search')"
          type="submit"
        />
      </div>
    </form>
  </SectionCardGeneric>
</template>

<script>
import api from '@/axios/axios-helper.js'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'

export default {
  name: 'GoldLossTangSearchView',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    ButtonGeneric,
    DropdownGeneric,
    MultiSelectGeneric,
    CalendarGeneric
  },

  props: {
    workerCode: {
      type: String,
      default: ''
    },
    workerName: {
      type: String,
      default: ''
    },
    dateStart: {
      type: Date,
      default: null
    },
    dateEnd: {
      type: Date,
      default: null
    },
    goldFilter: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update:workerCode', 'update:workerName', 'update:dateStart', 'update:dateEnd', 'update:goldFilter', 'search'],

  data() {
    return {
      workerOptions: [],
      goldOptions: [
        { label: '9K', value: '9K' },
        { label: '10K', value: '10K' },
        { label: '14K', value: '14K' },
        { label: '18K', value: '18K' },
        { label: '22K', value: '22K' },
        { label: 'Silver', value: 'Silver' }
      ]
    }
  },

  async created() {
    await this.loadWorkers()
  },

  methods: {
    async loadWorkers() {
      const CASTING_WORKER_TYPE = 50
      const res = await api.jewelry.post('Worker/Search', {
        take: 0,
        skip: 0,
        search: { type: CASTING_WORKER_TYPE, active: 1 }
      })
      if (res && res.data) {
        this.workerOptions = res.data.map((w) => ({
          label: `${w.code} - ${w.nameTh || w.name || ''}`,
          value: w.code,
          nameTh: w.nameTh || w.name || ''
        }))
      }
    },

    onWorkerChange(val) {
      this.$emit('update:workerCode', val)
      const found = this.workerOptions.find((o) => o.value === val)
      this.$emit('update:workerName', found ? found.nameTh : '')
    },

    onSearch() {
      this.$emit('search')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.form-row {
  display: grid;
  gap: var(--sp-md);

  &.four-col {
    grid-template-columns: repeat(4, 1fr);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
