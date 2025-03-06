<template>
  <div class="form-container">
    <modal :showModal="isShow" @closeModal="closeModal" width="500px">
      <template v-slot:content>
        <div class="title-text-lg-bg">
          <span class="bi bi-database-fill-add mr-2"></span>
          <span>เพิ่มข้อมูลช่าง</span>
        </div>
        <form @submit.prevent="onSubmit" class="form-content-container-custom">
          <div class="p-2">
            <div class="form-col-container mb-2">
              <div>
                <span class="title-text">
                  <span>แผนกช่าง</span>
                  <span class="text-required"> *</span>
                </span>
                <Dropdown
                  v-model="form.type"
                  :options="masterWorkerProductionType"
                  optionLabel="description"
                  optionValue="id"
                  :class="val.isValWorkerProductionType === true ? `p-invalid` : ``"
                  :showClear="form.type ? true : false"
                />
              </div>
              <div>
                <span class="title-text">
                  <span>รหัสช่าง</span>
                  <span class="txt-required"> *</span>
                </span>
                <input type="text" class="form-control" v-model="form.code" required />
              </div>
            </div>
            <div class="form-col-container mb-2">
              <div>
                <span class="title-text">
                  <span>ชื่อ TH</span>
                  <span class="txt-required"> *</span>
                </span>
                <input type="text" class="form-control" v-model="form.nameTh" required />
              </div>
              <div>
                <span class="title-text">
                  <span>ชื่อ EN</span>
                  <!-- <span class="txt-required"> *</span> -->
                </span>
                <input type="text" class="form-control" v-model="form.nameEn" />
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button class="btn btn-sm btn-dark mr-2" type="button" @click="closeModal">
                <span class="bi bi-x"></span>
              </button>
              <button class="btn btn-sm btn-green" type="submit">
                <span class="bi bi-calendar-check"></span>
              </button>
            </div>
          </div>
        </form>
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
</style>
