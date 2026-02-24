<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :style="{ width: '90vw' }"
    :breakpoints="{ '1280px': '90vw', '1024px': '95vw' }"
    @hide="onClose"
  >
    <template #header>
      <div class="vertical-center-container">
        <span class="title-text-lg bi bi-graph-up mr-2"></span>
        <span class="title-text-lg">ต้นทุนจากแผนผลิต (อ้างอิง)</span>
      </div>
    </template>

    <div class="responsive-text-note mb-3">
      * ข้อมูลต้นทุนจากแผนผลิต WO{{ wo }}{{ woNumber }} ({{ planProductQty }} ชิ้น) — แสดงเพื่ออ้างอิงเท่านั้น
    </div>

    <div class="responsive-table-wrapper">
      <DataTable
        :value="planPriceItems"
        rowGroupMode="subheader"
        groupRowsBy="nameGroup"
        stripedRows
        showGridlines
      >
        <ColumnGroup type="header">
          <Row>
            <Column header="รายละเอียดงาน" :colspan="1" />
            <Column header="จำนวน" />
            <Column header="ราคา/จำนวน" />
            <Column header="น้ำหนัก" />
            <Column header="ราคา/น้ำหนัก" />
            <Column header="ราคารวม" />
          </Row>
        </ColumnGroup>

        <Column field="nameGroup" />

        <Column field="nameDescription">
          <template #body="slotProps">
            <input
              type="text"
              class="form-control"
              :value="slotProps.data.nameDescription"
              readonly
              disabled
            />
          </template>
        </Column>

        <Column field="qty" style="width: 120px">
          <template #body="slotProps">
            <input
              type="text"
              class="form-control text-right"
              :value="Number(slotProps.data.qty).toFixed(2)"
              readonly
              disabled
            />
          </template>
        </Column>

        <Column field="qtyPrice" style="width: 110px">
          <template #body="slotProps">
            <input
              type="text"
              class="form-control text-right"
              :value="Number(slotProps.data.qtyPrice).toFixed(2)"
              readonly
              disabled
            />
          </template>
        </Column>

        <Column field="qtyWeight" style="width: 110px">
          <template #body="slotProps">
            <input
              type="text"
              class="form-control text-right"
              :value="Number(slotProps.data.qtyWeight).toFixed(2)"
              readonly
              disabled
            />
          </template>
        </Column>

        <Column field="qtyWeightPrice" style="width: 110px">
          <template #body="slotProps">
            <input
              type="text"
              class="form-control text-right"
              :value="Number(slotProps.data.qtyWeightPrice).toFixed(2)"
              readonly
              disabled
            />
          </template>
        </Column>

        <Column field="totalPrice" style="width: 140px">
          <template #body="slotProps">
            <input
              type="text"
              class="form-control text-right"
              :value="Number(slotProps.data.totalPrice).toFixed(2)"
              readonly
              disabled
            />
          </template>
        </Column>

        <template #groupheader="slotProps">
          <div class="flex align-items-center gap-2 type-container">
            <span><i class="bi bi-clipboard2-check mr-2"></i></span>
            <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
          </div>
        </template>

        <template #groupfooter="slotProps">
          <div class="d-flex align-items-center justify-content-between gap-2 type-container">
            <div>
              <span><i class="bi bi-clipboard2-check-fill mr-2"></i></span>
              <span>ต้นทุน{{ getGroupName(slotProps.data.nameGroup) }}</span>
            </div>
            <div class="text-right mr-2">
              {{ calcGroupTotal(slotProps.data.nameGroup).toFixed(2) }}
            </div>
          </div>
        </template>

        <ColumnGroup type="footer">
          <Row>
            <Column :colspan="5">
              <template #footer>
                <div class="text-right type-container">
                  <span>ต้นทุนรวมทั้งหมด (THB)</span>
                </div>
              </template>
            </Column>
            <Column :colspan="1">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ calcTotalCost().toFixed(2) }}</span>
                </div>
              </template>
            </Column>
          </Row>
          <Row>
            <Column :colspan="5">
              <template #footer>
                <div class="text-right type-container plan-per-piece">
                  <span>ต้นทุนต่อชิ้น (÷ {{ planProductQty }} ชิ้น)</span>
                </div>
              </template>
            </Column>
            <Column :colspan="1">
              <template #footer>
                <div class="text-right type-container plan-per-piece">
                  <span>{{ calcCostPerPiece().toFixed(2) }}</span>
                </div>
              </template>
            </Column>
          </Row>
        </ColumnGroup>
      </DataTable>
    </div>

    <template #footer>
      <div class="submit-container">
        <button class="btn btn-secondary btn-sm" @click="onClose">
          <i class="bi bi-x-circle mr-1"></i>
          ปิด
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'

export default {
  name: 'PlanCostModal',

  components: {
    Dialog,
    DataTable,
    Column,
    ColumnGroup,
    Row
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    planPriceItems: {
      type: Array,
      default: () => []
    },
    planQty: {
      type: Number,
      default: 1
    },
    wo: {
      type: String,
      default: ''
    },
    woNumber: {
      type: [Number, String],
      default: ''
    }
  },

  emits: ['update:visible'],

  computed: {
    isVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    },

    planProductQty() {
      return Number(this.planQty) || 1
    }
  },

  methods: {
    onClose() {
      this.$emit('update:visible', false)
    },

    getGroupName(id) {
      switch (id) {
        case 'Gold':   return 'รายการทอง'
        case 'Gem':    return 'รายการวัถุดิบ'
        case 'Worker': return 'รายการงานช่าง'
        case 'Embed':  return 'รายการงานฝัง'
        case 'ETC':    return 'รายการเพิ่มเติม'
        default:       return id || 'Unknown'
      }
    },

    calcGroupTotal(groupName) {
      return this.planPriceItems
        .filter((item) => item.nameGroup === groupName)
        .reduce((sum, item) => sum + Number(item.totalPrice), 0)
    },

    calcTotalCost() {
      return this.planPriceItems.reduce((sum, item) => sum + Number(item.totalPrice), 0)
    },

    calcCostPerPiece() {
      return this.calcTotalCost() / this.planProductQty
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.type-container {
  font-size: 15px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;

  @media (max-width: 1024px) {
    font-size: 14px;
  }
}

.plan-per-piece {
  color: #1565c0;
  font-size: 13px;
  font-style: italic;
}

:deep(.p-datatable) {
  font-size: 14px;

  @media (max-width: 1024px) {
    font-size: 13px;

    .p-datatable-thead > tr > th {
      padding: 0.5rem 0.4rem;
    }

    .p-datatable-tbody > tr > td {
      padding: 0.5rem 0.4rem;
    }

    input.form-control {
      font-size: 13px;
    }
  }
}

.submit-container {
  display: flex;
  justify-content: flex-end;
}
</style>
