<template>
  <modal
    :showModal="isShow"
    @closeModal="$emit('closeModal')"
    width="700px"
    headerVariant="main"
    :isShowActionPart="true"
  >
    <template #title>
      <span class="title-text-lg d-block">{{ modalTitle }}</span>
    </template>

    <template #content>
      <div class="p-3">
        <SectionCardGeneric class="modal-section">
          <div class="form-row two-col">
            <FormFieldGeneric :label="$t('view.production.goldLossTang.manualFieldWo')" :required="true">
              <InputTextGeneric v-model.trim="form.wo" :placeholder="$t('view.production.goldLossTang.manualFieldWo')" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.production.goldLossTang.manualFieldWoNumber')">
              <InputTextGeneric v-model="form.woNumber" type="number" :min="0" :placeholder="$t('view.production.goldLossTang.manualFieldWoNumber')" />
            </FormFieldGeneric>
          </div>

          <div class="form-row two-col">
            <FormFieldGeneric :label="$t('view.production.goldLossTang.manualFieldJobDate')" :required="true">
              <CalendarGeneric
                v-model="form.jobDate"
                dateFormat="dd/mm/yy"
                :placeholder="$t('view.production.goldLossTang.manualFieldJobDate')"
                :showIcon="true"
                :showButtonBar="true"
              />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.production.goldLossTang.manualFieldGold')" :required="true">
              <InputTextGeneric v-model.trim="form.gold" :placeholder="$t('view.production.goldLossTang.manualFieldGold')" />
            </FormFieldGeneric>
          </div>

          <div class="form-row two-col">
            <FormFieldGeneric :label="$t('view.production.goldLossTang.manualFieldGoldSize')" :required="true">
              <DropdownGeneric
                v-model="form.goldSize"
                :options="goldSizeOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="$t('view.production.goldLossTang.manualFieldGoldSize')"
              />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.production.goldLossTang.manualFieldProductNumber')">
              <InputTextGeneric v-model.trim="form.productNumber" :placeholder="$t('view.production.goldLossTang.manualFieldProductNumber')" />
            </FormFieldGeneric>
          </div>

          <div class="form-row two-col">
            <FormFieldGeneric :label="$t('view.production.goldLossTang.manualFieldGoldWeightSend')" :required="true">
              <InputTextGeneric v-model="form.goldWeightSend" type="number" step="0.01" :min="0" :placeholder="$t('view.production.goldLossTang.manualFieldGoldWeightSend')" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.production.goldLossTang.manualFieldGoldWeightCheck')" :required="true">
              <InputTextGeneric v-model="form.goldWeightCheck" type="number" step="0.01" :min="0" :placeholder="$t('view.production.goldLossTang.manualFieldGoldWeightCheck')" />
            </FormFieldGeneric>
          </div>

          <div class="form-row two-col">
            <FormFieldGeneric :label="$t('view.production.goldLossTang.manualFieldQty')">
              <InputTextGeneric v-model="form.goldQtyCheck" type="number" :min="0" :placeholder="$t('view.production.goldLossTang.manualFieldQty')" />
            </FormFieldGeneric>
          </div>
        </SectionCardGeneric>
      </div>
    </template>

    <template #action>
      <ButtonGeneric
        variant="main"
        icon="bi-save"
        :label="$t('common.btn.save')"
        @click="onSave"
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
import { warning } from '@/services/alert/sweetAlerts.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const GOLD_SIZE_OPTIONS = [
  { label: '9K', value: '9K' },
  { label: '10K', value: '10K' },
  { label: '14K', value: '14K' },
  { label: '18K', value: '18K' },
  { label: '22K', value: '22K' },
  { label: 'Silver', value: 'Silver' }
]

const emptyForm = () => ({
  wo: '',
  woNumber: '',
  jobDate: null,
  gold: '',
  goldSize: '',
  goldWeightSend: '',
  goldWeightCheck: '',
  goldQtyCheck: '',
  productNumber: ''
})

export default {
  name: 'GoldLossTangManualJobModal',

  components: {
    modal,
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    ButtonGeneric,
    CalendarGeneric,
    DropdownGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    editingRow: {
      type: Object,
      default: null
    }
  },

  emits: ['closeModal', 'save'],

  data() {
    return {
      goldSizeOptions: GOLD_SIZE_OPTIONS,
      form: emptyForm()
    }
  },

  computed: {
    modalTitle() {
      return this.editingRow
        ? this.$t('view.production.goldLossTang.manualJobModalTitleEdit')
        : this.$t('view.production.goldLossTang.manualJobModalTitleAdd')
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.prefillForm()
      }
    }
  },

  methods: {
    prefillForm() {
      if (this.editingRow) {
        const r = this.editingRow
        this.form = {
          wo: r.wo || '',
          woNumber: r.woNumber != null ? String(r.woNumber) : '',
          jobDate: r.jobDate || null,
          gold: r.gold || '',
          goldSize: r.goldSize || '',
          goldWeightSend: r.goldWeightSend != null ? String(r.goldWeightSend) : '',
          goldWeightCheck: r.goldWeightCheck != null ? String(r.goldWeightCheck) : '',
          goldQtyCheck: r.goldQtyCheck != null ? String(r.goldQtyCheck) : '',
          productNumber: r.productNumber || ''
        }
      } else {
        this.form = emptyForm()
      }
    },

    onSave() {
      const f = this.form
      const weightSendNum = parseFloat(f.goldWeightSend)
      const weightCheckNum = parseFloat(f.goldWeightCheck)
      const hasValidWeights =
        f.goldWeightSend !== '' && !isNaN(weightSendNum) && weightSendNum >= 0 &&
        f.goldWeightCheck !== '' && !isNaN(weightCheckNum) && weightCheckNum >= 0

      if (!f.wo || !f.jobDate || !f.gold || !f.goldSize || !hasValidWeights) {
        warning(this.$t('view.production.goldLossTang.validationManualJobIncomplete'))
        return
      }

      this.$emit('save', {
        wo: f.wo,
        woNumber: f.woNumber !== '' && f.woNumber != null ? Number(f.woNumber) : null,
        productNumber: f.productNumber ? f.productNumber : null,
        gold: f.gold,
        goldSize: f.goldSize,
        jobDate: f.jobDate,
        goldWeightSend: weightSendNum,
        goldWeightCheck: weightCheckNum,
        goldQtyCheck: f.goldQtyCheck !== '' && f.goldQtyCheck != null ? Number(f.goldQtyCheck) : null
      })
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

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
