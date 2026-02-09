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
          <button
            :class="['btn btn-sm ml-2', checkBtn('success') ? 'btn-secondary' : 'btn-green']"
            title="โอนสินค้า"
            :disabled="checkBtn('success')"
            @click="receiptProduct()"
          >
            <span class="bi bi-cart-check-fill"></span>
          </button>

          <pricePDF
            :isVisible="isMakePrice"
            :modelValue="model"
            :modelPrice="modelPrice"
          ></pricePDF>
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

    <div>
      <DataTable
        :value="modelPrice"
        rowGroupMode="subheader"
        groupRowsBy="nameGroup"
        stripedRows
        showGridlines
        dataKey="no"
        tableStyle="min-width: 50rem"
      >
        <ColumnGroup type="header">
          <Row>
            <Column header="รายละเอียดงาน" :colspan="2" />
            <!-- <Column header="วันที่" /> -->
            <Column header="จำนวน" />
            <Column header="ราคา/จำนวน" />
            <Column header="น้ำหนัก" />
            <Column header="ราคา/น้ำหนัก" />
            <Column header="ราคา/สินค้า" />
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
              <span>{{
                slotProps.data.qtyPrice ? Number(slotProps.data.qtyPrice).toFixed(2) : '0.00'
              }}</span>
            </div>
          </template>
        </Column>

        <Column field="qtyWeight" style="width: 110px">
          <template #body="slotProps">
            <div class="text-right">
              <span>{{
                slotProps.data.qtyWeight ? Number(slotProps.data.qtyWeight).toFixed(3) : '0.000'
              }}</span>
            </div>
          </template>
        </Column>
        <Column field="qtyWeightPrice" style="width: 110px">
          <template #body="slotProps">
            <div class="text-right">
              <span>{{
                slotProps.data.qtyWeightPrice ? slotProps.data.qtyWeightPrice.toFixed(2) : '0.00'
              }}</span>
            </div>
          </template>
        </Column>

        <Column field="totalPricePerQty" style="width: 110px">
          <template #body="slotProps">
            <div class="text-right">
              <!-- <span>{{ calEachPricePerQty(slotProps.data.totalPrice) }}</span> -->
              <span>0.00</span>
            </div>
          </template>
        </Column>
        <Column field="totalPrice" style="width: 110px">
          <template #body="slotProps">
            <div class="text-right">
              <span>{{ slotProps.data.totalPrice }}</span>
            </div>
          </template>
        </Column>

        <template #groupheader="slotProps">
          <div class="flex align-items-center gap-2 type-container">
            <span><i class="bi bi-clipboard2-check mr-2"></i></span>
            <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
          </div>
        </template>

        <!-- old group footer -->
        <template #groupfooter="slotProps">
          <div class="d-flex align-items-center justify-content-between gap-2 type-container">
            <div>
              <span><i class="bi bi-clipboard2-check-fill mr-2"></i></span>
              <span>ต้นทุน</span>
              <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
            </div>
            <div class="form-col-2equal-container text-right" style="width: 220px">
              <div>
                {{ calculateGroupTotalPerQty(slotProps.data.nameGroup, modelPrice).toFixed(2) }}
              </div>
              <div>
                {{ calculateGroupTotal(slotProps.data.nameGroup, modelPrice).toFixed(2) }}
              </div>
            </div>
          </div>
        </template>

        <ColumnGroup type="footer">
          <Row>
            <column :colspan="6">
              <template #footer>
                <div class="text-right type-container">
                  <span>ต้นทุน</span>
                </div>
              </template>
            </column>
            <column :colspan="1">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ calPricePerQty(modelPrice) }}</span>
                </div>
              </template>
            </column>
            <column :colspan="1">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ caltotalPrice(modelPrice) }}</span>
                </div>
              </template>
            </column>
          </Row>

          <!-- <Row>
            <column :colspan="7">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ `ต้นทุน/สินค้า [จำนวนผลิต ${this.model.productQty}]` }}</span>
                </div>
              </template>
            </column>
            <column :colspan="1">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ calPricePerQty(modelPrice) }}</span>
                </div>
              </template>
            </column>
          </Row> -->
        </ColumnGroup>
      </DataTable>
    </div>

    <!-- <div class="filter-container mt-2">
      <div class="form-col-container filter-container-highlight-custom pl-4">
        <div class="d-flex flex-column">
          <span class="title-text-white">ราคา/ชิ้น</span>
        </div>
        <div class="d-flex flex-column">
          <span class="title-text-white">ลำดับ</span>
          <span class="desc-text-white">{{ model.woNumber }}</span>
        </div>
      </div>
    </div> -->
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
      status: 95
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
          case 'success': {
            let check = this.model.status === this.status
            return !check
          }
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
    calculateGroupTotal(groupName, data) {
      return data
        .filter((item) => item.nameGroup === groupName)
        .reduce((total, item) => total + Number(item.totalPrice), 0)
    },
    calculateGroupTotalPerQty(groupName, data) {
      return (
        data
          .filter((item) => item.nameGroup === groupName)
          .reduce((total, item) => total + Number(item.totalPrice), 0) /
        (this.model.productQty || 1)
      )
    },

    caltotalPrice(data) {
      let total = 0
      data.forEach((item) => {
        total += Number(item.totalPrice)
      })
      return total.toFixed(2)
    },

    calGroupPricePerQty(groupName) {
      const groupTotal = this.calculateGroupTotal(groupName, this.modelPrice)
      return (groupTotal / (this.model.productQty || 1)).toFixed(2)
    },

    calPricePerQty(data) {
      const total = this.caltotalPrice(data)
      console.log('total', total, this.model.productQty)
      let price = (total / this.model.productQty ?? 1).toFixed(2)
      console.log('price', price)

      return price
    },
    calEachPricePerQty(total) {
      //const total = this.caltotalPrice(data)
      //console.log('total', total, this.model.productQty)
      let price = (total / this.model.productQty ?? 1).toFixed(2)
      console.log('price', price)

      return price
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

    receiptProduct() {
      //console.log('transfer')
      this.$emit('receipt', this.model, this.status)
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

.filter-container-highlight-custom {
  border: 1px solid #dddddd;
  border-radius: 5px;

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: var(--base-font-color);
  padding: 10px;
}
.filter-container-custom {
  border: 1px solid #dddddd;
  border-radius: 5px;

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  padding: 10px;
  height: calc(100vh - 220px);
  overflow: auto;
}
.type-container {
  font-size: 13px;
  font-weight: bold;
  color: var(--base-font-color);
  //padding: 5px;
  //margin: 0px 0px 10px 0px;
}
.type-container-footer {
  font-size: 12px;
  font-weight: bold;
  //color: var(--base-font-color);
  padding: 5px;
  //margin: 0px 0px 10px 0px;
}

.form-col-2equal-container {
  display: grid;
  //gap: 10px;
  padding: 0px;
  grid-template-columns: 1fr 1fr; // แบ่งเป็น 2 columns เท่าๆกัน
}
</style>
