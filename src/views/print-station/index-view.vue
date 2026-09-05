<template>
  <div class="print-station-view">
    <DashboardHeaderGeneric
      :title="$t('view.printStation.pageTitle')"
      :subtitle="$t('view.printStation.pageSubtitle')"
      icon="bi-printer-fill"
      :showRefresh="false"
    >
      <template #controls>
        <div class="ps-header-controls">
          <span class="ps-bridge-status" :class="bridgeConnected ? 'is-online' : 'is-offline'">
            <i class="bi bi-circle-fill"></i>
            {{
              bridgeConnected
                ? $t('view.printStation.bridgeConnected')
                : $t('view.printStation.bridgeDisconnected')
            }}
          </span>
          <ButtonGeneric
            variant="main"
            icon="bi-clock-history"
            :label="$t('view.printStation.historyBtn')"
            :title="$t('view.printStation.historyBtn')"
            @click="isShowHistory = true"
          />
        </div>
      </template>
    </DashboardHeaderGeneric>

    <div v-if="!bridgeConnected" class="ps-bridge-hint">
      <i class="bi bi-exclamation-triangle-fill"></i>
      {{ $t('view.printStation.bridgeHintMsg') }}
    </div>

    <SectionCardGeneric class="ps-settings-card">
      <FormFieldGeneric :label="$t('view.printStation.printerLabel')">
        <!-- DropdownGeneric and CheckboxGeneric are direct flex siblings here, so
             `align-items: center` (below) centers the checkbox against the dropdown's
             real rendered height — no guessed px needed. -->
        <div class="ps-settings-controls-row responsive-flex-row">
          <div class="ps-printer-field">
            <DropdownGeneric
              :modelValue="selectedPrinter"
              :options="printerOptions"
              optionLabel="label"
              optionValue="value"
              :ariaLabel="$t('view.printStation.printerLabel')"
              :placeholder="$t('view.printStation.printerPlaceholder')"
              @update:modelValue="onPrinterChange"
            />
          </div>
          <CheckboxGeneric
            :modelValue="autoPrint"
            :label="$t('view.printStation.autoPrintLabel')"
            @update:modelValue="onAutoPrintChange"
          />
          <CheckboxGeneric
            :modelValue="logoPrint"
            :label="$t('view.printStation.logoPrintLabel')"
            @update:modelValue="onLogoPrintChange"
          />
        </div>
      </FormFieldGeneric>
    </SectionCardGeneric>

    <SectionCardGeneric
      :title="$t('view.printStation.queueTitle', { count: total })"
      icon="bi-list-check"
      accent="main"
      headerStyle="legend"
    >
      <div class="responsive-table-wrapper">
        <BaseDataTable
          :items="jobs"
          :totalRecords="total"
          :columns="columns"
          :perPage="take"
          dataKey="id"
          :emptyMessage="$t('view.printStation.emptyQueueMsg')"
          @page="handlePageChange"
          @sort="handleSortChange"
        >
          <template #createDateTemplate="{ data }">
            <div>{{ formatTime(data.createDate) }}</div>
          </template>

          <template #statusTemplate="{ data }">
            <span
              class="ps-status-badge"
              :class="statusClass(data.status)"
              :title="data.errorMessage || ''"
            >
              <i :class="['bi', statusIcon(data.status)]"></i>
              {{ statusLabel(data.status) }}
            </span>
          </template>

          <template #actionTemplate="{ data }">
            <div class="btn-action-container">
              <ButtonGeneric
                v-if="data.status === 'PENDING'"
                variant="green"
                icon="bi-printer"
                :title="$t('view.printStation.printNowBtn')"
                :loading="isClaiming"
                :disabled="isClaiming"
                @click="onManualPrint"
              />
              <ButtonGeneric
                v-else
                variant="dark"
                icon="bi-arrow-repeat"
                :title="retryButtonLabel(data.status)"
                :loading="retryingId === data.id"
                :disabled="retryingId === data.id"
                @click="onRetry(data)"
              />
              <ButtonGeneric
                variant="red"
                icon="bi-trash"
                :title="$t('view.printStation.deleteBtn')"
                :loading="deletingId === data.id"
                :disabled="deletingId === data.id"
                @click="onDelete(data)"
              />
            </div>
          </template>
        </BaseDataTable>
      </div>
    </SectionCardGeneric>

    <PrintHistoryModal :isShow="isShowHistory" @closeModal="isShowHistory = false" />
  </div>
</template>

<script>
import { usePrintJobApiStore } from '@/stores/modules/api/print/print-job-store.js'
import { printRaw, printImage, getPrinters, checkBridgeHealth } from '@/services/api/print-bridge-service.js'
import { storage } from '@/services/storage.js'
import { formatOnlyTime, formatISOString } from '@/services/utils/dayjs.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'
import dayjs from 'dayjs'

import DashboardHeaderGeneric from '@/components/generic/DashboardHeaderGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import PrintHistoryModal from './components/print-history-modal.vue'

// localStorage key ต่อเครื่อง — ค่าตั้ง (auto-print / เครื่องพิมพ์ที่เลือก / stationId) ต้องคงที่ต่อเครื่อง ไม่ใช่ต่อผู้ใช้
const STATION_ID_STORAGE_KEY = 'print-station-id'
const AUTO_PRINT_STORAGE_KEY = 'print-station-auto-print'
const PRINTER_STORAGE_KEY = 'print-station-printer'
const LOGO_PRINT_STORAGE_KEY = 'print-station-logo-print'

const POLL_INTERVAL_MS = 2000
const HEALTH_CHECK_INTERVAL_MS = 2000

const STATUS_META = {
  PENDING: { icon: 'bi-hourglass-split', className: 'is-pending' },
  PRINTING: { icon: 'bi-arrow-repeat', className: 'is-printing' },
  PRINTED: { icon: 'bi-check-circle-fill', className: 'is-printed' },
  FAILED: { icon: 'bi-x-circle-fill', className: 'is-failed' }
}

export default {
  name: 'PrintStationIndexView',

  components: {
    DashboardHeaderGeneric,
    SectionCardGeneric,
    FormFieldGeneric,
    ButtonGeneric,
    DropdownGeneric,
    CheckboxGeneric,
    BaseDataTable,
    PrintHistoryModal
  },

  mixins: [dataTablePaging],

  setup() {
    const printJobStore = usePrintJobApiStore()
    return { printJobStore }
  },

  data() {
    return {
      jobs: [],
      total: 0,
      stationId: '',
      selectedPrinter: '',
      printerOptions: [],
      autoPrint: false,
      logoPrint: false,
      bridgeConnected: false,
      isClaiming: false,
      retryingId: null,
      deletingId: null,
      isShowHistory: false,
      pollTimerId: null,
      healthTimerId: null,
      wakeLockSentinel: null
    }
  },

  computed: {
    columns() {
      return [
        {
          field: 'action',
          header: this.$t('common.field.action'),
          width: '100px',
          minWidth: '100px',
          align: 'center',
          sortable: false
        },
        {
          field: 'invoiceNumber',
          header: this.$t('view.printStation.colInvoice'),
          width: '30%',
          minWidth: '160px'
        },
        {
          field: 'createBy',
          header: this.$t('view.printStation.colCreateBy'),
          width: '25%',
          minWidth: '120px'
        },
        {
          field: 'createDate',
          header: this.$t('view.printStation.colTime'),
          width: '15%',
          minWidth: '90px'
        },
        {
          field: 'status',
          header: this.$t('common.field.status'),
          width: '20%',
          minWidth: '130px',
          sortable: false
        }
      ]
    }
  },

  mounted() {
    this.initStationId()
    this.autoPrint = storage.getItem(AUTO_PRINT_STORAGE_KEY, 'false') === 'true'
    this.selectedPrinter = storage.getItem(PRINTER_STORAGE_KEY, '')
    this.logoPrint = storage.getItem(LOGO_PRINT_STORAGE_KEY, 'false') === 'true'

    this.loadPrinters()
    this.fetchData()
    this.checkHealth()

    this.pollTimerId = setInterval(this.pollTick, POLL_INTERVAL_MS)
    this.healthTimerId = setInterval(this.checkHealth, HEALTH_CHECK_INTERVAL_MS)

    this.requestWakeLock()
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  },

  beforeUnmount() {
    if (this.pollTimerId) clearInterval(this.pollTimerId)
    if (this.healthTimerId) clearInterval(this.healthTimerId)
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    this.releaseWakeLock()
  },

  methods: {
    initStationId() {
      let id = storage.getItem(STATION_ID_STORAGE_KEY, null)
      if (!id) {
        id = crypto.randomUUID()
        storage.setItem(STATION_ID_STORAGE_KEY, id)
      }
      this.stationId = id
    },

    // list-only — ห้ามมี claim ปนในนี้ (ตาม mixin ต้องมี fetchData() เอง — เรียกจาก page/sort change และ poll tick)
    async fetchData() {
      const start = dayjs().startOf('day').toDate()
      const end = dayjs().endOf('day').toDate()
      const res = await this.printJobStore.fetchList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        search: {
          dateFrom: start ? formatISOString(start) : null,
          dateTo: end ? formatISOString(end) : null
        },
        skipLoading: true,
        skipError: true
      })
      if (res) {
        this.jobs = res.data || []
        this.total = res.total || 0
      }
    },

    // poll ทุก 2 วิ — list ก่อนเสมอ แล้วค่อยพิจารณา claim เฉพาะตอน auto-print เปิดเท่านั้น
    async pollTick() {
      await this.fetchData()
      if (this.autoPrint && !this.isClaiming) {
        const hasPending = this.jobs.some((job) => job.status === 'PENDING')
        if (hasPending) {
          await this.claimAndPrint()
        }
      }
    },

    async checkHealth() {
      this.bridgeConnected = await checkBridgeHealth()
    },

    async loadPrinters() {
      try {
        const printers = await getPrinters()
        this.printerOptions = (printers || []).map((name) => ({ label: name, value: name }))
        if (!this.selectedPrinter && printers?.length) {
          this.onPrinterChange(printers[0])
        }
      } catch (err) {
        console.error('Failed to load printers from bridge:', err)
        this.printerOptions = []
      }
    },

    onPrinterChange(value) {
      this.selectedPrinter = value
      storage.setItem(PRINTER_STORAGE_KEY, value)
    },

    onAutoPrintChange(value) {
      this.autoPrint = value
      storage.setItem(AUTO_PRINT_STORAGE_KEY, value)
    },

    onLogoPrintChange(value) {
      this.logoPrint = value
      storage.setItem(LOGO_PRINT_STORAGE_KEY, value)
    },

    // guard เดียวกันนี้คุมทั้ง auto-print (poll tick) และปุ่มพิมพ์เอง — กัน claim ซ้อนกัน
    async claimAndPrint() {
      if (this.isClaiming) return
      this.isClaiming = true
      try {
        const claimed = await this.printJobStore.fetchClaim({ stationId: this.stationId })
        if (claimed?.id) {
          const outcome = await this.executePrint(claimed)
          await this.printJobStore.fetchAck({
            id: claimed.id,
            success: outcome.success,
            errorMessage: outcome.errorMessage
          })
        }
      } finally {
        this.isClaiming = false
      }
    },

    // printRaw/printImage เป็น fetch ตรง ไม่ผ่าน axios — ต้อง catch เอง (จุดที่ได้รับอนุญาตให้ try-catch)
    // logoPrint เปิด = โหมดภาพ (CPCL, มีโลโก้) · ปิด = โหมดข้อความเดิม
    // ห้าม fallback จากโหมดภาพไปโหมดข้อความเงียบ ๆ — ผู้ใช้ต้องรู้ว่าได้ใบไม่มีโลโก้
    async executePrint(job) {
      const printerName = this.selectedPrinter || undefined
      try {
        if (this.logoPrint) {
          await printImage({ printerName, text: job.payload, logo: true })
        } else {
          await printRaw({ printerName, text: job.payload })
        }
        return { success: true, errorMessage: null }
      } catch (err) {
        const fallbackMsg = this.logoPrint
          ? this.$t('view.printStation.printImageFailedGeneric')
          : this.$t('view.printStation.printFailedGeneric')
        return { success: false, errorMessage: err?.message || fallbackMsg }
      }
    },

    onManualPrint() {
      this.claimAndPrint()
    },

    async onRetry(job) {
      this.retryingId = job.id
      try {
        await this.printJobStore.fetchRetry({ id: job.id })
      } finally {
        this.retryingId = null
      }
    },

    retryButtonLabel(status) {
      return status === 'PRINTED'
        ? this.$t('view.printStation.reprintBtn')
        : this.$t('view.printStation.retryBtn')
    },

    onDelete(job) {
      confirmThenSubmit(
        `${job.invoiceNumber} — ${this.formatTime(job.createDate)}`,
        this.$t('view.printStation.confirmDeleteTitle'),
        async () => {
          this.deletingId = job.id
          try {
            await this.printJobStore.fetchDelete({ id: job.id })
            success(this.$t('view.printStation.deleteSuccessMsg'))
            await this.fetchData()
          } finally {
            this.deletingId = null
          }
        }
      )
    },

    statusLabel(status) {
      const map = {
        PENDING: this.$t('view.printStation.statusPending'),
        PRINTING: this.$t('view.printStation.statusPrinting'),
        PRINTED: this.$t('view.printStation.statusPrinted'),
        FAILED: this.$t('view.printStation.statusFailed')
      }
      return map[status] || status
    },

    statusIcon(status) {
      return STATUS_META[status]?.icon || 'bi-question-circle'
    },

    statusClass(status) {
      return STATUS_META[status]?.className || ''
    },

    formatTime(date) {
      return date ? formatOnlyTime(date) : '-'
    },

    async requestWakeLock() {
      if (!('wakeLock' in navigator)) return
      try {
        this.wakeLockSentinel = await navigator.wakeLock.request('screen')
      } catch (err) {
        console.error('Wake Lock request failed:', err)
      }
    },

    releaseWakeLock() {
      if (this.wakeLockSentinel) {
        this.wakeLockSentinel.release()
        this.wakeLockSentinel = null
      }
    },

    handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        this.requestWakeLock()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.print-station-view {
  padding: var(--sp-xl);
}

.ps-header-controls {
  display: flex;
  align-items: center;
  gap: var(--sp-lg);
  flex-wrap: wrap;
}

.ps-bridge-status {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  font-size: var(--fs-base);
  font-weight: 600;

  i {
    font-size: 10px;
  }

  &.is-online {
    color: var(--base-green);
  }

  &.is-offline {
    color: var(--base-red);
  }
}

.ps-bridge-hint {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-md) var(--sp-lg);
  margin-bottom: var(--sp-lg);
  background: var(--status-cancelled-bg);
  color: var(--base-red);
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  font-weight: 600;
}

.ps-settings-card {
  margin-bottom: var(--sp-lg);
}

// Dropdown and checkbox are direct flex siblings here, so the browser centers the
// (shorter) checkbox against the (taller) dropdown's real rendered height on its own.
.ps-settings-controls-row {
  align-items: center;
}

.ps-printer-field {
  max-width: 280px;
  min-width: 220px;
  flex: 1;
}

.ps-status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;

  &.is-pending {
    background: var(--status-open-bg);
    color: var(--status-open);
  }

  &.is-printing {
    background: var(--status-progress-bg);
    color: var(--status-progress);
  }

  &.is-printed {
    background: var(--status-resolved-bg);
    color: var(--status-resolved);
  }

  &.is-failed {
    background: var(--status-cancelled-bg);
    color: var(--status-cancelled);
  }
}
</style>
