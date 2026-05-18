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
        <button class="btn btn-sm btn-green" @click="onView(data)" title="ดูรายละเอียด">
          <i class="bi bi-eye"></i>
        </button>
        <button
          v-if="data.status === 'Draft'"
          class="btn btn-sm btn-main"
          @click="onEdit(data)"
          title="แก้ไข"
        >
          <i class="bi bi-pencil"></i>
        </button>
        <button
          v-if="data.status === 'Submitted'"
          class="btn btn-sm btn-main ml-2"
          @click="onApprove(data)"
          title="อนุมัติ"
        >
          <i class="bi bi-check-lg"></i> อนุมัติ
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

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { usePrePlanStore } from '@/stores/modules/api/production/pre-plan-store.js'
import { useMasterPrePlanStore } from '@/stores/modules/api/master/master-pre-plan-store.js'
import { formatDate } from '@/services/utils/dayjs.js'
import {
  getPrePlanStatusClass,
  getPrePlanStatusLabel,
  getLinkedProgressClass,
} from '@/services/helper/pre-plan-status.js'

const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

export default {
  name: 'PrePlanTable',
  components: { BaseDataTable, imagePreview },
  props: {
    modelForm: { type: Object, default: () => ({}) },
  },
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
        { field: 'action', header: '', width: '150px', sortable: false, align: 'center' },
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
    getDesc(list, code) {
      if (!code) return '-'
      const found = (list || []).find((x) => x.code === code)
      return found?.description || code
    },
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
  justify-content: center;
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
