<template>
  <div class="filter-container-custom">
    <div class="filter-container-highlight">
      <div class="d-flex justify-content-between">
        <!-- time -->
        <div class="title-text-white vertical-center-container">
          <span class="bi bi-clock-history mr-2"></span>
          <span>{{
            this.modelPrice.length > 0 ? formatDateTime(this.modelPrice[0].date) : `---`
          }}</span>
          <!-- <span v-if="modelPlanStatus">{{ formatDateTime(modelPlanStatus.updateDate) }}</span> -->
          <!-- <span v-else class="ml-2">---</span> -->
        </div>

        <!-- action -->
        <div class="d-flex">
          <div>
            <pricePDF
              :isVisible="isMakePrice"
              :modelValue="model"
              :modelPrice="modelPrice"
            ></pricePDF>
          </div>
          <div>
            <button
              :class="['btn btn-sm ml-2', checkBtn('add') ? 'btn-secondary' : 'btn-green']"
              title="ประเมินบัตรต้นทุน"
              :disabled="checkBtn('add')"
              @click="addStatus()"
            >
              <span class="bi bi-database-fill-add"></span>
            </button>
            <button
              :class="['btn btn-sm ml-2', checkBtn('edit') ? 'btn-secondary' : 'btn-warning']"
              title="เเก้ไข"
              :disabled="checkBtn('edit')"
              @click="updateStatus()"
            >
              <span class="bi bi-brush"></span>
            </button>
            <button
              :class="['btn btn-sm ml-2', checkBtn('delete') ? 'btn-secondary' : 'btn-red']"
              title="ลบ"
              :disabled="checkBtn('delete')"
              @click="onDelStatus(modelPlanStatus.id)"
            >
              <span class="bi bi-trash-fill"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div>
      <DataTable
        :value="modelPrice"
        rowGroupMode="subheader"
        groupRowsBy="nameGroup"
        stripedRows
        showGridlines
      >
        <ColumnGroup type="header">
          <Row>
            <Column header="รายละเอียดงาน" :colspan="2" />
            <!-- <Column header="วันที่" /> -->
            <Column header="จำนวน" />
            <Column header="ราคา/จำนวน" />
            <Column header="น้ำหนัก" />
            <Column header="ราคา/น้ำหนัก" />
            <Column header="ราคารวม" />
          </Row>
        </ColumnGroup>

        <Column field="nameGroup"> </Column>
        <Column field="index" style="width: 10px">
          <template #body="slotProps">
            <span>{{ slotProps.index + 1 }}</span>
          </template>
        </Column>
        <Column field="nameDescription">
          <template #body="slotProps">
            <div>
              <span>{{ slotProps.data.nameDescription }}</span>
            </div>
          </template>
        </Column>
        <Column field="qty" style="width: 110px">
          <template #body="slotProps">
            <div class="text-right">
              <span>{{ slotProps.data.qty }}</span>
            </div>
          </template>
        </Column>
        <Column field="qtyPrice" style="width: 110px">
          <template #body="slotProps">
            <div class="text-right">
              <span>{{ slotProps.data.qtyPrice.toFixed(2) }}</span>
            </div>
          </template>
        </Column>

        <Column field="qtyWeight" style="width: 110px">
          <template #body="slotProps">
            <div class="text-right">
              <span>{{ slotProps.data.qtyWeight }}</span>
            </div>
          </template>
        </Column>
        <Column field="qtyWeightPrice" style="width: 110px">
          <template #body="slotProps">
            <div class="text-right">
              <span>{{ slotProps.data.qtyWeightPrice.toFixed(2) }}</span>
            </div>
          </template>
        </Column>

        <column field="totalPrice" style="width: 110px">
          <template #body="slotProps">
            <div class="text-right">
              <span>{{ slotProps.data.totalPrice }}</span>
            </div>
          </template>
        </column>

        <template #groupheader="slotProps">
          <div class="flex align-items-center gap-2 type-container">
            <span><i class="bi bi-clipboard2-check-fill mr-2"></i></span>
            <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
          </div>
        </template>
        <ColumnGroup type="footer">
          <Row>
            <column :colspan="6">
              <template #footer>
                <div class="text-right">
                  <span>ต้นทุนรวม</span>
                </div>
              </template>
            </column>
            <column :colspan="1">
              <template #footer>
                <div class="text-right">
                  <span>{{ caltotalPrice(modelPrice) }}</span>
                </div>
              </template>
            </column>
          </Row>
        </ColumnGroup>
      </DataTable>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
//import _ from 'lodash'
import Row from 'primevue/row'

//import DataTable from 'primevue/datatable'
//import Column from 'primevue/column'
import Papa from 'papaparse'

import { formatDate, formatDateTime } from '@/services/utils/dayjs'
import api from '@/axios/axios-helper.js'
import swAlert from '@/services/alert/sweetAlerts.js'

const pricePDF = defineAsyncComponent(() =>
  import('@/components/pdf-make/FilePDFProductionPlanPrice.vue')
)

export default {
  components: {
    DataTable,
    Column,
    ColumnGroup,
    Row,
    pricePDF
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    modelMatValue: {
      type: Array,
      required: true,
      default: () => []
    },
    masterStatus: {
      type: Array,
      required: true,
      default: () => []
    },
    masterGold: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    model() {
      return this.modelValue
    },
    modelMat() {
      return this.modelMatValue
    },
    modelStatus() {
      return this.masterStatus
    },
    modelGold() {
      return this.masterGold
    },
    modelPrice() {
      return this.modelValue.priceItems
    },
    isMakePrice() {
      return this.modelPrice.length > 0
    }
  },
  data() {
    return {
      wages: 0,
      status: 70
    }
  },
  methods: {
    // ----- helper
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return date ? formatDate(date) : ''
    },
    checkBtn(action) {
      const disStatus = [100, 500]
      const allowPrice = [95, 94]
      if (!disStatus.includes(this.model.status)) {
        switch (action) {
          case 'print':
            return !this.isMakePrice
          case 'add':
            return allowPrice.includes(this.model.status) ? false : true
          case 'edit':
            return true
          case 'delete':
            return true
          //return this.modelPlanStatus ? false : true
          case 'close':
            return true
        }
      } else {
        return true
      }
    },
    exportWithCustomColumnCSV(data, filename) {
      const utf8BOM = '\uFEFF'
      const csv = Papa.unparse(data, {
        quotes: false, //or array of booleans
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ',',
        header: true,
        newline: '\r\n',
        skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
        columns: null //or array of strings
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
    getGroupName(id) {
      switch (id) {
        case 'Gold':
          return 'รายการทอง'
        case 'Gem':
          return 'รายการวัถุดิบ'
        case 'Worker':
          return 'รายการงานช่าง'
        case 'Embed':
          return 'รายการงานฝัง'
        case 'ETC':
          return 'รายการเพิ่มเติม'
        default:
          return 'Unknown'
      }
    },
    caltotalPrice(data) {
      let total = 0
      data.forEach((item) => {
        total += Number(item.totalPrice)
      })
      return total.toFixed(2)
    },

    // ----- event
    addStatus() {
      console.log('addStatus')
      this.$emit('onShowAddStatus', 'price')
    },
    updateStatus() {
      console.log('updateStatus')
      this.$emit('onShowUpdateStatus', 'gems')
    },
    onDelStatus(id) {
      swAlert.confirmSubmit(
        `ยืนยันลบงาน [คัดพลอย]`,
        `${this.model.wo}-${this.model.woNumber}`,
        async () => {
          //console.log('call submitPlan')
          await this.DelStatus(id)
        },
        null,
        null
      )
    },
    exportGemCsv() {
      const dataExcel = this.modelPlanStatus.tbtProductionPlanStatusGem.map((item) => {
        return {
          เลขที่เบิก: item.outboundRunning,
          ผู้เบิก: item.outboundName,
          รหัส: item.code,
          พลอย: item.name,
          จำนวน: item.qty ? Number(item.qty).toFixed(3) : '0.000',
          น้ำหนัก: item.weight ? Number(item.weight).toFixed(3) : '0.000',
          ราคา: item.price ? Number(item.price).toFixed(2) : '0.000'
        }
      })

      this.exportWithCustomColumnCSV(
        dataExcel,
        `รายการวัถุดิบ แผนผลิตเลขที่ [${this.modelValue.wo}-${this.modelValue.woNumber}].csv`
      )
    },
    goPrice() {
      this.$router.push({
        name: 'plan-order-price-view',
        params: { id: `${this.model.wo}-${this.model.woNumber}` }
      })
    },

    // ----- APIs
    async DelStatus(id) {
      //console.log(id)
      try {
        this.isLoading = true

        const params = {
          productionPlanId: this.model.id,
          wo: this.model.wo,
          woNumber: this.model.woNumber,
          id: id
        }
        const res = await api.jewelry.post(
          'ProductionPlan/ProductionPlanDeleteStatusDetail',
          params
        )
        if (res) {
          swAlert.success(
            ``,
            '',
            async () => {
              //this.closeModal()
              this.$emit('fetch')
            },
            null,
            null
          )
        }

        this.isLoading = false
      } catch (error) {
        this.isLoading = false
      }
    }
  },
  created() {
    this.$nextTick(() => {
      //console.log('modelPlanStatus', this.modelPlanStatus)
      console.log('model price', this.modelPrice)
      console.log('model make price', this.isMakePrice)
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.filter-container-custom {
  border: 1px solid #dddddd;
  border-radius: 5px;

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  padding: 10px;
  height: calc(100vh - 160px);
  overflow: auto;
}
.type-container {
  font-size: 15px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;
  //margin: 0px 0px 10px 0px;
}
</style>
