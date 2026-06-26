<template>
  <modal :showModal="isShowModal" @closeModal="onCancel" width="800px">
    <template v-slot:content>
      <form @submit.prevent="onSubmit">
        <div class="p-3">
          <div class="title-text-lg mb-3">
            <span><i class="bi bi-pencil-square mr-2"></i></span>
            <span>{{ $t('view.sale.saleOrder.editCustomerTitle') }}</span>
          </div>

          <div class="form-content">
            <div class="form-col-container mb-2">
              <div>
                <span class="title-text">{{ $t('view.sale.saleOrder.editScope') }}</span>
                <div class="d-flex mt-1">
                  <label class="mr-3">
                    <input type="radio" value="document" v-model="scope" /> {{ $t('view.sale.saleOrder.editScopeDocument') }}
                  </label>
                  <label>
                    <input type="radio" value="master" v-model="scope" /> {{ $t('view.sale.saleOrder.editScopeMaster') }}
                  </label>
                </div>
              </div>
            </div>

            <div class="form-col-container">
              <div>
                <span class="title-text">
                  <span>{{ $t('view.sale.costStock.customerCode') }}</span>
                </span>
                <InputTextGeneric
                  :modelValue="form.code"
                  :readonly="true"
                  bgInput="#e9ecef"
                />
              </div>
              <div>
                <span class="title-text">
                  <span>{{ $t('view.sale.saleOrder.nameTh') }}</span>
                  <span class="txt-required"> *</span>
                </span>
                <InputTextGeneric
                  v-model="form.nameTh"
                  :trim="true"
                  :required="true"
                />
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>{{ $t('view.sale.saleOrder.nameEn') }}</span>
                </span>
                <InputTextGeneric
                  v-model="form.nameEn"
                  :trim="true"
                />
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>{{ $t('view.sale.saleOrder.contactAddress') }}</span>
                </span>
                <TextareaGeneric
                  v-model="form.address"
                  :rows="3"
                />
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>{{ $t('view.sale.saleOrder.phone1') }}</span>
                </span>
                <InputTextGeneric
                  v-model="form.telephone1"
                  type="tel"
                  :trim="true"
                  icon="bi-telephone-fill"
                />
              </div>

              <div>
                <span class="title-text">
                  <span>{{ $t('view.sale.saleOrder.phone2') }}</span>
                </span>
                <InputTextGeneric
                  v-model="form.telephone2"
                  type="tel"
                  :trim="true"
                  icon="bi-telephone-fill"
                />
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>E-mail</span>
                </span>
                <InputTextGeneric
                  v-model="form.email"
                  type="email"
                  :trim="true"
                  icon="bi-envelope-check-fill"
                />
              </div>

              <div>
                <span class="title-text">
                  <span>{{ $t('view.sale.saleOrder.contactPerson') }}</span>
                </span>
                <InputTextGeneric
                  v-model="form.contactName"
                  :trim="true"
                  icon="bi-person-lines-fill"
                />
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end mt-4">
            <button class="btn btn-sm btn-outline-main mr-2" type="button" @click="onCancel">
              <span><i class="bi bi-x-circle"></i></span>
              <span class="ml-2">{{ $t('common.btn.cancel') }}</span>
            </button>
            <button class="btn btn-sm btn-main" type="submit">
              <span><i class="bi bi-check-circle"></i></span>
              <span class="ml-2">{{ $t('common.btn.save') }}</span>
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
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

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
    modal,
    InputTextGeneric,
    TextareaGeneric
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
      scope: 'document',
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

      const isMaster = this.scope === 'master'
      const confirmTitle = isMaster
        ? this.$t('view.sale.saleOrder.confirmEditMasterTitle')
        : this.$t('view.sale.saleOrder.confirmEditDocumentTitle')
      const confirmMsg = isMaster
        ? `${this.form.code} - ${this.form.nameTh} (${this.$t('view.sale.saleOrder.confirmEditMasterMessage')})`
        : `${this.form.code} - ${this.form.nameTh} (${this.$t('view.sale.saleOrder.confirmEditDocumentMessage')})`

      swAlert.confirmSubmit(confirmMsg, confirmTitle, async () => {
        if (isMaster) {
          await this.submitUpdateCustomerMaster()
        } else {
          await this.submitUpdateDocumentOnly()
        }
      })
    },

    async submitUpdateCustomerMaster() {
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
        swAlert.success(this.$t('view.sale.saleOrder.success.editMaster'), null, () => {
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
        })
      }
    },

    async submitUpdateDocumentOnly() {
      await this.$nextTick()
      swAlert.success(this.$t('view.sale.saleOrder.success.editDocument'), null, () => {
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
      })
    },

    onCancel() {
      this.form = { ...interfaceForm }
      this.scope = 'document'
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
