<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <div class="filter-container-highlight-expnad">
      <div class="form-col-container">
        <div class="title-text-white">
          <span class="bi bi-arrow-bar-up mr-2"></span>
          <span class="mr-2">รายการเบิกออกคลัง:</span>
          <span>{{ dataExpand.name }}</span>
        </div>
      </div>
    </div>
    <DataTable
      :value="dataExpand.gemsOutbound"
      stripedRows
      columnResizeMode="fit"
      class="p-datatable-sm custom-table-container"
      showGridlines
    >
      <Column style="width: 50px">
        <template #body="slotProps">
          <div class="table-btn-action-container">
            <button
              :class="[
                'btn btn-sm',
                slotProps.data.isAlreadyOutbound ? 'btn-outline-main' : 'btn-red'
              ]"
              title="ลบรายการ"
              @click="delOutbound(slotProps.data, index)"
              type="button"
              :disabled="slotProps.data.isAlreadyOutbound"
            >
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        </template>
      </Column>
      <Column field="productionPlan" header="แผนผลิต" style="width: 200px">
        <template #body="slotProps">
          <div v-if="slotProps.data.isAlreadyOutbound">
            <span>
              {{
                `${slotProps.data.productionPlan.wo}-${slotProps.data.productionPlan.woNumber} [${slotProps.data.running}]`
              }}
            </span>
          </div>
          <AutoCompleteGeneric
            v-else
            :modelValue="slotProps.data.productionPlan"
            :suggestions="planSearch"
            @complete="onSearchProductionPlanId"
            :optionLabel="(option) => `${option.wo} - ${option.woNumber}`"
            :forceSelection="true"
            :class="slotProps.data.productionPlan ? '' : 'p-invalid'"
            :disabled="slotProps.data.isAlreadyOutbound"
            @update:modelValue="slotProps.data.productionPlan = $event"
          >
            <template #option="{ option }">
              <div>
                {{
                  `${option.wo}-${option.woNumber}, เเม่พิมพ์: ${option.mold}`
                }}
              </div>
            </template>
          </AutoCompleteGeneric>
        </template>
      </Column>
      <Column field="mold" header="เเม่พิมพ์" style="width: 200px">
        <template #body="slotProps">
          <div>
            <span>
              {{ slotProps.data.productionPlan ? slotProps.data.productionPlan.mold : '-' }}
            </span>
          </div>
        </template>
      </Column>
      <Column field="remark" header="หมายเหตุ" style="min-width: 150px">
        <template #body="slotProps">
          <div v-if="slotProps.data.isAlreadyOutbound">
            <span>{{ slotProps.data.remark }}</span>
          </div>
          <input
            v-else
            style="width: 100%; background-color: #e0e0e0"
            :style="slotProps.data.remark ? 'background-color: #b5dad4' : ''"
            class="form-control"
            type="text"
            v-model="slotProps.data.remark"
            :disabled="checkAvaliable(slotProps.data, 'remark')"
          />
        </template>
      </Column>
      <Column field="issueQty" header="จำนวนเบิก" style="width: 100px">
        <template #body="slotProps">
          <div v-if="slotProps.data.isAlreadyOutbound">
            <span>{{ slotProps.data.issueQty.toFixed(3) }}</span>
          </div>
          <input
            v-else
            style="width: 100px; background-color: #e0e0e0"
            :style="slotProps.data.issueQty > 0 ? 'background-color: #b5dad4' : ''"
            class="form-control"
            type="number"
            step="any"
            min="0"
            required
            v-model="slotProps.data.issueQty"
            @input="onUpdateIssueQty($event, slotProps.data, index)"
            @blur="onblueIssueQty($event, slotProps.data)"
            :disabled="checkAvaliable(slotProps.data, 'issueQty')"
          />
        </template>
      </Column>
      <Column field="issueQtyWeight" header="น้ำหนักเบิก" style="width: 100px">
        <template #body="slotProps">
          <div v-if="slotProps.data.isAlreadyOutbound">
            <span>{{ slotProps.data.issueQtyWeight.toFixed(3) }}</span>
          </div>
          <input
            v-else
            style="width: 100px; background-color: #e0e0e0"
            :style="slotProps.data.issueQtyWeight > 0 ? 'background-color: #b5dad4' : ''"
            class="form-control"
            type="number"
            step="any"
            min="0"
            required
            v-model="slotProps.data.issueQtyWeight"
            @input="onUpdateIssueQtyWeight($event, slotProps.data, index)"
            @blur="onblueIssueQtyWeight($event, slotProps.data)"
            :disabled="checkAvaliable(slotProps.data, 'issueQtyWeight')"
          />
        </template>
      </Column>

      <template #footer>
        <div class="submit-container">
          <span>{{
            `รวมจำนวน: ${dataExpand.gemsOutbound ? dataExpand.gemsOutbound.length : 0} รายการ`
          }}</span>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import api from '@/axios/axios-helper.js'

export default {
  components: {
    DataTable,
    Column,
    AutoCompleteGeneric
  },
  props: {
    modelExpand: {
      type: Object,
      required: true,
      default: () => {}
    },
    slotIndex: {
      type: Number,
      required: true,
      default: 0
    }
  },
  computed: {
    dataExpand() {
      return this.modelExpand
    },
    index() {
      return this.slotIndex
    }
  },
  data() {
    return {
      planSearch: []
    }
  },
  methods: {
    async onSearchProductionPlanId(e) {
      const params = {
        take: 0,
        skip: 0,
        search: {
          text: e.query ?? null,
          status: [10, 50, 55, 60, 70, 80, 90, 95]
        }
      }
      const res = await api.jewelry.post(
        'ProductionPlan/ProductionPlanSearchByProductionPlanId',
        params
      )
      if (res) {
        this.planSearch = [...res.data]
      }
    },

    delOutbound(data, index) {
      this.$emit('delOutbound', data, index)
    },
    onUpdateIssueQty(e, data, index) {
      this.$emit('onUpdateIssueQty', e, data, index)
    },
    onblueIssueQty(e, data) {
      this.$emit('onblueIssueQty', e, data)
    },
    onUpdateIssueQtyWeight(e, data, index) {
      this.$emit('onUpdateIssueQtyWeight', e, data, index)
    },
    onblueIssueQtyWeight(e, data) {
      this.$emit('onblueIssueQtyWeight', e, data)
    },

    checkAvaliable(data, index) {
      let check = false

      let item = ['remark', 'issueQty', 'issueQtyWeight']
      if (item.includes(index)) {
        check = data.productionPlan ? false : true
      }
      if (data.isAlreadyOutbound) {
        check = true
      }

      return check
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form.scss';

:deep(.p-datatable) {
  thead th {
    background-color: #460505 !important;
  }
}
.filter-container-highlight-expnad {
  border: 1px solid #dddddd;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #460505;
  padding: 10px;
}
.table-btn-action-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
