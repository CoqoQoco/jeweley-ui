<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="1000px" :isShowActionPart="true">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.customer.createTitle') }}</span>
      </template>
      <template #content>
        <form @submit.prevent="onSubmit" id="customer-create-form">
          <div class="p-4">
            <div class="form-row two-col">
              <FormFieldGeneric :label="$t('view.customer.field.customerCode')" :required="true">
                <InputTextGeneric v-model="form.code" :required="true" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.customer.field.customerType')" :required="true">
                <DropdownGeneric
                  :modelValue="form.type"
                  :options="masterCustomer"
                  optionLabel="description"
                  :class="val.isValCustomerType ? 'p-invalid' : ''"
                  :showClear="!!form.type"
                  @update:modelValue="form.type = $event"
                />
              </FormFieldGeneric>
            </div>
            <div class="form-row two-col">
              <FormFieldGeneric :label="$t('view.customer.field.nameTh')" :required="true">
                <InputTextGeneric v-model="form.nameTh" :required="true" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.customer.field.nameEn')">
                <InputTextGeneric v-model="form.nameEn" />
              </FormFieldGeneric>
            </div>
            <div class="form-row two-col">
              <FormFieldGeneric :label="$t('view.customer.field.address')">
                <TextareaGeneric v-model="form.address" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('common.field.remark')">
                <TextareaGeneric v-model="form.remark" />
              </FormFieldGeneric>
            </div>
            <div class="form-row two-col">
              <FormFieldGeneric :label="$t('view.customer.field.tel1')">
                <div class="input-group input-group-inner">
                  <div class="input-group-append">
                    <span class="input-group-text">
                      <i class="bi bi-telephone-fill txt-main-color"></i>
                    </span>
                  </div>
                  <InputTextGeneric id="tel1" type="tel" v-model.trim="form.tel1" />
                </div>
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.customer.field.tel2')">
                <div class="input-group input-group-inner">
                  <div class="input-group-append">
                    <span class="input-group-text">
                      <i class="bi bi-telephone-fill txt-main-color"></i>
                    </span>
                  </div>
                  <InputTextGeneric id="tel2" type="tel" v-model.trim="form.tel2" />
                </div>
              </FormFieldGeneric>
            </div>
            <div class="form-row two-col">
              <FormFieldGeneric :label="$t('view.customer.field.email')">
                <div class="input-group input-group-inner">
                  <div class="input-group-append">
                    <span class="input-group-text">
                      <i class="bi bi-envelope-check-fill txt-main-color"></i>
                    </span>
                  </div>
                  <InputTextGeneric id="email" type="email" v-model.trim="form.email" />
                </div>
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.customer.field.contact')">
                <div class="input-group input-group-inner">
                  <div class="input-group-append">
                    <span class="input-group-text">
                      <i class="bi bi-person-lines-fill txt-main-color"></i>
                    </span>
                  </div>
                  <InputTextGeneric id="contact" type="text" v-model.trim="form.contact" />
                </div>
              </FormFieldGeneric>
            </div>
          </div>
        </form>
      </template>
      <template #action>
        <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" type="submit" form="customer-create-form" />
        <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="closeModal" />
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import { useCustomerDetailApiStore } from '@/stores/modules/api/customer/customer-detail-store.js'

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
    InputTextGeneric,
    TextareaGeneric,
    FormFieldGeneric,
    ButtonGeneric,
    DropdownGeneric
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

  emits: ['closeModal'],

  watch: {
    'form.type'() {
      if (this.form.type) {
        this.val.isValCustomerType = false
      }
    }
  },

  data() {
    return {
      form: { ...interfaceForm },
      val: { ...interfaceIsValid }
    }
  },

  methods: {
    closeModal() {
      this.form = { ...interfaceForm }
      this.val = { ...interfaceIsValid }
      this.$emit('closeModal')
    },

    onSubmit() {
      if (!this.validateForm()) return

      confirmThenSubmit(
        `${this.form.code} - ${this.form.nameTh}`,
        this.$t('view.customer.confirm.create'),
        async () => {
          await this.submit()
        }
      )
    },

    validateForm() {
      if (!this.form.type) {
        this.val = { isValCustomerType: true }
        warning(this.$t('view.customer.validation.customerTypeRequired'))
        return false
      }
      return true
    },

    async submit() {
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

      const res = await this.customerStore.fetchCreateCustomer({
        formValue: params
      })

      if (res) {
        success(null, null, () => {
          this.closeModal()
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.card {
  background: var(--color-card-bg) !important;
}

.form-row {
  margin-bottom: var(--sp-lg);

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--sp-lg);
  }

  @media (max-width: 1024px) {
    &.two-col {
      grid-template-columns: 1fr;
    }
  }
}

.input-group-text {
  height: 35px;
  margin-top: 5px;
}
</style>
