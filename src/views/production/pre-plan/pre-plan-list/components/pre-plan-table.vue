<template>
  <BaseDataTable
    :items="store.prePlanList"
    :totalRecords="store.prePlanTotal"
    :columns="columns"
    :perPage="take"
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
          class="btn btn-sm btn-main ms-2"
          @click="onApprove(data)"
          title="อนุมัติ"
        >
          <i class="bi bi-check-lg"></i> อนุมัติ
        </button>
        <button
          v-if="data.status === 'Approved'"
          class="btn btn-sm btn-main ms-2"
          @click="onConsume(data)"
          title="ส่งเข้าผลิต"
        >
          <i class="bi bi-arrow-right-circle"></i> ส่งเข้าผลิต
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
      <div :class="getStatusClass(data.status)">{{ getStatusLabel(data.status) }}</div>
    </template>

    <template #itemCountTemplate="{ data }">
      <span>{{ data.itemCount }} รายการ</span>
    </template>

    <template #primaryMoldCodeTemplate="{ data }">
      <span v-if="data.itemCount > 1">{{ data.primaryMoldCode }} +{{ data.itemCount - 1 }}</span>
      <span v-else>{{ data.primaryMoldCode }}</span>
    </template>
  </BaseDataTable>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { usePrePlanStore } from '@/stores/modules/api/production/pre-plan-store.js'
import { useMasterPrePlanStore } from '@/stores/modules/api/master/master-pre-plan-store.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'PrePlanTable',
  components: { BaseDataTable },
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
    onConsume(data) {
      confirmSubmit('ยืนยันส่งใบสั่งผลิตเข้าสายการผลิต?', 'ยืนยัน', async () => {
        await this.store.consumePrePlan(data.id, { id: data.id })
        success('ส่งเข้าผลิตสำเร็จ')
        await this.fetchData()
      })
    },
    getDesc(list, code) {
      if (!code) return '-'
      const found = (list || []).find((x) => x.code === code)
      return found?.description || code
    },
    getStatusClass(status) {
      const map = {
        Draft: 'box-status-process',
        Submitted: 'box-status-show',
        Approved: 'box-status-success',
        Rejected: 'box-status-disable',
        Consumed: 'box-status-next',
      }
      return map[status] || 'box-status-process'
    },
    getStatusLabel(status) {
      const fromMaster = (this.masterStore.statuses || []).find((s) => s.code === status)
      if (fromMaster?.description) return fromMaster.description
      const fallback = {
        Draft: 'ร่าง',
        Submitted: 'รออนุมัติ',
        Approved: 'อนุมัติแล้ว',
        Rejected: 'ปฏิเสธ',
        Consumed: 'ส่งผลิตแล้ว',
      }
      return fallback[status] || status
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
</style>
