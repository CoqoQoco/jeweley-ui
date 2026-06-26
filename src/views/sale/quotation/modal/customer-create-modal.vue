<template>
  <modal :showModal="isShowModal" @closeModal="onCancel" width="800px">
    <template v-slot:content>
      <form @submit.prevent="onSubmit">
        <div class="p-3">
          <div class="title-text-lg mb-3">
            <span><i class="bi bi-person-plus mr-2"></i></span>
            <span>{{ $t('view.customer.createTitle') }}</span>
          </div>

          <div class="form-content">
            <div class="form-col-container">
              <div>
                <span class="title-text">
                  <span>{{ $t('view.customer.field.customerCode') }}</span>
                  <span class="txt-required"> *</span>
                </span>
                <InputTextGeneric
                  :modelValue="form.code"
                  :trim="true"
                  :required="true"
                  @update:modelValue="form.code = $event"
                />
              </div>
              <div>
                <span class="title-text">
                  <span>{{ $t('view.customer.field.customerType') }}</span>
                  <span class="txt-required"> *</span>
                </span>
                <DropdownGeneric
                  :modelValue="form.type"
                  :options="masterCustomerType"
                  optionLabel="description"
                  :class="validation.isValCustomerType === true ? `p-invalid` : ``"
                  :showClear="form.type ? true : false"
                  :placeholder="$t('view.customer.placeholder.customerType')"
                  @update:modelValue="form.type = $event"
                />
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>{{ $t('view.customer.field.nameTh') }}</span>
                  <span class="txt-required"> *</span>
                </span>
                <InputTextGeneric
                  :modelValue="form.nameTh"
                  :trim="true"
                  :required="true"
                  @update:modelValue="form.nameTh = $event"
                />
              </div>
              <div>
                <span class="title-text">
                  <span>{{ $t('view.customer.field.nameEn') }}</span>
                </span>
                <InputTextGeneric
                  :modelValue="form.nameEn"
                  :trim="true"
                  @update:modelValue="form.nameEn = $event"
                />
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>{{ $t('view.customer.field.address') }}</span>
                </span>
                <TextareaGeneric
                  :modelValue="form.address"
                  :rows="3"
                  @update:modelValue="form.address = $event"
                />
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>{{ $t('view.customer.field.tel1') }}</span>
                </span>
                <InputTextGeneric
                  :modelValue="form.telephone1"
                  type="tel"
                  :trim="true"
                  :bgInput="true"
                  icon="bi-telephone-fill"
                  @update:modelValue="form.telephone1 = $event"
                />
              </div>

              <div>
                <span class="title-text">
                  <span>{{ $t('view.customer.field.tel2') }}</span>
                </span>
                <InputTextGeneric
                  :modelValue="form.telephone2"
                  type="tel"
                  :trim="true"
                  :bgInput="true"
                  icon="bi-telephone-fill"
                  @update:modelValue="form.telephone2 = $event"
                />
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>{{ $t('view.customer.field.email') }}</span>
                </span>
                <InputTextGeneric
                  :modelValue="form.email"
                  type="email"
                  :trim="true"
                  :bgInput="true"
                  icon="bi-envelope-check-fill"
                  @update:modelValue="form.email = $event"
                />
              </div>

              <div>
                <span class="title-text">
                  <span>{{ $t('view.customer.field.contact') }}</span>
                </span>
                <InputTextGeneric
                  :modelValue="form.contactName"
                  :trim="true"
                  :bgInput="true"
                  icon="bi-person-lines-fill"
                  @update:modelValue="form.contactName = $event"
                />
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>{{ $t('common.field.remark') }}</span>
                </span>
                <TextareaGeneric
                  :modelValue="form.remark"
                  :rows="2"
                  @update:modelValue="form.remark = $event"
                />
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end mt-4">
            <ButtonGeneric
              variant="dark"
              icon="bi-x-circle"
              :label="$t('common.btn.cancel')"
              type="button"
              class="mr-2"
              @click="onCancel"
            />
            <ButtonGeneric
              variant="green"
              icon="bi-check-circle"
              :label="$t('common.btn.save')"
              type="submit"
            />
          </div>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import { useCustomerDetailApiStore } from '@/stores/modules/api/customer/customer-detail-store.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

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
    DropdownGeneric,
    InputTextGeneric,
    TextareaGeneric,
    ButtonGeneric
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
        confirmSubmit(
          `${this.form.code} - ${this.form.nameTh}`,
          this.$t('view.customer.confirm.create'),
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
        success(
          this.$t('view.customer.success.create'),
          null,
          () => {
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
      await this.masterStore.fetchCustomerType()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.title-text-lg {
  font-size: var(--fs-lg);
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
</style>
