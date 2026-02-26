<template>
  <Dialog
    :visible="isShow"
    header="รวม Quotation"
    :modal="true"
    :style="{ width: '860px', maxWidth: '95vw' }"
    :closable="true"
    :draggable="false"
    @update:visible="$emit('close')"
  >
    <div class="merge-modal-body">
      <!-- Conflict Resolution Section -->
      <div v-if="conflicts.length > 0" class="conflict-section">
        <div class="conflict-header">
          <i class="bi bi-exclamation-triangle-fill text-warning mr-2"></i>
          <strong>ข้อมูลที่แตกต่างกัน — กรุณาเลือกค่าที่จะใช้</strong>
        </div>

        <div
          v-for="conflict in conflicts"
          :key="conflict.key"
          class="conflict-field"
        >
          <div class="conflict-label">{{ conflict.label }}</div>
          <div class="conflict-options">
            <div
              v-for="opt in conflict.options"
              :key="opt.quotationNumber"
              class="conflict-option"
            >
              <input
                type="radio"
                :name="conflict.key"
                :value="opt.value"
                v-model="resolved[conflict.key]"
                :id="`${conflict.key}-${opt.quotationNumber}`"
                class="conflict-radio"
              />
              <label :for="`${conflict.key}-${opt.quotationNumber}`" class="conflict-option-label">
                <span class="badge badge-secondary mr-1">{{ opt.quotationNumber }}</span>
                <span :class="{ 'text-muted': opt.value === null || opt.value === undefined || opt.value === '' }">
                  {{ formatFieldValue(opt.value, conflict.type) }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- No Conflict Notice -->
      <div v-else class="no-conflict-notice">
        <i class="bi bi-check-circle-fill text-success mr-2"></i>
        ข้อมูลส่วนหัวของทุกใบตรงกัน ไม่มีข้อมูลขัดแย้ง
      </div>

      <!-- Merged Items Preview -->
      <div class="items-section">
        <div class="items-header">
          <strong>รายการสินค้าที่จะรวม</strong>
          <span class="badge badge-info ml-2">{{ mergedItems.length }} รายการ</span>
        </div>

        <div class="items-table-wrapper">
          <table class="table table-sm table-bordered items-table">
            <thead>
              <tr>
                <th>จาก Quotation</th>
                <th>Stock No.</th>
                <th>ชื่อสินค้า</th>
                <th class="text-right">Qty</th>
                <th class="text-right">ราคาประเมิน</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in mergedItems" :key="idx">
                <td>
                  <span class="badge badge-secondary">{{ item._fromQuotation }}</span>
                </td>
                <td>{{ item.stockNumber || item.stockNumberOrigin || '-' }}</td>
                <td>{{ item.productName || item.description || item.name || '-' }}</td>
                <td class="text-right">{{ item.qty || 1 }}</td>
                <td class="text-right">{{ formatPrice(item.appraisalPrice || 0) }}</td>
              </tr>
              <tr v-if="mergedItems.length === 0">
                <td colspan="5" class="text-center text-muted">ไม่มีรายการสินค้า</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer-actions">
        <button class="btn btn-sm btn-outline-main mr-2" @click="$emit('close')">
          ยกเลิก
        </button>
        <button
          class="btn btn-sm btn-main"
          @click="onConfirm"
          :disabled="!isResolved || mergedItems.length === 0"
        >
          <i class="bi bi-diagram-2 mr-1"></i>
          ยืนยันการรวม ({{ mergedItems.length }} รายการ)
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog'
import dayjs from 'dayjs'
import { formatISOString } from '@/services/utils/dayjs.js'
import { success } from '@/services/alert/sweetAlerts.js'
import { usrQuotationApiStore } from '@/stores/modules/api/sale/quotation-store.js'

const HEADER_FIELDS = [
  { key: 'customerName',    label: 'ชื่อลูกค้า',        type: 'string' },
  { key: 'customerAddress', label: 'ที่อยู่',             type: 'string' },
  { key: 'customerPhone',   label: 'เบอร์โทร',           type: 'string' },
  { key: 'customerEmail',   label: 'อีเมล',              type: 'string' },
  { key: 'currency',        label: 'สกุลเงิน',           type: 'string' },
  { key: 'currencyRate',    label: 'อัตราแลกเปลี่ยน',    type: 'number' },
  { key: 'markUp',          label: 'Markup (%)',         type: 'number' },
  { key: 'discount',        label: 'ส่วนลด (%)',         type: 'number' },
  { key: 'freight',         label: 'ค่าขนส่ง',           type: 'number' },
  { key: 'remark',          label: 'หมายเหตุ',           type: 'string' },
  { key: 'date',            label: 'วันที่ใบเสนอราคา',   type: 'date'   },
  { key: 'specialDiscount', label: 'Special Discount',  type: 'number' },
  { key: 'specialAddition', label: 'Special Addition',  type: 'number' },
  { key: 'vat',             label: 'VAT (%)',            type: 'number' },
  { key: 'goldPerOz',       label: 'Gold Per Oz',        type: 'number' }
]

export default {
  name: 'MergeQuotationModal',

  components: {
    Dialog
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    quotations: {
      type: Array,
      default: () => []
    }
  },

  emits: ['close', 'merge-done'],

  setup() {
    const quotationStore = usrQuotationApiStore()
    return { quotationStore }
  },

  data() {
    return {
      resolved: {}
    }
  },

  computed: {
    conflicts() {
      if (this.quotations.length < 2) return []

      return HEADER_FIELDS.filter((field) => {
        const values = this.quotations.map((q) => q[field.key] ?? null)
        const normalized = values.map((v) =>
          field.type === 'number' ? String(Number(v || 0)) : String(v ?? '')
        )
        return new Set(normalized).size > 1
      }).map((field) => ({
        ...field,
        options: this.quotations.map((q) => ({
          quotationNumber: q.number,
          value: q[field.key]
        }))
      }))
    },

    mergedItems() {
      return this.quotations.flatMap((q) => {
        const items = q.data ? JSON.parse(q.data) : []
        return items.map((item) => ({
          ...item,
          _fromQuotation: q.number,
          id: null
        }))
      })
    },

    isResolved() {
      return this.conflicts.every((c) => this.resolved[c.key] !== undefined)
    }
  },

  watch: {
    isShow(val) {
      if (val) this.resolved = {}
    }
  },

  methods: {
    async onConfirm() {
      // Resolve header values — use radio selection for conflicts, first quotation for non-conflicts
      const merged = {}
      HEADER_FIELDS.forEach((field) => {
        const conflict = this.conflicts.find((c) => c.key === field.key)
        merged[field.key] = conflict
          ? this.resolved[field.key]
          : (this.quotations[0]?.[field.key] ?? null)
      })

      // Generate new quotation number (same pattern as generateQuotationNumber in quotation-view)
      const now = dayjs()
      const newNumber = `QT-${now.format('YYYYMMDD')}-${now.format('HHmmss')}`

      // Clean items — remove _fromQuotation helper field, keep id: null
      const items = this.mergedItems.map(({ _fromQuotation, ...rest }) => rest)

      const formValue = {
        number:          newNumber,
        customerName:    merged.customerName    || '',
        customerAddress: merged.customerAddress || '',
        customerPhone:   merged.customerPhone   || '',
        customerEmail:   merged.customerEmail   || '',
        currency:        merged.currency        || '',
        currencyRate:    Number(merged.currencyRate    || 1),
        markup:          Number(merged.markUp          || 0),
        discount:        Number(merged.discount        || 0),
        freight:         Number(merged.freight         || 0),
        date:            merged.date
          ? formatISOString(new Date(merged.date))
          : formatISOString(new Date()),
        remark:          merged.remark          || '',
        specialDiscount: Number(merged.specialDiscount || 0),
        specialAddition: Number(merged.specialAddition || 0),
        vat:             Number(merged.vat             || 0),
        goldPerOz:       Number(merged.goldPerOz       || 0),
        data:            JSON.stringify(items)
      }

      const res = await this.quotationStore.fetchSave({ formValue })
      if (res) {
        success('รวม Quotation สำเร็จ', `เลขที่ใหม่: ${newNumber}`)
        this.$emit('merge-done', newNumber)
      }
    },

    formatFieldValue(value, type) {
      if (value === null || value === undefined || value === '') return '(ว่าง)'
      if (type === 'number') return Number(value).toLocaleString('th-TH')
      if (type === 'date') {
        const d = new Date(value)
        return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('th-TH')
      }
      return String(value)
    },

    formatPrice(value) {
      return Number(value || 0).toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.merge-modal-body {
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 4px;
}

// Conflict section
.conflict-section {
  margin-bottom: 20px;

  .conflict-header {
    font-size: 14px;
    padding: 8px 12px;
    background: #fdf2f2;
    border-left: 3px solid var(--base-font-color);
    border-radius: 4px;
    margin-bottom: 12px;
    color: var(--base-font-color);
  }

  .conflict-field {
    border: 1px solid #e8d0d0;
    border-radius: 4px;
    padding: 10px 14px;
    margin-bottom: 10px;

    .conflict-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--base-font-color);
      margin-bottom: 8px;
    }

    .conflict-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .conflict-option {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      cursor: pointer;
      transition: border-color 0.15s;

      &:has(.conflict-radio:checked) {
        border-color: var(--base-font-color);
        background: #fdf2f2;
      }

      .conflict-radio {
        cursor: pointer;
        margin: 0;
        accent-color: var(--base-font-color);
      }

      .conflict-option-label {
        margin: 0;
        cursor: pointer;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}

// No conflict
.no-conflict-notice {
  padding: 10px 14px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 16px;
  color: #155724;
}

// Items section
.items-section {
  .items-header {
    font-size: 14px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
  }

  .items-table-wrapper {
    max-height: 260px;
    overflow-y: auto;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  }

  .items-table {
    margin: 0;
    font-size: 13px;

    thead th {
      position: sticky;
      top: 0;
      background: var(--base-font-color);
      color: white;
      font-weight: normal;
      padding: 6px 10px;
      border-color: var(--base-font-color);
      z-index: 1;
    }

    tbody td {
      padding: 4px 10px;
      vertical-align: middle;
    }
  }
}

// Footer
.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

// Badge
.badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;

  &-secondary {
    background-color: #6c757d;
    color: white;
  }

  &-info {
    background-color: var(--base-green);
    color: white;
  }
}
</style>
