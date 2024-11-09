<template>
  <div class="form-container">
    <modal :showModal="isShow" @closeModal="closeModal" width="1000px">
      <template v-slot:content>
        <form @submit.prevent="onSubmit" class="form-content-container-custom">
          <div class="mb-3">
            <span class="txt-title-modal">เพิ่มข้อมูลพนักงาน</span>
          </div>
          <div class="form-content-row-two-columns-container mb-2">
            <div>
              <span class="txt-title">
                <span>แผนกช่าง</span>
                <span class="text-required"> *</span>
              </span>
              <Dropdown
                v-model="form.type"
                :options="masterWorkerProductionType"
                optionLabel="description"
                :class="val.isValWorkerProductionType === true ? `p-invalid` : ``"
                :showClear="form.type ? true : false"
              />
            </div>
            <div>
              <span class="txt-title">
                <span>รหัสพนักงาน</span>
                <span class="txt-required"> *</span>
              </span>
              <input type="text" class="form-control" v-model="form.code" required />
            </div>
          </div>
          <div class="form-content-row-two-columns-container mb-2">
            <div>
              <span class="txt-title">
                <span>ชื่อภาษาไทย</span>
                <span class="txt-required"> *</span>
              </span>
              <input type="text" class="form-control" v-model="form.nameTh" required />
            </div>
            <div>
              <span class="txt-title">
                <span>ชื่อภาษาอังกฤษ</span>
                <!-- <span class="txt-required"> *</span> -->
              </span>
              <input type="text" class="form-control" v-model="form.nameEn" />
            </div>
          </div>
          <div class="d-flex justify-content-center mt-3">
            <button class="btn btn-sm btn-dark btn-custom mr-2" type="button" @click="closeModal">
              ยกเลิกเพิ่มข้อมูลพนักงาน
            </button>
            <button class="btn btn-sm btn-warning btn-custom" type="submit">
              ยืนยันเพิ่มข้อมูลพนักงาน
            </button>
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

import api from '@/axios/axios-helper.js'
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
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    masterWorkerProductionType: {
      type: Array,
      required: true,
      default: () => []
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
          'ยืนยันเพิ่มข้อมูลพนักงาน',
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
      try {
        this.isLoading = true
        console.log(this.form)

        const params = {
          code: this.form.code,
          type: this.form.type.id,
          nameTh: this.form.nameTh,
          nameEn: this.form.nameEn
        }
        //console.log(params)

        const res = await api.jewelry.post('Worker/Create', params)
        if (res) {
          //this.isResetImage = !this.isResetImage
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
              this.$emit('fetch')
            },
            null,
            null
          )
          //this.onClearVal()
        }

        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/form-modal.scss';
.form-content-container-custom {
  padding: 20px 20px;
  overflow: auto;
}
</style>
