<template>
  <modal
    :showModal="isShow"
    headerVariant="main"
    width="700px"
    :isShowActionPart="true"
    @closeModal="$emit('closeModal')"
  >
    <template #title>
      <span class="title-text-lg d-block">{{ $t('view.mold.editDesign.modalTitle') }}</span>
    </template>

    <template #content>
      <div class="p-3">
        <SectionCardGeneric
          :title="$t('view.mold.editDesign.sectionInfo')"
          icon="bi-vector-pen"
          accent="main"
          headerStyle="legend"
          class="modal-section"
        >
          <div class="readonly-row mb-3">
            <span class="title-text">{{ $t('view.mold.editDesign.fieldMoldCode') }}</span>
            <span class="desc-text">{{ modelValue.design?.moldCode || '-' }}</span>
          </div>

          <div class="form-row two-col">
            <FormFieldGeneric :label="$t('common.field.type')">
              <DropdownGeneric
                :modelValue="form.category"
                :options="masterProduct"
                optionLabel="description"
                :showClear="true"
                @update:modelValue="form.category = $event"
              />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.mold.editDesign.fieldDesignBy')">
              <InputTextGeneric v-model="form.designBy" />
            </FormFieldGeneric>
          </div>

          <div v-if="isNewProcess" class="form-row two-col">
            <FormFieldGeneric :label="$t('view.mold.editDesign.fieldResinBy')">
              <InputTextGeneric v-model="form.resinBy" />
            </FormFieldGeneric>
            <div></div>
          </div>

          <div v-if="!isNewProcess" class="form-row two-col">
            <FormFieldGeneric :label="$t('view.mold.editDesign.fieldQtyReceive')">
              <InputTextGeneric v-model="form.qtyReceive" type="number" step="any" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.mold.editDesign.fieldQtySend')">
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
import api from '@/axios/axios-helper.js'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'EditDesignModal',

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
        category: null,
        designBy: null,
        resinBy: null,
        qtyReceive: null,
        qtySend: null,
        remark: null
      },
      masterProduct: []
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
        this.fetchMasterProduct()
      }
    }
  },

  methods: {
    prefillForm() {
      const clean = (v) =>
        v == null || v === 'null' || v === 'undefined' || v === '' ? null : v
      const design = this.modelValue?.design || {}
      this.form.designBy = clean(design.workBy)
      this.form.resinBy = clean(design.resinBy)
      this.form.qtyReceive = design.qtyReceive != null ? design.qtyReceive : null
      this.form.qtySend = design.qtySend != null ? design.qtySend : null
      this.form.remark = clean(design.remark)
      this.form.category = null
    },

    async fetchMasterProduct() {
      const res = await api.jewelry.get('Master/MasterProductType')
      if (res) {
        this.masterProduct = [...res]
        const design = this.modelValue?.design || {}
        if (design.catagoryCode) {
          this.form.category = this.masterProduct.find((p) => p.code === design.catagoryCode) || null
        }
      }
    },

    onSave() {
      const moldCode = this.modelValue?.design?.moldCode || ''
      confirmThenSubmit(
        moldCode,
        this.$t('view.mold.editDesign.confirmTitle'),
        async () => {
          const payload = {
            planId: this.modelValue.id,
            catagory: this.form.category?.code || null,
            designBy: this.form.designBy,
            resinBy: this.form.resinBy,
            qtyReceive: this.form.qtyReceive != null ? Number(this.form.qtyReceive) : null,
            qtySend: this.form.qtySend != null ? Number(this.form.qtySend) : null,
            remark: this.form.remark
          }
          const res = await this.store.updatePlanDesign(payload)
          if (res !== undefined) {
            success(this.$t('view.mold.editDesign.successMsg'))
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
