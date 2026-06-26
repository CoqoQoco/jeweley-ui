<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="500px" :isShowActionPart="true" headerVariant="main">
      <template #title>
        <span class="title-text-lg d-block">{{ `${$t('view.worker.workerList.titleUpdate')}: ${form.code} - ${form.nameTh}` }}</span>
      </template>
      <template #content>
        <form @submit.prevent="onSubmit" id="worker-update-form">
          <div class="p-3">
            <SectionCardGeneric class="modal-section">
              <div class="form-row two-col">
                <FormFieldGeneric :label="$t('view.worker.workerList.fieldDept')" :required="true">
                  <DropdownGeneric
                    v-model="form.type"
                    :options="masterWorkerProductionType"
                    optionLabel="description"
                    optionValue="id"
                    :class="val.isValWorkerProductionType === true ? 'p-invalid' : ''"
                    :showClear="!!form.type"
                  />
                </FormFieldGeneric>
                <FormFieldGeneric :label="$t('view.worker.workerList.fieldCode')" :required="true">
                  <InputTextGeneric v-model="form.code" :disabled="true" :required="true" />
                </FormFieldGeneric>
              </div>
              <div class="form-row two-col">
                <FormFieldGeneric :label="$t('view.worker.workerList.fieldNameTh')" :required="true">
                  <InputTextGeneric v-model="form.nameTh" :required="true" />
                </FormFieldGeneric>
                <FormFieldGeneric :label="$t('view.worker.workerList.fieldNameEn')">
                  <InputTextGeneric v-model="form.nameEn" />
                </FormFieldGeneric>
              </div>
            </SectionCardGeneric>
          </div>
        </form>
      </template>
      <template #action>
        <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" type="submit" form="worker-update-form" />
        <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="closeModal" />
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usePlanWorkerApiStore } from '@/stores/modules/api/worker/plan-worker-store.js'

const interfaceForm = {
  code: null,
  nameTh: null,
  nameEn: null,
  type: null
}
const interfaceIsValid = {
  isValWorkerProductionType: false
}

export default {
  components: {
    modal,
    DropdownGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    ButtonGeneric,
    SectionCardGeneric
  },

  setup() {
    const masterStore = useMasterApiStore()
    const workerStore = usePlanWorkerApiStore()
    return { masterStore, workerStore }
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    modelUpdate: {
      type: Object,
      required: true,
      default: () => {}
    }
  },

  computed: {
    masterWorkerProductionType() {
      return this.masterStore.workerType
    }
  },

  watch: {
    modelUpdate: {
      handler(newVal) {
        if (newVal) {
          this.form = { ...newVal, check: true }
        } else {
          this.form = {}
        }
      },
      deep: true,
      immediate: true
    },
    'form.type'() {
      if (this.form.type) {
        this.val.isValWorkerProductionType = false
      }
    }
  },

  data() {
    return {
      form: { ...interfaceForm },
      val: { ...interfaceIsValid }
    }
  },

  methods: {
    closeModal() {
      this.form = { ...interfaceForm }
      this.val = { ...interfaceIsValid }
      this.$emit('closeModal')
    },

    onSubmit() {
      if (this.validateForm()) {
        confirmThenSubmit(
          `${this.form.code}-${this.form.nameTh}`,
          this.$t('view.worker.workerList.confirmUpdate'),
          async () => {
            await this.submit()
          }
        )
      }
    },

    validateForm() {
      if (!this.form.type) {
        this.val = { isValWorkerProductionType: true }
        return false
      }
      return true
    },

    async submit() {
      const res = await this.workerStore.fetchUpdate({
        formValue: this.form
      })

      if (res) {
        success(
          null,
          null,
          () => {
            this.form = { ...interfaceForm }
            this.val = { ...interfaceIsValid }
            this.$emit('fetch')
          }
        )
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.form-row {
  margin-bottom: var(--sp-lg);

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--sp-lg);
  }

  @media (max-width: 1024px) {
    &.two-col { grid-template-columns: 1fr; }
  }
}

.modal-section {
  margin-bottom: var(--sp-lg);

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
