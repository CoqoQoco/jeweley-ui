<template>
  <div class="pos-customer-chip">
    <div v-if="!showForm" class="chip-row">
      <div class="chip-info">
        <i class="bi bi-person-circle"></i>
        <div class="chip-text">
          <span class="chip-name">{{ displayName }}</span>
          <span v-if="customer.tel" class="chip-tel">{{ customer.tel }}</span>
        </div>
      </div>
      <ButtonGeneric
        variant="outline"
        :icon="isWalkin ? 'bi-plus-lg' : 'bi-pencil'"
        :label="isWalkin ? $t('view.mobile.pos.addCustomerBtn') : $t('view.mobile.pos.changeCustomerBtn')"
        @click="openForm"
      />
    </div>

    <div v-else class="customer-form">
      <div class="form-title">{{ $t('view.mobile.pos.customerFormTitle') }}</div>
      <div class="form-row">
        <label>{{ $t('view.mobile.pos.fieldCustomerTel') }}</label>
        <InputTextGeneric
          v-model.trim="form.tel"
          type="tel"
          icon="bi-telephone-fill"
          :placeholder="$t('view.mobile.pos.placeholderCustomerTel')"
        />
      </div>
      <div class="form-row">
        <label>{{ $t('view.mobile.pos.fieldCustomerName') }}</label>
        <InputTextGeneric
          v-model.trim="form.name"
          icon="bi-person-lines-fill"
          :placeholder="$t('view.mobile.pos.placeholderCustomerName')"
        />
      </div>
      <div class="form-actions">
        <ButtonGeneric variant="main" icon="bi-check-circle" :label="$t('common.btn.save')" @click="onSubmit" />
        <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="cancelForm" />
      </div>
    </div>
  </div>
</template>

<script>
import { useCustomerDetailApiStore } from '@/stores/modules/api/customer/customer-detail-store.js'
import { warning, success } from '@/services/alert/sweetAlerts.js'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'PosCustomerChip',

  components: {
    InputTextGeneric,
    ButtonGeneric
  },

  props: {
    customer: {
      type: Object,
      default: () => ({ code: 'WALKIN', name: '', tel: '' })
    },
    codePrefix: {
      type: String,
      default: 'TH'
    },
    customerType: {
      type: String,
      default: 'L'
    }
  },

  emits: ['update:customer'],

  setup() {
    const customerStore = useCustomerDetailApiStore()
    return { customerStore }
  },

  data() {
    return {
      showForm: false,
      form: { name: '', tel: '' }
    }
  },

  computed: {
    isWalkin() {
      return !this.customer?.code || this.customer.code === 'WALKIN'
    },

    displayName() {
      if (this.isWalkin) return this.$t('view.mobile.pos.customerWalkin')
      return this.customer.name || this.customer.code
    }
  },

  methods: {
    openForm() {
      this.form = { name: this.customer?.name || '', tel: this.customer?.tel || '' }
      this.showForm = true
    },

    cancelForm() {
      this.showForm = false
    },

    async onSubmit() {
      if (!this.form.tel && !this.form.name) {
        warning(this.$t('view.mobile.pos.warnEnterNameOrTel'))
        return
      }

      const telDigits = (this.form.tel || '').replace(/\D/g, '')

      // มีเบอร์ ≥ 6 หลัก → ลองค้นลูกค้าเดิมก่อน (ผูก customerCode เดิม เพื่อประวัติซื้อซ้ำต่อเนื่อง)
      if (telDigits.length >= 6) {
        const searchResult = await this.customerStore.fetchCustomerSearch({
          take: 5,
          skip: 0,
          sort: [],
          formValue: { text: telDigits },
          skipLoading: true
        })

        const found =
          searchResult?.data?.find((c) => {
            const digits = (c.telephone1 || c.tel1 || '').replace(/\D/g, '')
            return digits && digits === telDigits
          }) || null

        if (found) {
          this.$emit('update:customer', {
            code: found.code,
            name: found.nameTh || found.nameEn || found.code,
            tel: found.telephone1 || found.tel1 || telDigits
          })
          success(this.$t('view.mobile.pos.successFoundCustomer'), found.code)
          this.showForm = false
          return
        }
      }

      // ไม่เจอ (หรือไม่ได้กรอกเบอร์) → สร้างลูกค้าใหม่อัตโนมัติตามโหมดงาน
      if (!this.form.name) {
        warning(this.$t('view.mobile.pos.warnEnterNameForNewCustomer'))
        return
      }

      const created = await this.customerStore.fetchCreateCustomer({
        formValue: {
          autoCode: true,
          codePrefix: this.codePrefix,
          type: { code: this.customerType },
          nameTh: this.form.name,
          tel1: telDigits || null
        }
      })

      if (created) {
        const newCode = created.code || created.customerCode
        this.$emit('update:customer', {
          code: newCode,
          name: this.form.name,
          tel: telDigits
        })
        success(this.$t('view.mobile.pos.successCreateCustomer'), newCode)
        this.showForm = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.pos-customer-chip {
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  padding: var(--sp-md);
  border: 1px solid var(--color-border);
  margin-top: var(--sp-md);
}

.chip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-sm);
}

.chip-info {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  min-width: 0;

  i {
    font-size: 1.6rem;
    color: var(--base-font-color);
    flex-shrink: 0;
  }

  .chip-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .chip-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chip-tel {
    font-size: 0.8rem;
    color: #666;
  }
}

.customer-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);

  .form-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
  }

  .form-row {
    label {
      display: block;
      font-size: 0.8rem;
      color: #666;
      margin-bottom: 4px;
    }
  }

  .form-actions {
    display: flex;
    margin-top: var(--sp-xs);

    :deep(.btn) {
      flex: 1;
    }
  }
}
</style>
