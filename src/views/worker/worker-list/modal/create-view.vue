<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="500px" :isShowActionPart="true">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">เพิ่มข้อมูลช่าง</span>
      </template>
      <template #content>
        <form @submit.prevent="onSubmit" id="worker-create-form">
          <div class="p-3">
            <div class="form-row two-col">
              <div class="form-field">
                <span class="title-text">แผนกช่าง <span class="text-required">*</span></span>
                <Dropdown
                  v-model="form.type"
                  :options="masterWorkerProductionType"
                  optionLabel="description"
                  optionValue="id"
                  :class="val.isValWorkerProductionType === true ? `p-invalid` : ``"
                  :showClear="form.type ? true : false"
                />
              </div>
              <div class="form-field">
                <span class="title-text">รหัสช่าง <span class="txt-required">*</span></span>
                <input type="text" class="form-control" v-model="form.code" required />
              </div>
            </div>
            <div class="form-row two-col">
              <div class="form-field">
                <span class="title-text">ชื่อ TH <span class="txt-required">*</span></span>
                <input type="text" class="form-control" v-model="form.nameTh" required />
              </div>
              <div class="form-field">
                <span class="title-text">ชื่อ EN</span>
                <input type="text" class="form-control" v-model="form.nameEn" />
              </div>
            </div>
          </div>
        </form>
      </template>
      <template #action>
        <button class="btn btn-sm btn-main" type="submit" form="worker-create-form">
          <i class="bi bi-save"></i> บันทึก
        </button>
        <button class="btn btn-sm btn-outline-main ml-2" type="button" @click="closeModal">
          ยกเลิก
        </button>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
import Dropdown from 'primevue/dropdown'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usePlanWorkerApiStore } from '@/stores/modules/api/worker/plan-worker-store.js'

import swAlert from '@/services/alert/sweetAlerts.js'

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
    Dropdown
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
    }
  },

  computed: {
    masterWorkerProductionType() {
      return this.masterStore.workerType
    }
  },
  
  watch: {
    'form.type'() {
      if (this.form.type) {
        this.val.isValWorkerProductionType = false
      }
    }
  },

  data() {
    return {
      // --- flag --- //
      isLoading: false,
      form: {
        ...interfaceForm
      },
      val: {
        ...interfaceIsValid
      }
    }
  },

  methods: {
    // --- controller --- //
    // --- controller --- //
    closeModal() {
      this.form = {
        ...interfaceForm
      }
      this.val = {
        ...interfaceIsValid
      }
      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.validateForm()) {
        swAlert.confirmSubmit(
          `${this.form.code}-${this.form.nameTh} `,
          'ยืนยันเพิ่มข้อมูลช่าง',
          async () => {
            await this.submit()
          },
          null,
          null
        )
      }
    },
    validateForm() {
      if (!this.form.type) {
        this.val = {
          isValWorkerProductionType: true
        }
        return false
      }

      return true
    },

    // --- APIs --- //
    async submit() {
      const res = await this.workerStore.fetchCreate({
        formValue: this.form
      })

      if (res) {
        swAlert.success(
          null,
          null,
          () => {
            this.form = {
              ...interfaceForm
            }
            this.val = {
              ...interfaceIsValid
            }
            this.$emit('closeModal', 'fetch')
          },
          null,
          null
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
  margin-bottom: 16px;

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
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
    margin-bottom: 6px;
  }
}

input.form-control,
textarea.form-control {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;

  &:focus {
    border-color: var(--base-font-color);
    box-shadow: none;
    outline: none;
  }
}
</style>
