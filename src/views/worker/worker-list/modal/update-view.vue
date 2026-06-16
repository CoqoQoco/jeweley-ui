<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="500px" :isShowActionPart="true">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ `${$t('view.worker.workerList.titleUpdate')}: ${form.code} - ${form.nameTh}` }}</span>
      </template>
      <template #content>
        <form @submit.prevent="onSubmit" id="worker-update-form">
          <div class="p-3">
            <div class="form-row two-col">
              <div class="form-field">
                <span class="title-text">{{ $t('view.worker.workerList.fieldDept') }} <span class="text-required">*</span></span>
                <DropdownGeneric
                  v-model="form.type"
                  :options="masterWorkerProductionType"
                  optionLabel="description"
                  optionValue="id"
                  :class="val.isValWorkerProductionType === true ? 'p-invalid' : ''"
                  :showClear="!!form.type"
                />
              </div>
              <div class="form-field">
                <span class="title-text">{{ $t('view.worker.workerList.fieldCode') }} <span class="txt-required">*</span></span>
                <input type="text" class="form-control" v-model="form.code" disabled required />
              </div>
            </div>
            <div class="form-row two-col">
              <div class="form-field">
                <span class="title-text">{{ $t('view.worker.workerList.fieldNameTh') }} <span class="txt-required">*</span></span>
                <input type="text" class="form-control" v-model="form.nameTh" required />
              </div>
              <div class="form-field">
                <span class="title-text">{{ $t('view.worker.workerList.fieldNameEn') }}</span>
                <input type="text" class="form-control" v-model="form.nameEn" />
              </div>
            </div>
          </div>
        </form>
      </template>
      <template #action>
        <button class="btn btn-sm btn-main" type="submit" form="worker-update-form">
          <i class="bi bi-save"></i> {{ $t('common.btn.save') }}
        </button>
        <button class="btn btn-sm btn-outline-main ml-2" type="button" @click="closeModal">
          {{ $t('common.btn.cancel') }}
        </button>
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
    DropdownGeneric
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

.card { background: #ffffff !important; }

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

.form-field {
  width: 100%;

  .title-text {
    display: block;
    font-weight: 500;
    margin-bottom: var(--sp-xs);
  }
}

input.form-control,
textarea.form-control {
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--fs-base);

  &:focus {
    border-color: var(--base-font-color);
    box-shadow: none;
    outline: none;
  }
}
</style>
