<template>
  <modal :showModal="isShowModal" @closeModal="onCancel" width="800px">
    <template v-slot:content>
      <form @submit.prevent="onSubmit">
        <div class="p-3">
          <div class="title-text-lg mb-3">
            <span><i class="bi bi-person-plus mr-2"></i></span>
            <span>เพิ่มลูกค้าใหม่</span>
          </div>

          <div class="form-content">
            <div class="form-col-container">
              <div>
                <span class="title-text">
                  <span>รหัสลูกค้า</span>
                  <span class="txt-required"> *</span>
                </span>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model.trim="form.code" 
                  required 
                />
              </div>
              <div>
                <span class="title-text">
                  <span>ประเภทลูกค้า</span>
                  <span class="txt-required"> *</span>
                </span>
                <Dropdown
                  v-model="form.type"
                  :options="masterCustomerType"
                  optionLabel="description"
                  :class="validation.isValCustomerType === true ? `p-invalid` : ``"
                  :showClear="form.type ? true : false"
                  placeholder="เลือกประเภทลูกค้า"
                />
              </div>
            </div>

            <div class="form-col-container mt-2">
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

            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>ข้อมูลเพิ่มเติม</span>
                </span>
                <textarea 
                  class="form-control" 
                  v-model.trim="form.remark" 
                  rows="2"
                />
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
import Dropdown from 'primevue/dropdown'
import { useCustomerDetailApiStore } from '@/stores/modules/api/customer/customer-detail-store.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import swAlert from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

const interfaceForm = {
  code: null,
  nameTh: null,
  nameEn: null,
  address: null,
  telephone1: null,
  telephone2: null,
  type: null,
  contactName: null,
  email: null,
  remark: null
}

const interfaceValidation = {
  isValCustomerType: false
}

export default {
  name: 'CustomerCreateModal',

  components: {
    modal,
    Dropdown
  },

  props: {
    showModal: { type: Boolean, default: false }
  },

  emits: ['closeModal', 'customerCreated'],

  setup() {
    const customerStore = useCustomerDetailApiStore()
    const masterStore = useMasterApiStore()
    return { customerStore, masterStore }
  },

  data() {
    return {
      isShowModal: this.showModal,
      form: { ...interfaceForm },
      validation: { ...interfaceValidation }
    }
  },

  computed: {
    masterCustomerType() {
      return this.masterStore.customerType || []
    }
  },

  watch: {
    showModal(val) {
      this.isShowModal = val
      if (val) {
        this.resetForm()
        this.loadMasterData()
      }
    },
    isShowModal(val) {
      if (!val) this.$emit('closeModal')
    },
    'form.type'() {
      if (this.form.type) {
        this.validation.isValCustomerType = false
      }
    }
  },

  methods: {
    async onSubmit() {
      if (this.validateForm()) {
        swAlert.confirmSubmit(
          `${this.form.code} - ${this.form.nameTh}`,
          'ยืนยันเพิ่มข้อมูลลูกค้า',
          async () => {
            await this.submitCustomer()
          }
        )
      }
    },

    validateForm() {
      this.validation = { ...interfaceValidation }

      if (!this.form.type) {
        this.validation.isValCustomerType = true
        return false
      }

      if (!this.form.code || !this.form.nameTh) {
        return false
      }

      return true
    },

    async submitCustomer() {
      try {
        const formValue = {
          code: this.form.code,
          type: this.form.type,
          nameTh: this.form.nameTh,
          nameEn: this.form.nameEn,
          address: this.form.address,
          tel1: this.form.telephone1,
          tel2: this.form.telephone2,
          email: this.form.email,
          contactName: this.form.contactName,
          remark: this.form.remark
        }

        const result = await this.customerStore.fetchCreateCustomer({ formValue })
        
        if (result) {
          swAlert.success(
            'เพิ่มลูกค้าสำเร็จ',
            null,
            () => {
              // Emit the created customer data back to parent
              const customerData = {
                id: result.id,
                code: this.form.code,
                nameTh: this.form.nameTh,
                nameEn: this.form.nameEn,
                address: this.form.address,
                telephone1: this.form.telephone1,
                telephone2: this.form.telephone2,
                email: this.form.email,
                contactName: this.form.contactName,
                remark: this.form.remark
              }
              this.$emit('customerCreated', customerData)
              this.onCancel()
            }
          )
        }
      } catch (error) {
        console.error('Error creating customer:', error)
        swAlert.error('เกิดข้อผิดพลาดในการเพิ่มลูกค้า')
      }
    },

    onCancel() {
      this.resetForm()
      this.isShowModal = false
    },

    resetForm() {
      this.form = { ...interfaceForm }
      this.validation = { ...interfaceValidation }
    },

    async loadMasterData() {
      try {
        await this.masterStore.fetchCustomerType()
      } catch (error) {
        console.error('Error loading master data:', error)
      }
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