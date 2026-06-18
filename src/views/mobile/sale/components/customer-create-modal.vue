<template>
  <Teleport to="body">
    <div v-if="isVisible" class="customer-create-overlay">
      <div class="customer-create-container">
      <!-- Form (scrollable, action row is first item) -->
      <div class="create-form-section">
        <form @submit.prevent="onSubmit">
          <!-- Action Row -->
          <div class="create-action-row">
            <button class="btn-close-form" type="button" @click="onCancel">
              <i class="bi bi-x-lg"></i>
              {{ $t('view.mobile.sale.btnClose') }}
            </button>
            <span class="action-row-title">{{ $t('view.mobile.sale.createModalTitle') }}</span>
            <button class="btn-save-form" type="button" @click="onSubmit">
              <i class="bi bi-check-circle"></i>
              {{ $t('view.mobile.sale.btnSave') }}
            </button>
          </div>

          <div class="mobile-form-group">
            <label>{{ $t('view.mobile.sale.fieldCustomerCode') }} <span class="required">*</span></label>
            <div class="code-input-row">
              <InputTextGeneric
                v-model="form.code"
                :placeholder="$t('view.mobile.sale.placeholderCustomerCode')"
                :required="true"
                :readonly="true"
                :trim="true"
              />
              <button type="button" class="btn-refresh-code mt-2" @click="generateCode" title="สร้างรหัสใหม่">
                <i class="bi bi-arrow-repeat"></i>
              </button>
            </div>
          </div>

          <div class="mobile-form-group">
            <label>{{ $t('view.mobile.sale.fieldCustomerType') }} <span class="required">*</span></label>
            <select v-model="form.typeCode" required>
              <option value="" disabled>{{ $t('view.mobile.sale.placeholderCustomerType') }}</option>
              <option
                v-for="type in customerTypes"
                :key="type.code"
                :value="type.code"
              >
                {{ type.description }}
              </option>
            </select>
          </div>

          <div class="mobile-form-group">
            <label>{{ $t('view.mobile.sale.fieldNameTh') }} <span class="required">*</span></label>
            <InputTextGeneric
              v-model="form.nameTh"
              :placeholder="$t('view.mobile.sale.placeholderNameTh')"
              :required="true"
              :trim="true"
            />
          </div>

          <div class="mobile-form-group">
            <label>{{ $t('view.mobile.sale.fieldNameEn') }}</label>
            <InputTextGeneric
              v-model="form.nameEn"
              :placeholder="$t('view.mobile.sale.placeholderNameEn')"
              :trim="true"
            />
          </div>

          <div class="mobile-form-group">
            <label>{{ $t('view.mobile.sale.fieldCustomerAddress') }}</label>
            <TextareaGeneric
              v-model="form.address"
              :placeholder="$t('view.mobile.sale.placeholderAddress')"
              :rows="3"
            />
          </div>

          <div class="mobile-form-group">
            <label>{{ $t('view.mobile.sale.fieldTel') }}</label>
            <InputTextGeneric
              v-model="form.telephone1"
              type="tel"
              :placeholder="$t('view.mobile.sale.placeholderTel')"
              :trim="true"
            />
          </div>

          <div class="mobile-form-group">
            <label>{{ $t('view.mobile.sale.fieldCustomerEmail') }}</label>
            <InputTextGeneric
              v-model="form.email"
              type="email"
              :placeholder="$t('view.mobile.sale.placeholderEmail')"
              :trim="true"
            />
          </div>

          <div class="mobile-form-group">
            <label>{{ $t('view.mobile.sale.fieldContactName') }}</label>
            <InputTextGeneric
              v-model="form.contactName"
              :placeholder="$t('view.mobile.sale.placeholderContactName')"
              :trim="true"
            />
          </div>

          <div class="mobile-form-group">
            <label>{{ $t('common.field.remark') }}</label>
            <TextareaGeneric
              v-model="form.remark"
              :placeholder="$t('view.mobile.sale.placeholderRemark')"
              :rows="2"
            />
          </div>

        </form>
      </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { useCustomerDetailApiStore } from '@/stores/modules/api/customer/customer-detail-store.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'

const defaultForm = {
  code: '',
  typeCode: '',
  nameTh: '',
  nameEn: '',
  address: '',
  telephone1: '',
  email: '',
  contactName: '',
  remark: ''
}

export default {
  name: 'CustomerCreateModal',

  components: {
    InputTextGeneric,
    TextareaGeneric
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'customer-created'],

  setup() {
    const customerStore = useCustomerDetailApiStore()
    const masterStore = useMasterApiStore()
    return { customerStore, masterStore }
  },

  data() {
    return {
      isVisible: false,
      form: { ...defaultForm }
    }
  },

  computed: {
    customerTypes() {
      return this.masterStore.customerType || []
    }
  },

  watch: {
    visible(val) {
      this.isVisible = val
      if (val) {
        this.resetForm()
        this.loadMasterData()
      }
    }
  },

  methods: {
    async loadMasterData() {
      await this.masterStore.fetchCustomerType()
    },

    async onSubmit() {
      if (!this.form.code || !this.form.nameTh) {
        warning(this.$t('view.mobile.sale.warnEnterCodeAndName'), this.$t('view.mobile.sale.warnIncompleteTitle'))
        return
      }

      if (!this.form.typeCode) {
        warning(this.$t('view.mobile.sale.warnSelectType'), this.$t('view.mobile.sale.warnIncompleteTitle'))
        return
      }

      const formValue = {
        code: this.form.code,
        type: { code: this.form.typeCode },
        nameTh: this.form.nameTh,
        nameEn: this.form.nameEn,
        address: this.form.address,
        tel1: this.form.telephone1,
        tel2: null,
        email: this.form.email,
        contactName: this.form.contactName,
        remark: this.form.remark
      }

      const result = await this.customerStore.fetchCreateCustomer({ formValue })

      if (result) {
        success(this.$t('view.mobile.sale.successCreateCustomer'), this.form.code, () => {
          this.$emit('customer-created', {
            id: result.id,
            code: this.form.code,
            nameTh: this.form.nameTh,
            nameEn: this.form.nameEn,
            address: this.form.address,
            telephone1: this.form.telephone1,
            email: this.form.email,
            contactName: this.form.contactName,
            remark: this.form.remark
          })
          this.onCancel()
        })
      }
    },

    onCancel() {
      this.isVisible = false
      this.$emit('close')
    },

    generateCode() {
      const now = new Date()
      const yy = String(now.getFullYear()).slice(-2)
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const hex = Math.random().toString(16).substring(2, 6).toUpperCase()
      this.form.code = `CUST-${yy}${mm}${dd}-${hex}`
    },

    resetForm() {
      this.form = { ...defaultForm }
      this.generateCode()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.customer-create-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f5f5;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.customer-create-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.create-form-section {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-top: calc(16px + env(safe-area-inset-top, 0px));
  padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));

  .create-action-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    margin-bottom: 16px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .btn-close-form {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      background: white;
      color: #666;
      font-size: 0.85rem;
      cursor: pointer;
      white-space: nowrap;

      i {
        font-size: 0.85rem;
      }

      &:active {
        background: #f0f0f0;
      }
    }

    .action-row-title {
      flex: 1;
      font-size: 0.95rem;
      font-weight: 600;
      color: #333;
      text-align: center;
    }

    .btn-save-form {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background: var(--base-font-color);
      color: white;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;

      i {
        font-size: 0.9rem;
      }

      &:active {
        opacity: 0.8;
      }
    }
  }

  .mobile-form-group {
    margin-bottom: 14px;

    &:last-child {
      margin-bottom: 0;
    }

    label {
      display: block;
      font-size: 0.85rem;
      font-weight: 500;
      color: #555;
      margin-bottom: 6px;

      .required {
        color: #e74c3c;
      }
    }

    .code-input-row {
      display: flex;
      gap: 8px;

      input {
        flex: 1;
      }

      .btn-refresh-code {
        width: 44px;
        min-width: 44px;
        height: 44px;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        background: white;
        color: var(--base-font-color);
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &:active {
          background: #f0f0f0;
          transform: rotate(180deg);
        }
      }
    }

    input,
    textarea,
    select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s ease;
      background: white;
      color: #333;

      &:focus {
        border-color: var(--base-font-color);
      }

      &::placeholder {
        color: #bbb;
      }
    }

    select {
      appearance: auto;
      cursor: pointer;
    }

    textarea {
      resize: vertical;
    }
  }
}
</style>
