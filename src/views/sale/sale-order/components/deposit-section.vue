<template>
  <SectionCardGeneric
    headerStyle="legend"
    accent="main"
    icon="bi-piggy-bank"
    :title="$t('view.sale.soDeposit.sectionTitle')"
  >
    <div class="deposit-zone">
      <div class="deposit-left">
        <div class="deposit-history">
          <div class="deposit-history-header">
            <ButtonGeneric
              v-if="canManageDeposit"
              variant="green"
              icon="bi-cash-coin"
              :label="$t('view.sale.soDeposit.receiveBtn')"
              @click="onOpenReceiveModal"
            />
            <CheckboxGeneric
              v-if="hasDeletedDeposits"
              v-model="showDeleted"
              :label="$t('view.sale.soDeposit.showDeletedToggle')"
            />
          </div>

          <div v-if="visibleDeposits.length === 0" class="text-center text-muted py-4">
            <i class="bi bi-inbox" style="font-size: 2rem"></i>
            <p class="mb-0 mt-2">{{ $t('view.sale.soDeposit.emptyList') }}</p>
          </div>

          <div v-else class="history-list">
            <div
              v-for="deposit in visibleDeposits"
              :key="deposit.running"
              class="history-row"
              :class="{ 'is-deleted': deposit.isDelete }"
            >
              <imagePreview
                v-if="deposit.imagePath"
                class="history-thumb"
                :imageName="deposit.imagePath"
                path="Images/Deposit"
                type="PATH"
                :width="40"
                :height="40"
                :emitImage="true"
              />
              <div class="history-info">
                <div class="history-line">
                  <span class="history-date">{{ formatDate(deposit.depositDate) }}</span>
                  <span class="history-amount">{{ formatAmount(deposit.amount) }} {{ deposit.currencyUnit || currencyUnit }}</span>
                  <span class="history-method">{{ deposit.paymentName }}</span>
                  <span v-if="deposit.isDelete" class="deleted-badge">{{ $t('view.sale.soDeposit.deletedBadge') }}</span>
                </div>
                <div class="history-line history-line--sub">
                  {{ deposit.createBy }} · {{ formatDateTime(deposit.createDate) }}
                </div>
                <div v-if="secondaryLine(deposit)" class="history-line history-line--secondary">
                  {{ secondaryLine(deposit) }}
                </div>
                <div v-if="deposit.isDelete && deposit.deleteReason" class="history-line history-line--secondary">
                  {{ $t('view.sale.soDeposit.deletedReasonPrefix') }}: {{ deposit.deleteReason }}
                </div>
                <div v-if="!deposit.isDelete" class="history-line history-line--applied">
                  {{ $t('view.sale.soDeposit.colApplied') }}: {{ formatAmount(deposit.appliedAmount) }} ·
                  {{ $t('view.sale.soDeposit.colRemaining') }}: {{ formatAmount(deposit.remainingAmount) }}
                  <template v-if="appliedInvoiceLine(deposit)"> · {{ appliedInvoiceLine(deposit) }}</template>
                </div>
              </div>
              <div v-if="!deposit.isDelete" class="history-actions">
                <ButtonGeneric
                  variant="outline"
                  icon="bi-printer"
                  :title="$t('view.sale.soDeposit.printReceiptBtn')"
                  @click="onPrintReceipt(deposit)"
                />
                <ButtonGeneric
                  v-if="canManageDeposit && !isDepositApplied(deposit)"
                  variant="red"
                  icon="bi-trash"
                  :title="$t('view.sale.soDeposit.deleteBtn')"
                  @click="onDeleteDeposit(deposit)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="deposit-money-box">
        <div class="money-big">
          <span class="money-big-label">{{ $t('view.sale.soDeposit.totalReceived') }}</span>
          <span class="money-big-value">{{ formatAmount(summary.totalReceived) }} {{ currencyUnit }}</span>
        </div>
        <div class="money-divider"></div>
        <div class="money-row">
          <span>{{ $t('view.sale.soDeposit.totalApplied') }}</span>
          <span>{{ formatAmount(summary.totalApplied) }}</span>
        </div>
        <div class="money-row money-row--balance">
          <span>{{ $t('view.sale.soDeposit.balance') }}</span>
          <span>{{ formatAmount(summary.balance) }}</span>
        </div>
        <div class="deposit-percent">
          {{ $t('view.sale.soDeposit.percentOfTotal', { percent: depositPercentText }) }}
        </div>
      </div>
    </div>

    <DepositRecordModal
      :isShowModal="isShow.depositModal"
      :soNumber="soNumber"
      :grandTotalRounded="grandTotalRounded"
      :currencyUnit="currencyUnit"
      @close-modal="isShow.depositModal = false"
      @save-deposit="onSaveDeposit"
    />

    <DeleteDepositReasonModal
      :isShowModal="isShow.deleteReasonModal"
      @close-modal="isShow.deleteReasonModal = false"
      @confirm="onConfirmDeleteReason"
    />
  </SectionCardGeneric>
</template>

<script>
import dayjs from 'dayjs'
import { usrSaleOrderDepositApiStore } from '@/stores/modules/api/sale/sale-order-deposit-store.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { PERMISSIONS } from '@/services/permission/config.js'
import { success } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { formatDocCurrency } from '@/services/utils/decimal.js'
import { DepositReceiptPdfBuilder } from '@/services/helper/pdf/sale-order/deposit-receipt-pdf-builder.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'
import DepositRecordModal from '../modal/deposit-record-modal.vue'
import DeleteDepositReasonModal from '../modal/delete-deposit-reason-modal.vue'

export default {
  name: 'DepositSection',

  components: {
    SectionCardGeneric,
    ButtonGeneric,
    CheckboxGeneric,
    imagePreview,
    DepositRecordModal,
    DeleteDepositReasonModal
  },

  props: {
    soNumber: {
      type: String,
      default: ''
    },
    currencyUnit: {
      type: String,
      default: 'THB'
    },
    // grandTotalRounded ของใบสั่งขาย (Phase 2 — รวม copy line แล้ว) — ใช้คิด % มัดจำ + ส่งต่อให้ modal รับมัดจำ
    grandTotalRounded: {
      type: Number,
      default: 0
    },
    customerName: {
      type: String,
      default: ''
    },
    customerAddress: {
      type: String,
      default: ''
    },
    customerPhone: {
      type: String,
      default: ''
    }
  },

  setup() {
    const depositStore = usrSaleOrderDepositApiStore()
    const authStore = useAuthStore()
    return { depositStore, authStore }
  },

  data() {
    return {
      summary: { totalReceived: 0, totalApplied: 0, balance: 0 },
      deposits: [],
      showDeleted: false,
      isShow: {
        depositModal: false,
        deleteReasonModal: false
      },
      pendingDeleteDeposit: null
    }
  },

  computed: {
    permissionService() {
      return new PermissionService(this.authStore.getUser, this.authStore.permissions)
    },

    canManageDeposit() {
      return this.permissionService.hasPermission(PERMISSIONS.SALE_DEPOSIT)
    },

    visibleDeposits() {
      return this.showDeleted ? this.deposits : this.deposits.filter((d) => !d.isDelete)
    },

    hasDeletedDeposits() {
      return this.deposits.some((d) => d.isDelete)
    },

    depositPercentText() {
      if (!this.grandTotalRounded || this.grandTotalRounded <= 0) return '0'
      const percent = (this.summary.totalReceived / this.grandTotalRounded) * 100
      return percent.toFixed(1)
    }
  },

  watch: {
    soNumber: {
      handler(newVal) {
        if (newVal) this.fetchList()
      },
      immediate: true
    }
  },

  methods: {
    async fetchList() {
      if (!this.soNumber) return
      const res = await this.depositStore.fetchList({ soNumber: this.soNumber })
      this.summary = {
        totalReceived: res?.totalReceived || 0,
        totalApplied: res?.totalApplied || 0,
        balance: res?.balance || 0
      }
      this.deposits = Array.isArray(res?.deposits) ? res.deposits : []
    },

    // เรียกจาก parent (sale-order-view.vue) ผ่าน $refs หลังสร้าง invoice สำเร็จ — มัดจำอาจถูกหักไปแล้ว
    reloadDeposits() {
      return this.fetchList()
    },

    isDepositApplied(deposit) {
      return Number(deposit.remainingAmount) < Number(deposit.amount)
    },

    formatAmount(value) {
      return formatDocCurrency(value, this.currencyUnit, 'en-US')
    },

    formatDate(date) {
      return date ? dayjs(date).format('DD/MM/YYYY') : '-'
    },

    formatDateTime(date) {
      return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'
    },

    secondaryLine(deposit) {
      return [deposit.bankCode, deposit.bankBranch, deposit.referenceNumber, deposit.remark]
        .filter(Boolean)
        .join(' · ')
    },

    appliedInvoiceLine(deposit) {
      const applies = Array.isArray(deposit.applies) ? deposit.applies.filter((a) => !a.isDelete) : []
      if (!applies.length) return ''
      return `${this.$t('view.sale.soDeposit.colAppliedInvoices')}: ${applies.map((a) => a.invoiceRunning).join(', ')}`
    },

    onOpenReceiveModal() {
      this.isShow.depositModal = true
    },

    async onSaveDeposit(formData) {
      const response = await this.depositStore.fetchCreate(formData)
      if (response) {
        this.isShow.depositModal = false
        success(this.$t('view.sale.soDeposit.success.create'))
        await this.fetchList()
      }
    },

    onDeleteDeposit(deposit) {
      this.pendingDeleteDeposit = deposit
      this.isShow.deleteReasonModal = true
    },

    onConfirmDeleteReason(reason) {
      const deposit = this.pendingDeleteDeposit
      if (!deposit) return

      confirmThenSubmit(
        this.$t('view.sale.soDeposit.confirm.deleteMessage', {
          amount: this.formatAmount(deposit.amount),
          currency: deposit.currencyUnit || this.currencyUnit,
          date: this.formatDate(deposit.depositDate)
        }),
        this.$t('view.sale.soDeposit.confirm.deleteTitle'),
        async () => {
          const response = await this.depositStore.fetchDelete({ running: deposit.running, deleteReason: reason })
          if (response) {
            this.isShow.deleteReasonModal = false
            this.pendingDeleteDeposit = null
            success(this.$t('view.sale.soDeposit.success.delete'))
            await this.fetchList()
          }
        },
        { confirmText: this.$t('common.btn.confirm'), cancelText: this.$t('common.btn.cancel') },
        'warning'
      )
    },

    async onPrintReceipt(deposit) {
      const builder = new DepositReceiptPdfBuilder({
        running: deposit.running,
        depositDate: deposit.depositDate,
        soNumber: this.soNumber,
        customerName: this.customerName,
        customerAddress: this.customerAddress,
        customerTel: this.customerPhone,
        amount: deposit.amount,
        currencyUnit: deposit.currencyUnit || this.currencyUnit,
        payment: deposit.payment,
        paymentName: deposit.paymentName,
        bankCode: deposit.bankCode,
        bankBranch: deposit.bankBranch,
        referenceNumber: deposit.referenceNumber,
        remark: deposit.remark,
        grandTotal: this.grandTotalRounded,
        totalReceived: this.summary.totalReceived,
        balance: this.summary.balance
      })
      await builder.preparePDF()
      builder.generatePDF().open()
    }
  }
}
</script>

<style lang="scss" scoped>
.deposit-zone {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-lg);
  flex-wrap: wrap;
}

.deposit-left {
  flex: 1;
  min-width: 0;
}

.deposit-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-sm);
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-row {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-md);
  padding: var(--sp-md);
  border-bottom: 1px solid var(--color-border);
  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--color-highlight-bg);
  }

  &.is-deleted {
    opacity: 0.55;
  }
}

.history-thumb {
  flex-shrink: 0;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-line {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-md);
  font-size: var(--fs-base);
}

.history-amount {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.history-line--sub,
.history-line--secondary,
.history-line--applied {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.deleted-badge {
  color: var(--base-red);
  font-weight: 600;
  font-size: var(--fs-sm);
}

.history-actions {
  display: flex;
  gap: var(--sp-xs);
  flex-shrink: 0;
}

.deposit-money-box {
  flex: 0 0 320px;
  min-width: 0;
  background: var(--color-green-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
}

@media (max-width: 1024px) {
  .deposit-money-box {
    flex: 1 1 100%;
  }
}

.money-big {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  margin-bottom: var(--sp-md);
}

.money-big-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.money-big-value {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--base-font-color);
  font-variant-numeric: tabular-nums;
}

.money-divider {
  border-top: 1px solid var(--color-border);
  margin-bottom: var(--sp-md);
}

.money-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--sp-xs);
  font-variant-numeric: tabular-nums;

  span:first-child {
    font-size: var(--fs-sm);
    color: var(--base-sub-color);
  }

  span:last-child {
    font-size: var(--fs-base);
    font-weight: 600;
    color: var(--base-font-color);
  }

  &--balance {
    margin-bottom: 0;
  }
}

.deposit-percent {
  margin-top: var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  text-align: right;
}
</style>
