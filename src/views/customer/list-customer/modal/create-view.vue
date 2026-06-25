<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="1000px" :isShowActionPart="true" headerVariant="main">
      <template #title>
        <span class="title-text-lg d-block">{{ isEdit ? $t('view.customer.editTitle') : $t('view.customer.createTitle') }}</span>
      </template>
      <template #content>
        <form @submit.prevent="onSubmit" id="customer-create-form">
          <div class="p-3">
            <SectionCardGeneric :title="$t('view.customer.section.main')" class="modal-section">
              <div class="form-row two-col">
                <FormFieldGeneric :label="$t('view.customer.field.customerCode')" :required="true">
                  <InputTextGeneric v-model="form.code" :required="true" :disabled="isEdit" />
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
            </SectionCardGeneric>

            <SectionCardGeneric :title="$t('view.customer.section.contact')" class="modal-section">
              <div class="form-row two-col">
                <FormFieldGeneric :label="$t('view.customer.field.tel1')">
                  <InputTextGeneric id="tel1" type="tel" icon="bi-telephone-fill" v-model.trim="form.tel1" />
                </FormFieldGeneric>
                <FormFieldGeneric :label="$t('view.customer.field.tel2')">
                  <InputTextGeneric id="tel2" type="tel" icon="bi-telephone-fill" v-model.trim="form.tel2" />
                </FormFieldGeneric>
              </div>
              <div class="form-row two-col">
                <FormFieldGeneric :label="$t('view.customer.field.email')">
                  <InputTextGeneric id="email" type="email" icon="bi-envelope-check-fill" v-model.trim="form.email" />
                </FormFieldGeneric>
                <FormFieldGeneric :label="$t('view.customer.field.contact')">
                  <InputTextGeneric id="contact" type="text" icon="bi-person-lines-fill" v-model.trim="form.contact" />
                </FormFieldGeneric>
              </div>
            </SectionCardGeneric>

            <SectionCardGeneric :title="$t('view.customer.section.sale')" class="modal-section">
              <div class="form-row two-col">
                <FormFieldGeneric :label="$t('view.customer.field.discount')">
                  <InputTextGeneric v-model.number="form.discount" type="number" :min="0" :max="99" />
                </FormFieldGeneric>
                <div></div>
              </div>
            </SectionCardGeneric>
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
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
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
  remark: null,
  discount: 0
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
    SectionCardGeneric,
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
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['closeModal', 'saved'],

  watch: {
    'form.type'() {
      if (this.form.type) {
        this.val.isValCustomerType = false
      }
    },
    isShow(val) {
      if (val && this.isEdit) {
        this.form.code = this.editData.code
        this.form.nameTh = this.editData.nameTh
        this.form.nameEn = this.editData.nameEn
        this.form.address = this.editData.address
        this.form.tel1 = this.editData.telephone1
        this.form.tel2 = this.editData.telephone2
        this.form.email = this.editData.email
        this.form.contact = this.editData.contactName
        this.form.remark = this.editData.remark
        this.form.discount = this.editData.discount ?? 0
        this.form.type = this.masterCustomer.find((t) => t.code === this.editData.typeCode) || null
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
        this.isEdit ? this.$t('view.customer.confirm.edit') : this.$t('view.customer.confirm.create'),
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
      if (
        this.form.discount !== null &&
        this.form.discount !== undefined &&
        this.form.discount !== '' &&
        (!Number.isInteger(Number(this.form.discount)) || this.form.discount < 0 || this.form.discount > 99)
      ) {
        warning(this.$t('view.customer.validation.discountRange'))
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
        contact: this.form.contact,
        remark: this.form.remark,
        discount: this.form.discount
      }

      let res
      if (this.isEdit) {
        res = await this.customerStore.fetchUpdateCustomer({ formValue: params })
      } else {
        res = await this.customerStore.fetchCreateCustomer({ formValue: params })
      }

      if (res) {
        const msg = this.isEdit ? this.$t('view.customer.success.edit') : this.$t('view.customer.success.create')
        success(msg, null, () => {
          this.closeModal()
          this.$emit('saved')
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

.modal-section {
  margin-bottom: var(--sp-lg);

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
