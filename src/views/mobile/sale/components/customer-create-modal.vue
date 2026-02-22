<template>
  <div v-if="isVisible" class="customer-create-overlay">
    <div class="customer-create-container">
      <!-- Header -->
      <div class="create-header">
        <button class="btn-close-modal" @click="onCancel">
          <i class="bi bi-x-lg"></i>
        </button>
        <h3 class="create-title">
          <i class="bi bi-person-plus"></i>
          เพิ่มลูกค้าใหม่
        </h3>
      </div>

      <!-- Form -->
      <div class="create-form-section">
        <form @submit.prevent="onSubmit">
          <div class="mobile-form-group">
            <label>รหัสลูกค้า <span class="required">*</span></label>
            <div class="code-input-row">
              <input
                v-model.trim="form.code"
                type="text"
                placeholder="CUST-YYMMDD-XXXX"
                required
                readonly
              />
              <button type="button" class="btn-refresh-code mt-2" @click="generateCode" title="สร้างรหัสใหม่">
                <i class="bi bi-arrow-repeat"></i>
              </button>
            </div>
          </div>

          <div class="mobile-form-group">
            <label>ประเภทลูกค้า <span class="required">*</span></label>
            <select v-model="form.typeCode" required>
              <option value="" disabled>เลือกประเภทลูกค้า</option>
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
            <label>ชื่อภาษาไทย <span class="required">*</span></label>
            <input
              v-model.trim="form.nameTh"
              type="text"
              placeholder="ชื่อลูกค้า (ภาษาไทย)"
              required
            />
          </div>

          <div class="mobile-form-group">
            <label>ชื่อภาษาอังกฤษ</label>
            <input
              v-model.trim="form.nameEn"
              type="text"
              placeholder="Customer Name (English)"
            />
          </div>

          <div class="mobile-form-group">
            <label>ที่อยู่</label>
            <textarea
              v-model.trim="form.address"
              placeholder="ที่อยู่ติดต่อ"
              rows="3"
            ></textarea>
          </div>

          <div class="mobile-form-group">
            <label>เบอร์โทรศัพท์</label>
            <input
              v-model.trim="form.telephone1"
              type="tel"
              placeholder="เบอร์โทรติดต่อ"
            />
          </div>

          <div class="mobile-form-group">
            <label>อีเมล</label>
            <input
              v-model.trim="form.email"
              type="email"
              placeholder="email@example.com"
            />
          </div>

          <div class="mobile-form-group">
            <label>บุคคลติดต่อ</label>
            <input
              v-model.trim="form.contactName"
              type="text"
              placeholder="ชื่อบุคคลติดต่อ"
            />
          </div>

          <div class="mobile-form-group">
            <label>หมายเหตุ</label>
            <textarea
              v-model.trim="form.remark"
              placeholder="หมายเหตุ (ถ้ามี)"
              rows="2"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="create-actions">
            <button class="mobile-btn mobile-btn-outline" type="button" @click="onCancel">
              <i class="bi bi-x"></i>
              ยกเลิก
            </button>
            <button class="mobile-btn mobile-btn-primary" type="submit">
              <i class="bi bi-check-circle"></i>
              บันทึกลูกค้า
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useCustomerDetailApiStore } from '@/stores/modules/api/customer/customer-detail-store.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'

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
        warning('กรุณากรอกรหัสลูกค้าและชื่อ', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      if (!this.form.typeCode) {
        warning('กรุณาเลือกประเภทลูกค้า', 'ข้อมูลไม่ครบถ้วน')
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
        success('เพิ่มลูกค้าสำเร็จ', this.form.code, () => {
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

.create-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;

  .btn-close-modal {
    background: none;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 1.1rem;
    cursor: pointer;

    &:active {
      background: #f0f0f0;
    }
  }

  .create-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0;

    i {
      color: var(--base-font-color);
    }
  }
}

.create-form-section {
  flex: 1;
  overflow-y: auto;
  padding: 16px;

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

.create-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));

  .mobile-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    i {
      font-size: 1rem;
    }
  }
}
</style>
