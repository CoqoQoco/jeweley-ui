<template>
  <div class="history-layout p-3">
    <!-- Left sidebar: plan list -->
    <div class="history-sidebar">
      <BaseDataTable
        :items="planList"
        :columns="planColumns"
        :totalRecords="planList.length"
        :paginator="false"
        :perPage="50"
        dataKey="id"
        emptyMessage="ไม่มีประวัติการผลิตของแม่พิมพ์นี้"
        scrollHeight="calc(90vh - 220px)"
      >
        <template #woTemplate="{ data }">
          <div
            class="plan-row-cell"
            :class="{ 'plan-row-cell--active': selectedPlan?.id === data.id }"
            @click="selectPlan(data)"
          >
            <div class="plan-row-cell__header">
              <span class="plan-wo">{{ data.wo }}-{{ data.woNumber }}</span>
              <span
                class="plan-status-badge"
                :class="getStatusClass(data.status)"
              >{{ data.statusName || data.status }}</span>
            </div>
            <div class="plan-row-cell__body">
              <div><i class="bi bi-calendar3"></i> {{ formatDate(data.requestDate) }}</div>
              <div><i class="bi bi-person"></i> {{ data.customerName || '-' }}</div>
              <div><i class="bi bi-gem"></i> {{ data.productQty || '-' }} {{ data.gold || '' }}</div>
            </div>
          </div>
        </template>
      </BaseDataTable>
    </div>

    <!-- Right panel: plan detail -->
    <div class="history-detail">
      <div v-if="!selectedPlan" class="empty-state">
        <i class="bi bi-arrow-left-circle text-muted"></i>
        <p class="text-muted mt-2">กรุณาเลือกแผนการผลิตจากรายการทางซ้าย</p>
      </div>

      <div v-else>
        <!-- Header info -->
        <div class="detail-section mb-3">
          <h6>ข้อมูลแผนการผลิต</h6>
          <div class="form-row two-col">
            <div class="form-field">
              <span class="title-text">W.O.</span>
              <input class="form-control" type="text" :value="`${selectedPlan.wo || ''}-${selectedPlan.woNumber || ''}`" readonly disabled />
            </div>
            <div class="form-field">
              <span class="title-text">วันที่กำหนดส่ง</span>
              <input class="form-control" type="text" :value="formatDate(selectedPlan.requestDate)" readonly disabled />
            </div>
          </div>
          <div class="form-row two-col">
            <div class="form-field">
              <span class="title-text">ชื่อลูกค้า</span>
              <input class="form-control" type="text" :value="selectedPlan.customerName || '-'" readonly disabled />
            </div>
            <div class="form-field">
              <span class="title-text">สถานะ</span>
              <input class="form-control" type="text" :value="selectedPlan.statusName || selectedPlan.status || '-'" readonly disabled />
            </div>
          </div>
          <div class="form-row two-col">
            <div class="form-field">
              <span class="title-text">ประเภทสินค้า</span>
              <input class="form-control" type="text" :value="selectedPlan.productTypeName || '-'" readonly disabled />
            </div>
            <div class="form-field">
              <span class="title-text">จำนวน</span>
              <input class="form-control" type="text" :value="selectedPlan.productQty ? `${selectedPlan.productQty} ${selectedPlan.productQtyUnit || ''}` : '-'" readonly disabled />
            </div>
          </div>
          <div class="form-row two-col">
            <div class="form-field">
              <span class="title-text">สีทอง</span>
              <input class="form-control" type="text" :value="selectedPlan.gold || '-'" readonly disabled />
            </div>
            <div class="form-field">
              <span class="title-text">ประเภททอง</span>
              <input class="form-control" type="text" :value="selectedPlan.goldSize || '-'" readonly disabled />
            </div>
          </div>
          <div v-if="selectedPlan.remark" class="form-field mt-2">
            <span class="title-text">หมายเหตุ</span>
            <textarea class="form-control" rows="2" :value="selectedPlan.remark" readonly disabled></textarea>
          </div>
        </div>

        <!-- Materials table -->
        <div class="detail-section mb-3">
          <h6>รายการวัตถุดิบ</h6>
          <BaseDataTable
            :items="selectedPlanMaterials"
            :columns="materialColumns"
            :totalRecords="selectedPlanMaterials.length"
            :paginator="false"
            :showGridlines="true"
            scrollHeight="250px"
            emptyMessage="ไม่มีรายการวัตถุดิบ"
          >
            <template #gemTemplate="{ data }">
              {{ data.gemNavigation?.code || '-' }}
            </template>
            <template #gemShapeTemplate="{ data }">
              {{ data.gemShapeNavigation?.code || '-' }}
            </template>
            <template #goldTemplate="{ data }">
              {{ data.goldNavigation?.code || '-' }}
            </template>
          </BaseDataTable>
        </div>

        <!-- Apply button -->
        <div class="d-flex justify-content-end">
          <button
            type="button"
            class="btn btn-sm btn-main"
            @click="onApplyMaterials"
          >
            <i class="bi bi-clipboard-check mr-1"></i>
            ใช้วัตถุดิบจากแผนนี้
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { usePlanSearchApiStore } from '@/stores/modules/api/plan-search-store.js'
import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'
import { mapPlanMaterialsToPrePlan } from '@/services/helper/pre-plan-helpers.js'
import dayjs from 'dayjs'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'MoldHistoryContent',

  components: { BaseDataTable },

  props: {
    moldCode: {
      type: String,
      default: '',
    },
    currentMaterialsCount: {
      type: Number,
      default: 0,
    },
    isShow: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['apply-materials', 'close'],

  setup(props, { emit }) {
    const planList = ref([])
    const selectedPlan = ref(null)
    const selectedPlanMaterials = ref([])
    const planDetailCache = ref({})
    const planSearchStore = usePlanSearchApiStore()

    const planColumns = [
      { field: 'wo', header: '', sortable: false, width: '100%' },
    ]
    const materialColumns = [
      { field: 'gold', header: 'ทอง', minWidth: '100px', sortable: false },
      { field: 'goldQty', header: 'จำนวนทอง', minWidth: '90px', sortable: false },
      { field: 'gem', header: 'พลอย', minWidth: '100px', sortable: false },
      { field: 'gemShape', header: 'รูปร่าง', minWidth: '100px', sortable: false },
      { field: 'gemSize', header: 'ขนาด', minWidth: '80px', sortable: false },
      { field: 'gemQty', header: 'จำนวนพลอย', minWidth: '90px', sortable: false },
      { field: 'diamondQty', header: 'จำนวนเพชร', minWidth: '90px', sortable: false },
      { field: 'diamondSize', header: 'ขนาดเพชร', minWidth: '90px', sortable: false },
      { field: 'diamondQuality', header: 'คุณภาพเพชร', minWidth: '100px', sortable: false },
    ]

    function resetState() {
      planList.value = []
      selectedPlan.value = null
      selectedPlanMaterials.value = []
      planDetailCache.value = {}
    }

    async function fetchHistory() {
      const res = await planSearchStore.SearchData({
        take: 50,
        skip: 0,
        sort: [],
        formValue: { mold: props.moldCode },
      })
      if (res && res.data) {
        planList.value = res.data
      } else {
        planList.value = []
      }
    }

    async function fetchPlanDetail(planId) {
      if (planDetailCache.value[planId]) {
        selectedPlanMaterials.value = planDetailCache.value[planId]
        return
      }
      const res = await planSearchStore.fetchProductionPlanMateriaGet({ id: planId })
      const materials = Array.isArray(res) ? res : (res?.data || [])
      planDetailCache.value[planId] = materials
      selectedPlanMaterials.value = materials
    }

    async function selectPlan(plan) {
      selectedPlan.value = plan
      selectedPlanMaterials.value = []
      await fetchPlanDetail(plan.id)
    }

    function onApplyMaterials() {
      if (!selectedPlan.value) return
      const applyFn = () => {
        const mapped = mapPlanMaterialsToPrePlan(selectedPlanMaterials.value)
        emit('apply-materials', mapped)
        success('ใช้วัตถุดิบจากแผนเรียบร้อย')
      }
      if (props.currentMaterialsCount > 0) {
        confirmSubmit(
          'วัตถุดิบปัจจุบันจะถูกแทนที่ ยืนยัน?',
          'ยืนยันการใช้วัตถุดิบ',
          applyFn
        )
      } else {
        applyFn()
      }
    }

    function formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY')
    }

    function getStatusClass(status) {
      if (!status) return ''
      const s = String(status).toLowerCase()
      if (s === 'complete' || s === 'completed') return 'badge--green'
      if (s === 'cancel' || s === 'cancelled') return 'badge--red'
      if (s === 'inprocess' || s === 'in_process') return 'badge--blue'
      return 'badge--gray'
    }

    watch(
      () => props.isShow,
      (val) => {
        if (val && props.moldCode) {
          resetState()
          fetchHistory()
        }
      },
      { immediate: true }
    )

    onMounted(() => {
      if (props.isShow && props.moldCode && planList.value.length === 0) {
        fetchHistory()
      }
    })

    return {
      planList,
      selectedPlan,
      selectedPlanMaterials,
      planColumns,
      materialColumns,
      selectPlan,
      onApplyMaterials,
      formatDate,
      getStatusClass,
    }
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.history-layout {
  display: flex;
  gap: 16px;
  height: calc(90vh - 180px);
  overflow: hidden;
}

.history-sidebar {
  width: 300px;
  flex-shrink: 0;
  overflow-y: auto;
  padding-right: 4px;

  :deep(.p-datatable-thead) {
    display: none;
  }

  :deep(.p-datatable-tbody td) {
    padding: 0 !important;
  }
}

.history-detail {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 2rem;
}

.plan-row-cell {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  margin: 8px;
  transition: all 0.2s;
  background: #ffffff;

  &:hover {
    border-color: #adb5bd;
    background: #f8f9fa;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  &--active {
    border-color: var(--base-font-color);
    background: #fdf2f2;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
  }
}

.plan-row-cell__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.plan-wo {
  font-weight: 700;
  color: var(--base-font-color);
  font-size: 0.9rem;
}

.plan-status-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;

  &.badge--green {
    background: #d4edda;
    color: #155724;
  }

  &.badge--red {
    background: #f8d7da;
    color: #721c24;
  }

  &.badge--blue {
    background: #d1ecf1;
    color: #0c5460;
  }

  &.badge--gray {
    background: #e2e3e5;
    color: #383d41;
  }
}

.plan-row-cell__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.82rem;
  color: #555;

  i {
    color: var(--base-font-color);
    width: 14px;
    text-align: center;
  }
}

.detail-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #ffffff !important;

  h6 {
    color: var(--base-font-color);
    font-weight: 600;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
    background: transparent !important;
    margin-bottom: 12px;
  }
}

.form-row {
  margin-bottom: 10px;

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}

.form-field {
  width: 100%;
}

.title-text {
  display: block;
  font-weight: 500;
  margin-bottom: 4px;
  font-size: 0.85rem;
}

input.form-control,
textarea.form-control {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.85rem;
  background: #f8f9fa;
}

textarea.form-control {
  resize: none;
}

.history-sidebar::-webkit-scrollbar,
.history-detail::-webkit-scrollbar {
  width: 6px;
}

.history-sidebar::-webkit-scrollbar-track,
.history-detail::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.history-sidebar::-webkit-scrollbar-thumb,
.history-detail::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

@media (max-width: 1024px) {
  .history-layout {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }

  .history-sidebar {
    width: 100%;
    max-height: 250px;
  }

  .form-row.two-col {
    grid-template-columns: 1fr;
  }
}
</style>
