<template>
  <modal
    :showModal="isShow"
    headerVariant="main"
    width="700px"
    :isShowActionPart="true"
    @closeModal="$emit('closeModal')"
  >
    <template #title>
      <span class="title-text-lg d-block">{{ $t('view.mold.editStore.modalTitle') }}</span>
    </template>

    <template #content>
      <div class="p-3">
        <SectionCardGeneric
          :title="$t('view.mold.editStore.sectionInfo')"
          icon="bi-box-seam"
          accent="main"
          headerStyle="legend"
          class="modal-section"
        >
          <div class="readonly-row mb-3">
            <span class="title-text">{{ $t('view.mold.editStore.fieldMoldCode') }}</span>
            <span class="desc-text">{{ modelValue.store?.code || '-' }}</span>
          </div>

          <div class="form-row two-col">
            <FormFieldGeneric :label="$t('view.mold.editStore.fieldWorkBy')">
              <InputTextGeneric v-model="form.workerBy" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.mold.editStore.fieldLocation')">
              <DropdownGeneric
                :modelValue="form.location"
                :options="masterLocation"
                optionLabel="value"
                :showClear="true"
                @update:modelValue="form.location = $event"
              />
            </FormFieldGeneric>
          </div>

          <div v-if="isNewProcess">
            <div class="form-row two-col">
              <FormFieldGeneric :label="$t('view.mold.editStore.fieldPrintBy')">
                <InputTextGeneric v-model="form.printBy" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.mold.editStore.fieldCuttingBy')">
                <InputTextGeneric v-model="form.cuttingBy" />
              </FormFieldGeneric>
            </div>
            <div class="form-row two-col">
              <FormFieldGeneric :label="$t('view.mold.editStore.fieldQtyResin')">
                <InputTextGeneric v-model="form.qtyResin" type="number" step="any" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.mold.editStore.fieldQtySilverCast')">
                <InputTextGeneric v-model="form.qtySilverCast" type="number" step="any" />
              </FormFieldGeneric>
            </div>
          </div>

          <div v-if="!isNewProcess" class="form-row two-col">
            <FormFieldGeneric :label="$t('view.mold.editStore.fieldQtyReceive')">
              <InputTextGeneric v-model="form.qtyReceive" type="number" step="any" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.mold.editStore.fieldQtySend')">
              <InputTextGeneric v-model="form.qtySend" type="number" step="any" />
            </FormFieldGeneric>
          </div>

          <FormFieldGeneric :label="$t('common.field.remark')">
            <TextareaGeneric v-model="form.remark" :rows="3" />
          </FormFieldGeneric>
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
import { useMoldPlanStore } from '@/stores/modules/api/mold/mold-plan-store.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'EditStoreModal',

  components: {
    modal,
    InputTextGeneric,
    TextareaGeneric,
    ButtonGeneric,
    FormFieldGeneric,
    SectionCardGeneric,
    DropdownGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },

  emits: ['closeModal', 'updated'],

  setup() {
    return {
      store: useMoldPlanStore()
    }
  },

  data() {
    return {
      form: {
        workerBy: null,
        location: null,
        printBy: null,
        cuttingBy: null,
        qtyResin: null,
        qtySilverCast: null,
        qtyReceive: null,
        qtySend: null,
        remark: null
      },
      masterLocation: [
        { id: 1, code: 'A', value: 'คลัง 1' },
        { id: 2, code: 'B', value: 'คลัง 2' },
        { id: 3, code: 'C', value: 'คลัง 3' }
      ]
    }
  },

  computed: {
    isNewProcess() {
      return !!this.modelValue?.isNewProcess
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
      const clean = (v) =>
        v == null || v === 'null' || v === 'undefined' || v === '' ? null : v
      const storeData = this.modelValue?.store || {}
      this.form.workerBy = clean(storeData.workBy)
      this.form.printBy = clean(storeData.printBy)
      this.form.cuttingBy = clean(storeData.cuttingBy)
      this.form.qtyResin = storeData.qtyResin != null ? storeData.qtyResin : null
      this.form.qtySilverCast = storeData.qtySilverCast != null ? storeData.qtySilverCast : null
      this.form.qtyReceive = storeData.qtyReceive != null ? storeData.qtyReceive : null
      this.form.qtySend = storeData.qtySend != null ? storeData.qtySend : null
      this.form.remark = clean(storeData.remark)
      this.form.location =
        this.masterLocation.find((loc) => loc.code === storeData.location) || null
    },

    onSave() {
      const moldCode = this.modelValue?.store?.code || ''
      confirmThenSubmit(
        moldCode,
        this.$t('view.mold.editStore.confirmTitle'),
        async () => {
          const payload = {
            planId: this.modelValue.id,
            code: this.modelValue.store?.code,
            location: this.form.location?.code || null,
            workerBy: this.form.workerBy,
            printBy: this.form.printBy,
            cuttingBy: this.form.cuttingBy,
            qtyReceive: this.form.qtyReceive != null ? Number(this.form.qtyReceive) : null,
            qtySend: this.form.qtySend != null ? Number(this.form.qtySend) : null,
            qtyResin: this.form.qtyResin != null ? Number(this.form.qtyResin) : null,
            qtySilverCast: this.form.qtySilverCast != null ? Number(this.form.qtySilverCast) : null,
            remark: this.form.remark
          }
          const res = await this.store.updatePlanStore(payload)
          if (res !== undefined) {
            success(this.$t('view.mold.editStore.successMsg'))
            this.$emit('updated')
            this.$emit('closeModal')
          }
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.modal-section {
  margin-top: var(--sp-md);
  margin-bottom: var(--sp-lg);

  &:last-child {
    margin-bottom: 0;
  }
}

.readonly-row {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

.desc-text {
  color: var(--base-font-color);
  font-weight: 600;
}

.form-row {
  margin-bottom: var(--sp-lg);

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--sp-lg);
  }

  @media (max-width: 1024px) {
    &.two-col {
      grid-template-columns: 1fr;
    }
  }
}
</style>
