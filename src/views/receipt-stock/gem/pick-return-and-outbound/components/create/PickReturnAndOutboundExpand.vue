<template>
  <div class="">
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
              class="btn btn-sm btn btn-red"
              title="ลบรายการ"
              @click="delOutbound(slotProps.data, slotProps.index)"
              type="button"
            >
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        </template>
      </Column>
      <column field="productionPlan" header="แผนผลิต" style="width: 200px">
        <template #body="slotProps">
          <AutoComplete
            v-model="slotProps.data.productionPlan"
            :suggestions="planSearch"
            @complete="onSearchProductionPlanId"
            :optionLabel="(option) => `${option.woText} - ${option.woNumber}`"
            forceSelection
            :class="slotProps.data.productionPlan ? '' : 'p-invalid'"
          >
            <template #option="slotProps">
              <div class="flex align-options-center">
                <div>
                  {{
                    `${slotProps.option.wo}-${slotProps.option.woNumber}, เเม่พิมพ์: ${slotProps.option.mold}`
                  }}
                </div>
              </div>
            </template>
          </AutoComplete>
        </template>
      </column>
      <Column field="mold" header="เเม่พิมพ์" style="width: 200px">
        <template #body="slotProps">
          <div>
            <span>
              {{ slotProps.data.productionPlan ? slotProps.data.productionPlan.mold : '-' }}
            </span>
          </div>
        </template>
      </Column>
      <column field="issueQty" header="จำนวนจ่ายตัด" style="width: 100px">
        <template #body="slotProps">
          <input
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
            :disabled="slotProps.data.productionPlan ? false : true"
          />
          <!-- @change="onChangeQty(slotProps.data)" -->
        </template>
      </column>
      <column field="issueQtyWeight" header="น้ำหนักจ่ายตัด" style="width: 100px">
        <template #body="slotProps">
          <input
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
            :disabled="slotProps.data.productionPlan ? false : true"
          />
        </template>
      </column>
      <column field="remark" header="หมายเหตุ" style="min-width: 150px">
        <template #body="slotProps">
          <input
            style="width: 100%; background-color: #e0e0e0"
            :style="slotProps.data.remark ? 'background-color: #b5dad4' : ''"
            class="form-control"
            type="text"
            v-model="slotProps.data.remark"
            :disabled="slotProps.data.productionPlan ? false : true"
          />
          <!-- @change="onChangeQty(slotProps.data)" -->
        </template>
      </column>
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
import AutoComplete from 'primevue/autocomplete'

import api from '@/axios/axios-config.js'

export default {
  components: {
    //modal,
    DataTable,
    Column,
    AutoComplete
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
    },
    formattedOptionLabel() {
      return (option) => `${option.woText}-${option.woNumber}`
    }
  },
  data() {
    return {
      isLoading: false,
      modelMasterType: [
        { id: 1, description: 'รับเข้าคลัง [พลอยใหม่]' },
        { id: 2, description: 'รับเข้าคลัง [พลอยนอกสต๊อก]' },
        { id: 3, description: 'รับเข้าคลัง [พลอยคืน]' },
        { id: 4, description: 'จ่ายออกคลัง' },
        { id: 5, description: 'ยืมออกคลัง' }
      ],
      gemsReturn: [],
      expandedRows: [],
      planSearch: []
    }
  },
  methods: {
    // ----- APIs
    async onSearchProductionPlanId(e) {
      try {
        //this.isLoading = true
        //console.log(this.formValue)
        const params = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null,
            status: [10, 50, 55, 60, 70, 80, 90, 95]
            //type: this.form.status,
            //active: 1
          }
        }
        const res = await api.jewelry.post(
          'ProductionPlan/ProductionPlanSearchByProductionPlanId',
          params
        )
        if (res) {
          //console.log(res)
          this.planSearch = [...res.data]
          //this.workerItemSearch = res.data.map((x) => `${x.code} : ${x.nameTh}`)
        }
        //this.isLoading = false
      } catch (error) {
        console.log(error)
        //this.isLoading = false
      }
    },

    // ------ event
    delOutbound(data, index) {
      this.dataExpand.gemsOutbound.splice(index, 1)
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
  //background-color: var(--base-color);
  padding: 10px;
  //margin-top: 10px;
}
</style>
