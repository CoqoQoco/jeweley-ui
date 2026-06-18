<template>
  <modal :showModal="isShowModal" @closeModal="onCancel" width="800px">
    <template v-slot:content>
      <form @submit.prevent="onSubmit">
        <div class="p-3">
          <div class="title-text-lg mb-3">
            <span><i class="bi bi-pencil-square mr-2"></i></span>
            <span>{{ $t('view.customer.editTitle') }}</span>
          </div>

          <div class="form-content">
            <div class="form-col-container">
              <div>
                <span class="title-text">
                  <span>{{ $t('view.customer.field.customerCode') }}</span>
                </span>
                <InputTextGeneric
                  :modelValue="form.code"
                  :readonly="true"
                  :bgInput="true"
                />
              </div>
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
            </div>

            <div class="form-col-container mt-2">
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
                <div class="input-group input-group-inner">
                  <div class="input-group-append">
                    <span class="input-group-text">
                      <i class="bi bi-telephone-fill txt-main-color"></i>
                    </span>
                  </div>
                  <InputTextGeneric
                    :modelValue="form.telephone1"
                    type="tel"
                    :trim="true"
                    :bgInput="true"
                    @update:modelValue="form.telephone1 = $event"
                  />
                </div>
              </div>

              <div>
                <span class="title-text">
                  <span>{{ $t('view.customer.field.tel2') }}</span>
                </span>
                <div class="input-group input-group-inner">
                  <div class="input-group-append">
                    <span class="input-group-text">
                      <i class="bi bi-telephone-fill txt-main-color"></i>
                    </span>
                  </div>
                  <InputTextGeneric
                    :modelValue="form.telephone2"
                    type="tel"
                    :trim="true"
                    :bgInput="true"
                    @update:modelValue="form.telephone2 = $event"
                  />
                </div>
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">
                  <span>{{ $t('view.customer.field.email') }}</span>
                </span>
                <div class="input-group input-group-inner">
                  <div class="input-group-append">
                    <span class="input-group-text">
                      <i class="bi bi-envelope-check-fill txt-main-color"></i>
                    </span>
                  </div>
                  <InputTextGeneric
                    :modelValue="form.email"
                    type="email"
                    :trim="true"
                    :bgInput="true"
                    @update:modelValue="form.email = $event"
                  />
                </div>
              </div>

              <div>
                <span class="title-text">
                  <span>{{ $t('view.customer.field.contact') }}</span>
                </span>
                <div class="input-group input-group-inner">
                  <div class="input-group-append">
                    <span class="input-group-text">
                      <i class="bi bi-person-lines-fill txt-main-color"></i>
                    </span>
                  </div>
                  <InputTextGeneric
                    :modelValue="form.contactName"
                    :trim="true"
                    :bgInput="true"
                    @update:modelValue="form.contactName = $event"
                  />
                </div>
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

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import { useCustomerDetailApiStore } from '@/stores/modules/api/customer/customer-detail-store.js'
import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'

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
    TextareaGeneric,
    ButtonGeneric
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

      confirmSubmit(
        `${this.form.code} - ${this.form.nameTh}`,
        this.$t('view.customer.confirm.edit'),
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
        success(
          this.$t('view.customer.success.edit'),
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

.input-group-text {
  height: 35px;
  margin-top: 5px;
}

.txt-required {
  color: #dc3545;
}
</style>
