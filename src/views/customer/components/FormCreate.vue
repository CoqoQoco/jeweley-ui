<template>
  <div class="form-container">
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShow" @closeModal="closeModal" width="1000px">
      <template v-slot:content>
        <form @submit.prevent="onSubmit" class="form-content-container">
          <div class="mb-3">
            <span class="txt-title-modal">เพิ่มข้อมูลลูกค้า</span>
          </div>
          <div class="form-content-row-two-columns-container mb-2">
            <div>
              <span class="txt-title">
                <span>รหัสลูกค้า</span>
                <span class="txt-required"> *</span>
              </span>
              <input type="text" class="form-control" v-model="form.code" required />
            </div>
            <div>
              <span class="txt-title">
                <span>ประเภทลูกค้า</span>
                <span class="txt-required"> *</span>
              </span>
              <Dropdown
                v-model="form.type"
                :options="masterCustomer"
                optionLabel="description"
                :class="val.isValCustomerType === true ? `p-invalid` : ``"
                :showClear="form.customerType ? true : false"
              />
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
          <div class="form-content-row-one-columns-container">
            <div>
              <span class="txt-title">
                <span>ที่อยู่ติดต่อ</span>
                <!-- <span class="txt-required"> *</span> -->
              </span>
              <textarea class="form-control" v-model="form.address" />
            </div>
          </div>
          <div class="form-content-row-two-columns-container">
            <div class="mt-2">
              <span class="txt-title">
                <span>เบอร์โทรติดต่อ 1</span>
              </span>
              <div class="input-group input-group-inner">
                <div class="input-group-append">
                  <span class="input-group-text">
                    <i class="bi bi-telephone-fill txt-main-color"></i>
                  </span>
                </div>
                <input
                  id="tel1"
                  :class="['form-control bg-input']"
                  type="tel"
                  v-model.trim="form.tel1"
                />
              </div>
            </div>

            <div class="mt-2">
              <span class="txt-title">
                <span>เบอร์โทรติดต่อ 2</span>
              </span>
              <div class="input-group input-group-inner">
                <div class="input-group-append">
                  <span class="input-group-text">
                    <i class="bi bi-telephone-fill txt-main-color"></i>
                  </span>
                </div>
                <input
                  id="tel2"
                  :class="['form-control bg-input']"
                  type="tel"
                  v-model.trim="form.tel2"
                />
              </div>
            </div>
          </div>
          <div class="form-content-row-two-columns-container mb-2">
            <div class="mt-2">
              <span class="txt-title">
                <span>E-mail</span>
              </span>
              <div class="input-group input-group-inner">
                <div class="input-group-append">
                  <span class="input-group-text">
                    <i class="bi bi-envelope-check-fill txt-main-color"></i>
                  </span>
                </div>
                <input
                  id="email"
                  :class="['form-control bg-input']"
                  type="email"
                  v-model.trim="form.email"
                />
              </div>
            </div>

            <div class="mt-2">
              <span class="txt-title">
                <span>บุคคลติดต่อ</span>
              </span>
              <div class="input-group input-group-inner">
                <div class="input-group-append">
                  <span class="input-group-text">
                    <i class="bi bi-person-lines-fill txt-main-color"></i>
                  </span>
                </div>
                <input
                  id="contact"
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.contact"
                />
              </div>
            </div>
          </div>
          <div class="form-content-row-one-columns-container">
            <div>
              <span class="txt-title">
                <span>ข้อมูลเพิ่มเติม</span>
                <!-- <span class="txt-required"> *</span> -->
              </span>
              <textarea class="form-control" v-model="form.remark" />
            </div>
          </div>
          <div class="d-flex justify-content-center mt-3">
            <button class="btn btn-sm btn-dark btn-custom mr-2" type="button" @click="closeModal">
              ยกเลิกเพิ่มข้อมูลลูกค้า
            </button>
            <button class="btn btn-sm btn-warning btn-custom" type="submit">
              ยืนยันเพิ่มข้อมูลลูกค้า
            </button>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

import Dropdown from 'primevue/dropdown'

import api from '@/axios/axios-helper.js'
import swAlert from '@/services/alert/sweetAlerts.js'

const interfaceForm = {
  code: null,
  nameTh: null,
  nameEn: null,
  address: null,
  tel1: null,
  tel2: null,
  type: null,
  contact: null,
  email: null,
  remark: null
}
const interfaceIsValid = {
  isValCustomerType: false
}
export default {
  components: {
    modal,
    loading,
    Dropdown
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    masterCustomer: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  watch: {
    'form.type'() {
      if (this.form.type) {
        this.val.isValCustomerType = false
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
          'ยืนยันเพิ่มข้อมูลลูกค้า',
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
          isValCustomerType: true
        }
        return false
      }

      return true
    },

    // --- APIs ---- //
    async submit() {
      try {
        this.isLoading = true

        const params = {
          code: this.form.code,
          type: this.form.type.code,
          nameTh: this.form.nameTh,
          nameEn: this.form.nameEn,

          address: this.form.address,
          tel1: this.form.tel1,
          tel2: this.form.tel2,
          email: this.form.email,
          contactName: this.form.contact,
          remark: this.form.remark
        }
        //console.log(params)

        const res = await api.jewelry.post('Customer/CreateCustomer', params)
        if (res) {
          //this.isResetImage = !this.isResetImage
          swAlert.success(
            null,
            null,
            () => {
              this.closeModal()
            },
            null,
            null
          )
          //this.onClearVal()
        }

        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/form-modal.scss';
</style>
