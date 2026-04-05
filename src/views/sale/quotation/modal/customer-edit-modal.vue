<template>
  <modal :showModal="isShowModal" @closeModal="onCancel" width="800px">
    <template v-slot:content>
      <form @submit.prevent="onSubmit">
        <div class="p-3">
          <div class="title-text-lg mb-3">
            <span><i class="bi bi-pencil-square mr-2"></i></span>
            <span>แก้ไขข้อมูลลูกค้า</span>
          </div>

          <div class="form-content">
            <div class="form-col-container">
              <div>
                <span class="title-text">
                  <span>รหัสลูกค้า</span>
                </span>
                <input
                  type="text"
                  class="form-control"
                  :value="form.code"
                  readonly
                  style="background-color: #e9ecef;"
                />
              </div>
              <div>
                <span class="title-text">
                  <span>ชื่อภาษาไทย</span>
                  <span class="txt-required"> *</span>
                </span>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="form.nameTh"
                  required
                />
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>ชื่อภาษาอังกฤษ</span>
                </span>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="form.nameEn"
                />
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>ที่อยู่ติดต่อ</span>
                </span>
                <textarea
                  class="form-control"
                  v-model.trim="form.address"
                  rows="3"
                />
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
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
                    class="form-control bg-input"
                    type="tel"
                    v-model.trim="form.telephone1"
                  />
                </div>
              </div>

              <div>
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
                    class="form-control bg-input"
                    type="tel"
                    v-model.trim="form.telephone2"
                  />
                </div>
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
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
                    class="form-control bg-input"
                    type="email"
                    v-model.trim="form.email"
                  />
                </div>
              </div>

              <div>
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
                    class="form-control bg-input"
                    type="text"
                    v-model.trim="form.contactName"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end mt-4">
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onCancel">
              <span><i class="bi bi-x-circle"></i></span>
              <span class="ml-2">ยกเลิก</span>
            </button>
            <button class="btn btn-sm btn-green" type="submit">
              <span><i class="bi bi-check-circle"></i></span>
              <span class="ml-2">บันทึก</span>
            </button>
          </div>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { useCustomerDetailApiStore } from '@/stores/modules/api/customer/customer-detail-store.js'
import swAlert from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

const interfaceForm = {
  code: null,
  nameTh: null,
  nameEn: null,
  address: null,
  telephone1: null,
  telephone2: null,
  contactName: null,
  email: null
}

export default {
  name: 'CustomerEditModal',

  components: {
    modal
  },

  props: {
    isShow: { type: Boolean, default: false },
    customerData: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['closeModal', 'customerUpdated'],

  setup() {
    const customerStore = useCustomerDetailApiStore()
    return { customerStore }
  },

  data() {
    return {
      isShowModal: this.isShow,
      form: { ...interfaceForm }
    }
  },

  watch: {
    isShow(val) {
      this.isShowModal = val
      if (val) {
        this.populateForm()
      }
    },
    isShowModal(val) {
      if (!val) this.$emit('closeModal')
    }
  },

  methods: {
    populateForm() {
      this.form = {
        code: this.customerData.code || null,
        nameTh: this.customerData.nameTh || null,
        nameEn: this.customerData.nameEn || null,
        address: this.customerData.address || null,
        telephone1: this.customerData.telephone1 || null,
        telephone2: this.customerData.telephone2 || null,
        email: this.customerData.email || null,
        contactName: this.customerData.contactName || null
      }
    },

    async onSubmit() {
      if (!this.form.nameTh) {
        return
      }

      swAlert.confirmSubmit(
        `${this.form.code} - ${this.form.nameTh}`,
        'ยืนยันแก้ไขข้อมูลลูกค้า',
        async () => {
          await this.submitUpdateCustomer()
        }
      )
    },

    async submitUpdateCustomer() {
      const formValue = {
        code: this.form.code,
        nameTh: this.form.nameTh,
        nameEn: this.form.nameEn,
        address: this.form.address,
        tel1: this.form.telephone1,
        tel2: this.form.telephone2,
        email: this.form.email,
        contactName: this.form.contactName
      }

      const result = await this.customerStore.fetchUpdateCustomer({ formValue })

      if (result) {
        swAlert.success(
          'แก้ไขข้อมูลลูกค้าสำเร็จ',
          null,
          () => {
            const updatedData = {
              code: this.form.code,
              nameTh: this.form.nameTh,
              nameEn: this.form.nameEn,
              address: this.form.address,
              telephone1: this.form.telephone1,
              telephone2: this.form.telephone2,
              email: this.form.email,
              contactName: this.form.contactName
            }
            this.$emit('customerUpdated', updatedData)
            this.onCancel()
          }
        )
      }
    },

    onCancel() {
      this.form = { ...interfaceForm }
      this.isShowModal = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.title-text-lg {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--base-font-color);
  display: flex;
  align-items: center;
}

.form-content {
  max-height: 500px;
  overflow-y: auto;
}

.input-group-text {
  height: 35px;
  margin-top: 5px;
}

.txt-required {
  color: #dc3545;
}

.btn {
  display: inline-flex;
  align-items: center;
}

.btn i {
  font-size: 0.875rem;
}
</style>
