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
          v-if="data.status === 'Approved'"
          class="btn btn-sm btn-main"
          @click="onSendToProduction(data)"
          title="ส่งเข้าผลิต"
        >
          <i class="bi bi-arrow-right-circle"></i> ส่งเข้าผลิต
        </button>
      </div>
    </template>

    <template #statusTemplate="{ data }">
      <span :class="getStatusClass(data.status)">{{ getStatusLabel(data.status) }}</span>
    </template>
  </BaseDataTable>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { usePrePlanStore } from '@/stores/modules/api/production/pre-plan-store.js'
import { formatDate } from '@/services/utils/dayjs.js'

export default {
  name: 'PrePlanTable',
  components: { BaseDataTable },
  props: {
    modelForm: { type: Object, default: () => ({}) },
  },
  setup() {
    const store = usePrePlanStore()
    return { store }
  },
  data() {
    return {
      take: 10,
      skip: 0,
      sort: [],
      columns: [
        { field: 'action', header: '', minWidth: '160px', sortable: false },
        { field: 'orderNo', header: 'เลขที่ใบสั่ง', minWidth: '120px' },
        { field: 'jobType', header: 'ประเภทงาน', minWidth: '120px' },
        { field: 'productionRound', header: 'ครั้งที่', minWidth: '70px', align: 'center' },
        { field: 'moldCode', header: 'รหัสแม่พิมพ์', minWidth: '120px' },
        { field: 'goldType', header: 'ประเภททอง', minWidth: '100px' },
        { field: 'status', header: 'สถานะ', minWidth: '110px' },
        { field: 'productQty', header: 'จำนวน', minWidth: '80px', align: 'right' },
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
    await this.fetchData()
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
        sort: this.sort,
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
    onSendToProduction(data) {
      this.$router.push({ name: 'plan-order', query: { prePlanId: data.id } })
    },
    getStatusClass(status) {
      const map = {
        Draft: 'badge bg-secondary',
        Submitted: 'badge bg-warning text-dark',
        Approved: 'badge bg-success',
        Rejected: 'badge bg-danger',
        Consumed: 'badge bg-primary',
      }
      return map[status] || 'badge bg-secondary'
    },
    getStatusLabel(status) {
      const map = {
        Draft: 'ร่าง',
        Submitted: 'รออนุมัติ',
        Approved: 'อนุมัติแล้ว',
        Rejected: 'ปฏิเสธ',
        Consumed: 'ส่งผลิตแล้ว',
      }
      return map[status] || status
    },
    formatDate,
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
.btn-action-container {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
</style>
