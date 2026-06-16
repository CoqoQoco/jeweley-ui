<template>
  <modal
    :showModal="visible"
    width="90%"
    :isShowActionPart="true"
    @closeModal="onClose"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">
        <i class="bi bi-graph-up mr-2"></i>ต้นทุนจากแผนผลิต (อ้างอิง)
      </span>
    </template>

    <template #content>
      <div class="px-3 pb-3">
        <div class="responsive-text-note mb-3">
          * ข้อมูลต้นทุนจากแผนผลิต WO{{ wo }}{{ woNumber }} ({{ planProductQty }} ชิ้น) — แสดงเพื่ออ้างอิงเท่านั้น
        </div>

        <div class="responsive-table-wrapper">
          <!-- eslint-disable-next-line no-restricted-imports -->
          <DataTable
            :value="planPriceItems"
            rowGroupMode="subheader"
            groupRowsBy="nameGroup"
            stripedRows
            showGridlines
          >
            <!-- eslint-disable-next-line no-restricted-imports -->
            <ColumnGroup type="header">
              <!-- eslint-disable-next-line no-restricted-imports -->
              <Row>
                <!-- eslint-disable-next-line no-restricted-imports -->
                <Column header="รายละเอียดงาน" :colspan="1" />
                <!-- eslint-disable-next-line no-restricted-imports -->
                <Column header="จำนวน" />
                <!-- eslint-disable-next-line no-restricted-imports -->
                <Column header="ราคา/จำนวน" />
                <!-- eslint-disable-next-line no-restricted-imports -->
                <Column header="น้ำหนัก" />
                <!-- eslint-disable-next-line no-restricted-imports -->
                <Column header="ราคา/น้ำหนัก" />
                <!-- eslint-disable-next-line no-restricted-imports -->
                <Column header="ราคารวม" />
              </Row>
            </ColumnGroup>

            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column field="nameGroup" />

            <!-- eslint-disable-next-line no-restricted-imports -->
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

            <!-- eslint-disable-next-line no-restricted-imports -->
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

            <!-- eslint-disable-next-line no-restricted-imports -->
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

            <!-- eslint-disable-next-line no-restricted-imports -->
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

            <!-- eslint-disable-next-line no-restricted-imports -->
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

            <!-- eslint-disable-next-line no-restricted-imports -->
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

            <!-- eslint-disable-next-line no-restricted-imports -->
            <ColumnGroup type="footer">
              <!-- eslint-disable-next-line no-restricted-imports -->
              <Row>
                <!-- eslint-disable-next-line no-restricted-imports -->
                <Column :colspan="5">
                  <template #footer>
                    <div class="text-right type-container">
                      <span>ต้นทุนรวมทั้งหมด (THB)</span>
                    </div>
                  </template>
                </Column>
                <!-- eslint-disable-next-line no-restricted-imports -->
                <Column :colspan="1">
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ calcTotalCost().toFixed(2) }}</span>
                    </div>
                  </template>
                </Column>
              </Row>
              <!-- eslint-disable-next-line no-restricted-imports -->
              <Row>
                <!-- eslint-disable-next-line no-restricted-imports -->
                <Column :colspan="5">
                  <template #footer>
                    <div class="text-right type-container plan-per-piece">
                      <span>ต้นทุนต่อชิ้น (÷ {{ planProductQty }} ชิ้น)</span>
                    </div>
                  </template>
                </Column>
                <!-- eslint-disable-next-line no-restricted-imports -->
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
      </div>
    </template>

    <template #action>
      <button class="btn btn-sm btn-outline-main" @click="onClose">
        <i class="bi bi-x-circle mr-1"></i>
        ปิด
      </button>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
// eslint-disable-next-line no-restricted-imports
import DataTable from 'primevue/datatable'
// eslint-disable-next-line no-restricted-imports
import Column from 'primevue/column'
// eslint-disable-next-line no-restricted-imports
import ColumnGroup from 'primevue/columngroup'
// eslint-disable-next-line no-restricted-imports
import Row from 'primevue/row'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'PlanCostModal',

  components: {
    modal,
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
</style>
