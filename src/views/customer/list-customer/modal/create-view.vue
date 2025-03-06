<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="1000px">
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="title-text-lg-bg">
            <span class="bi bi-person-fill-add mr-2"></span>
            <span class="title-text-modal">เพิ่มข้อมูลลูกค้า</span>
          </div>
          <div class="p-4">
            <div class="form-col-container">
              <div>
                <span class="title-text">
                  <span>รหัสลูกค้า</span>
                  <span class="txt-required"> *</span>
                </span>
                <input type="text" class="form-control" v-model="form.code" required />
              </div>
              <div>
                <span class="title-text">
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
            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>ชื่อภาษาไทย</span>
                  <span class="txt-required"> *</span>
                </span>
                <input type="text" class="form-control" v-model="form.nameTh" required />
              </div>
              <div>
                <span class="title-text">
                  <span>ชื่อภาษาอังกฤษ</span>
                  <!-- <span class="txt-required"> *</span> -->
                </span>
                <input type="text" class="form-control" v-model="form.nameEn" />
              </div>
            </div>
            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>ที่อยู่ติดต่อ</span>
                  <!-- <span class="txt-required"> *</span> -->
                </span>
                <textarea class="form-control" v-model="form.address" />
              </div>
            </div>
            <div class="form-col-container mt-2">
              <div class="mt-2">
                <span class="title-text">
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
                <span class="title-text">
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
            <div class="form-col-container mt-2">
              <div class="mt-2">
                <span class="title-text">
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
                <span class="title-text">
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
            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>ข้อมูลเพิ่มเติม</span>
                  <!-- <span class="txt-required"> *</span> -->
                </span>
                <textarea class="form-control" v-model="form.remark" />
              </div>
            </div>
            <div class="d-flex justify-content-center mt-2">
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

import { useCustomerDetailApiStore } from '@/stores/modules/api/customer/customer-detail-store.js'

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
    Dropdown
  },

  setup() {
    const customerStore = useCustomerDetailApiStore()
    return { customerStore }
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
        const params = {
          code: this.form.code,
          type: this.form.type,
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

        const res = await this.customerStore.fetchCreateCustomer({
          formValue: params
        })
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
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.input-group-text {
  height: 35px;
  margin-top: 5px;
}
</style>
