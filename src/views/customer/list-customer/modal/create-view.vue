<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="1000px" :isShowActionPart="true">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">เพิ่มข้อมูลลูกค้า</span>
      </template>
      <template #content>
        <form @submit.prevent="onSubmit" id="customer-create-form">
          <div class="p-4">
            <div class="form-row two-col">
              <div class="form-field">
                <span class="title-text">รหัสลูกค้า <span class="txt-required">*</span></span>
                <input type="text" class="form-control" v-model="form.code" required />
              </div>
              <div class="form-field">
                <span class="title-text">ประเภทลูกค้า <span class="txt-required">*</span></span>
                <Dropdown
                  v-model="form.type"
                  :options="masterCustomer"
                  optionLabel="description"
                  :class="val.isValCustomerType === true ? `p-invalid` : ``"
                  :showClear="form.customerType ? true : false"
                />
              </div>
            </div>
            <div class="form-row two-col">
              <div class="form-field">
                <span class="title-text">ชื่อภาษาไทย <span class="txt-required">*</span></span>
                <input type="text" class="form-control" v-model="form.nameTh" required />
              </div>
              <div class="form-field">
                <span class="title-text">ชื่อภาษาอังกฤษ</span>
                <input type="text" class="form-control" v-model="form.nameEn" />
              </div>
            </div>
            <div class="form-row two-col">
              <div class="form-field">
                <span class="title-text">ที่อยู่ติดต่อ</span>
                <textarea class="form-control" v-model="form.address" />
              </div>
              <div class="form-field">
                <span class="title-text">ข้อมูลเพิ่มเติม</span>
                <textarea class="form-control" v-model="form.remark" />
              </div>
            </div>
            <div class="form-row two-col">
              <div class="form-field">
                <span class="title-text">เบอร์โทรติดต่อ 1</span>
                <div class="input-group input-group-inner">
                  <div class="input-group-append">
                    <span class="input-group-text">
                      <i class="bi bi-telephone-fill txt-main-color"></i>
                    </span>
                  </div>
                  <input id="tel1" class="form-control bg-input" type="tel" v-model.trim="form.tel1" />
                </div>
              </div>
              <div class="form-field">
                <span class="title-text">เบอร์โทรติดต่อ 2</span>
                <div class="input-group input-group-inner">
                  <div class="input-group-append">
                    <span class="input-group-text">
                      <i class="bi bi-telephone-fill txt-main-color"></i>
                    </span>
                  </div>
                  <input id="tel2" class="form-control bg-input" type="tel" v-model.trim="form.tel2" />
                </div>
              </div>
            </div>
            <div class="form-row two-col">
              <div class="form-field">
                <span class="title-text">E-mail</span>
                <div class="input-group input-group-inner">
                  <div class="input-group-append">
                    <span class="input-group-text">
                      <i class="bi bi-envelope-check-fill txt-main-color"></i>
                    </span>
                  </div>
                  <input id="email" class="form-control bg-input" type="email" v-model.trim="form.email" />
                </div>
              </div>
              <div class="form-field">
                <span class="title-text">บุคคลติดต่อ</span>
                <div class="input-group input-group-inner">
                  <div class="input-group-append">
                    <span class="input-group-text">
                      <i class="bi bi-person-lines-fill txt-main-color"></i>
                    </span>
                  </div>
                  <input id="contact" class="form-control bg-input" type="text" v-model.trim="form.contact" />
                </div>
              </div>
            </div>
          </div>
        </form>
      </template>
      <template #action>
        <button class="btn btn-sm btn-main" type="submit" form="customer-create-form">
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

textarea.form-control {
  resize: vertical;
}

.input-group-text {
  height: 35px;
  margin-top: 5px;
}
</style>
