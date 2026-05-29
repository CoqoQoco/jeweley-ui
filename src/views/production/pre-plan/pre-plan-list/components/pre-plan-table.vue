<template>
  <BaseDataTable
    :items="store.prePlanList"
    :totalRecords="store.prePlanTotal"
    :columns="columns"
    :perPage="take"
    :expandable="true"
    dataKey="id"
    @page="handlePageChange"
    @sort="handleSortChange"
  >
    <template #actionTemplate="{ data }">
      <div class="btn-action-container">
        <button class="btn btn-sm btn-green ml-1" @click="onView(data)" title="ดูรายละเอียด">
          <i class="bi bi-eye"></i>
        </button>
        <button
          class="btn btn-sm btn-green ml-1"
          @click="onPrintPdf(data)"
          title="พิมพ์ใบสั่งผลิต"
        >
          <i class="bi bi-printer"></i>
        </button>
        <button
          v-if="isEditableStatus(data.status)"
          class="btn btn-sm btn-main ml-1"
          @click="onEdit(data)"
          title="แก้ไข"
        >
        <i class="bi bi-pencil"></i>
      </button>
        <button
          v-if="data.status === 'Submitted'"
          class="btn btn-sm btn-main ml-1"
          @click="onApprove(data)"
          title="อนุมัติ"
        >
          <i class="bi bi-check-lg"></i> อนุมัติ
        </button>
        <button
          v-if="data.status === 'Approved' && data.approvedDocumentPath"
          class="btn btn-sm btn-green ml-1"
          @click="onViewApprovedDoc(data)"
          title="ดูเอกสารอนุมัติ"
        >
          <i class="bi bi-file-earmark-text"></i>
        </button>
      </div>
    </template>

    <template #jobTypeTemplate="{ data }">
      <span>{{ getDesc(masterStore.jobTypes, data.jobType) }}</span>
    </template>

    <template #jobLocationTemplate="{ data }">
      <span>{{ getDesc(masterStore.jobLocations, data.jobLocation) }}</span>
    </template>

    <template #goldTypeTemplate="{ data }">
      <span>{{ getDesc(masterStore.goldSizes, data.goldType) }}</span>
    </template>

    <template #statusTemplate="{ data }">
      <div :class="getPrePlanStatusClass(data.status)">{{ getPrePlanStatusLabel(data.status, masterStore.statuses) }}</div>
    </template>

    <template #itemCountTemplate="{ data }">
      <span>{{ data.itemCount }} รายการ</span>
    </template>

    <template #primaryMoldCodeTemplate="{ data }">
      <span v-if="data.itemCount > 1">{{ data.primaryMoldCode }} +{{ data.itemCount - 1 }}</span>
      <span v-else>{{ data.primaryMoldCode }}</span>
    </template>

    <template #linkedProgressTemplate="{ data }">
      <div :class="getLinkedProgressClass(data.linkedItemCount, data.itemCount)">
        {{ data.linkedItemCount || 0 }}/{{ data.itemCount }}
      </div>
    </template>

    <template #expansion="{ data }">
      <div class="p-3">
        <div class="mb-2">
          <span class="title-text">เลขที่ใบสั่ง:</span> {{ data.orderNo || '-' }} ·
          <span class="title-text">ประเภทงาน:</span> {{ getDesc(masterStore.jobTypes, data.jobType) }} ·
          <span class="title-text">วันที่ส่ง:</span> {{ formatDate(data.deliveryDate) }}
        </div>

        <div v-for="item in data.items" :key="item.id" class="item-expand-card mb-2">
          <div class="d-flex align-items-start expand-row">
            <imagePreview :imageName="item.moldCode" type="MOLD" :width="60" :height="60" />
            <div class="flex-grow-1 ml-2">
              <div>
                <strong>{{ item.itemNo }}. {{ item.moldCode }}</strong>
                — {{ getDesc(masterStore.productTypes, item.productType) }}
                ({{ item.productQty }} {{ item.productQtyUnit || '' }})
              </div>
              <ul class="material-list mt-1 mb-1">
                <li v-for="(m, idx) in item.materials" :key="idx">{{ formatMaterialBrief(m) }}</li>
              </ul>

              <div v-if="item.linkedProductionPlanId" class="plan-info">
                <span class="badge bg-success mr-2">สร้างแผนแล้ว</span>
                <span class="title-text">WO:</span> {{ item.woText || `${item.wo}-${item.woNumber}` }}
                <span v-if="item.planStatus" class="ml-2">
                  · <span class="title-text">สถานะแผน:</span> {{ item.planStatus }}
                </span>
              </div>
              <div v-else class="text-muted">
                <i class="bi bi-clock"></i> ยังไม่ได้สร้างแผน
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseDataTable>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import Papa from 'papaparse'
import dayjs from 'dayjs'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { usePrePlanStore } from '@/stores/modules/api/production/pre-plan-store.js'
import { useMasterPrePlanStore } from '@/stores/modules/api/master/master-pre-plan-store.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { getAzureBlobUrl } from '@/config/azure-storage-config.js'
import {
  getPrePlanStatusClass,
  getPrePlanStatusLabel,
  getLinkedProgressClass,
} from '@/services/helper/pre-plan-status.js'
import { isEditableStatus } from '@/constants/pre-plan-status.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { PrePlanOrderFormPdfBuilder } from '@/services/helper/pdf/pre-plan-order-form/pre-plan-order-form-pdf-builder.js'

const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

export default {
  name: 'PrePlanTable',
  components: { BaseDataTable, imagePreview },
  props: {
    modelForm: { type: Object, default: () => ({}) },
    exportTrigger: { type: Number, default: 0 },
  },
  emits: ['total-loaded'],
  setup() {
    const store = usePrePlanStore()
    const masterStore = useMasterPrePlanStore()
    return { store, masterStore }
  },
  data() {
    return {
      take: 10,
      skip: 0,
      sort: [],
      columns: [
        { field: 'action', header: '', minWidthwidth: '150px', sortable: false, align: 'center' },
        { field: 'status', header: 'สถานะ', minWidth: '130px', align: 'center' },
        { field: 'linkedProgress', header: 'สร้างแผน', minWidth: '110px', align: 'center', sortable: false },
        { field: 'orderNo', header: 'เลขที่ใบสั่ง', minWidth: '140px' },
        { field: 'jobType', header: 'ประเภทงาน', minWidth: '130px' },
        { field: 'jobLocation', header: 'สถานที่', minWidth: '120px' },
        { field: 'productionRound', header: 'ครั้งที่', minWidth: '70px', align: 'center' },
        { field: 'goldType', header: 'ประเภททอง', minWidth: '110px' },
        { field: 'itemCount', header: 'จำนวนรายการ', minWidth: '110px', align: 'center', sortable: false },
        { field: 'primaryMoldCode', header: 'แม่พิมพ์หลัก', minWidth: '130px', sortable: false },
        { field: 'orderDate', header: 'วันที่ออก', minWidth: '110px', format: 'date' },
        { field: 'deliveryDate', header: 'วันที่ส่งงาน', minWidth: '110px', format: 'date' },
        { field: 'createBy', header: 'ผู้สร้าง', minWidth: '120px' },
      ],
    }
  },
  watch: {
    async modelForm() {
      this.skip = 0
      await this.fetchData()
    },
    exportTrigger(val) {
      if (val > 0) {
        this.fetchDataExport()
      }
    },
  },
  async created() {
    await Promise.all([this.masterStore.fetchAll(), this.fetchData()])
  },
  methods: {
    async fetchData() {
      await this.store.searchPrePlan({
        moldCode: this.modelForm.moldCode || null,
        status: this.modelForm.status || null,
        orderDateFrom: this.modelForm.orderDateFrom || null,
        orderDateTo: this.modelForm.orderDateTo || null,
        includeCompleted: this.modelForm.includeCompleted ?? false,
        take: this.take,
        skip: this.skip,
        sort: this.sort.length ? this.sort.map((s) => `${s.field} ${s.dir}`).join(',') : null,
      })
      this.$emit('total-loaded', this.store.prePlanTotal)
    },
    async fetchDataExport() {
      await this.store.searchPrePlan({
        moldCode: this.modelForm.moldCode || null,
        status: this.modelForm.status || null,
        orderDateFrom: this.modelForm.orderDateFrom || null,
        orderDateTo: this.modelForm.orderDateTo || null,
        includeCompleted: this.modelForm.includeCompleted ?? false,
        take: 0,
        skip: 0,
        sort: null,
      })

      const data = this.store.prePlanList
      if (!data || data.length === 0) {
        warning('ไม่มีข้อมูลให้ Export')
        return
      }

      const formatDateStr = (val) => (val ? dayjs(val).format('DD/MM/YYYY') : '')

      const dataExcel = data.map((item) => ({
        สถานะ: item.status,
        สร้างแผน: item.linkedProgress,
        เลขที่ใบสั่ง: item.orderNo,
        ประเภทงาน: item.jobType,
        สถานที่: item.jobLocation,
        ครั้งที่: item.productionRound,
        ประเภททอง: item.goldType,
        จำนวนรายการ: item.itemCount,
        แม่พิมพ์หลัก: item.primaryMoldCode,
        วันที่ออก: formatDateStr(item.orderDate),
        วันที่ส่งงาน: formatDateStr(item.deliveryDate),
        ผู้สร้าง: item.createBy,
      }))

      const timestamp = dayjs().format('YYYYMMDD_HHmm')
      this.exportWithCustomColumnCSV(dataExcel, `รายการใบสั่งผลิต_${timestamp}.csv`)

      await this.fetchData()
    },
    exportWithCustomColumnCSV(data, filename) {
      const utf8BOM = '﻿'
      const csv = Papa.unparse(data, {
        quotes: false,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ',',
        header: true,
        newline: '\r\n',
        skipEmptyLines: false,
        columns: null,
      })
      const csvData = utf8BOM + csv
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchData()
    },
    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort =
        e.multiSortMeta?.map((m) => ({
          field: m.field,
          dir: m.order === 1 ? 'asc' : 'desc',
        })) || []
      this.fetchData()
    },
    onView(data) {
      this.$router.push({ name: 'pre-plan-edit', params: { id: data.id } })
    },
    onEdit(data) {
      this.$router.push({ name: 'pre-plan-edit', params: { id: data.id } })
    },
    onApprove(data) {
      this.$router.push({ name: 'pre-plan-approve', params: { id: data.id } })
    },
    onViewApprovedDoc(row) {
      if (!row.approvedDocumentPath) return
      window.open(getAzureBlobUrl(row.approvedDocumentPath), '_blank')
    },
    async onPrintPdf(row) {
      await this.masterStore.fetchAll()
      const data = await this.store.getPrePlan(row.id)
      if (!data) return

      const ms = this.masterStore
      const findByCode = (list, code) => {
        if (code == null || typeof code === 'object') return code
        return (list || []).find((x) => x.code === code) || code
      }

      const items = (data.items || []).map((it) => ({
        moldCode: it.moldCode || null,
        moldDetail: it.moldDetail || null,
        productImageBlobPath: it.productImagePath || null,
        productQty: it.productQty || null,
        productQtyUnit: it.productQtyUnit || null,
        productDetail: it.productDetail || null,
        materials: (it.materials || []).map((m) => ({
          ...m,
          gold: findByCode(ms.golds, m.gold),
          gem: findByCode(ms.gems, m.gem),
          gemShape: findByCode(ms.gemShapes, m.gemShape),
        })),
      }))

      const goldLabel =
        this.masterStore.goldSizes.find((g) => g.code === data.goldType)?.description ||
        data.goldType ||
        ''
      const jobTypeLabel =
        this.masterStore.jobTypes.find((j) => j.code === data.jobType)?.description ||
        data.jobType ||
        ''
      const builder = new PrePlanOrderFormPdfBuilder(
        {
          documentNo: data.documentNo || data.orderNo || row.id,
          jobLocation: data.jobLocation || 'Domestic',
          jobType: data.jobType || 'NewDesign',
          jobTypeLabel,
          goldType: data.goldType || '',
          goldTypeLabel: goldLabel,
          orderDate: data.orderDate,
          deliveryDate: data.deliveryDate,
          createBy: data.createBy || '',
          salesBy: data.salesBy || '',
          approvedBy: data.approvedBy || '',
        },
        items,
      )
      await builder.prepareImages()
      builder.generatePDF().open()
    },
    getDesc(list, code) {
      if (!code) return '-'
      const found = (list || []).find((x) => x.code === code)
      return found?.description || code
    },
    isEditableStatus,
    getPrePlanStatusClass,
    getPrePlanStatusLabel,
    getLinkedProgressClass,
    formatMaterialBrief(m) {
      const parts = []
      if (m.gold) parts.push(`ทอง: ${this.getDesc(this.masterStore.golds, m.gold)} × ${m.goldQty || ''}`)
      if (m.gem) parts.push(`พลอย: ${this.getDesc(this.masterStore.gems, m.gem)} ${m.gemQty || ''}`)
      return parts.join(' · ') || '(ไม่ระบุ)'
    },
    formatDate,
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table.scss';
@import '@/assets/scss/responsive-style/web';

.btn-action-container {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: start;
}

.item-expand-card {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  background: #fdf2f2;
}

.expand-row {
  gap: 12px;
}

.material-list {
  margin: 0;
  padding-left: 16px;
  font-size: 0.85rem;
}

.plan-info {
  font-size: 0.9rem;
  margin-top: 6px;
}
</style>
