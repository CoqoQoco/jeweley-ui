<template>
  <div class="filter-container-custom">
    <div class="filter-container-highlight">
      <div class="d-flex justify-content-between">
        <!-- time -->
        <div class="title-text-white vertical-center-container">
          <span class="bi bi-clock-history mr-2"></span>
          <span>ประวัติประเมินราคา</span>
          <!-- <span v-if="modelPlanStatus">{{ formatDateTime(modelPlanStatus.updateDate) }}</span> -->
          <!-- <span v-else class="ml-2">---</span> -->
        </div>

        <!-- action -->
        <div>
          <button
            :class="['btn btn-sm ml-2', checkBtn('close') ? 'btn-secondary' : 'btn-primary']"
            title="พิมพ์แบบ"
            :disabled="checkBtn('close')"
          >
            <span class="bi bi-printer"></span>
          </button>
          <button
            :class="['btn btn-sm ml-2', checkBtn('add') ? 'btn-secondary' : 'btn-green']"
            title="ประเมินราคา"
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

          <button
            :class="['btn btn-sm ml-2', checkBtn('price') ? 'btn-secondary' : 'btn-green']"
            @click="goPrice"
          >
            <span class="bi bi-coin"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

//import DataTable from 'primevue/datatable'
//import Column from 'primevue/column'
import Papa from 'papaparse'

import { formatDate, formatDateTime } from '@/services/utils/dayjs'
import api from '@/axios/axios-config.js'
import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  components: {
    //DataTable,
    //Column
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
    modelPlanStatus() {
      const tbtProductionPlanStatusHeader = this.modelValue.tbtProductionPlanStatusHeader

      if (_.isEmpty(tbtProductionPlanStatusHeader)) {
        return null
      } else {
        var value = tbtProductionPlanStatusHeader.find((x) => x.status === this.status)
        console.log('modelPlanStatus', value)
        return value
      }
    },
    modelMat() {
      return this.modelMatValue
    },
    modelStatus() {
      return this.masterStatus
    },
    modelGold() {
      return this.masterGold
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
      console.log('checkBtn', this.modelPlanStatus)
      const disStatus = [100, 500]
      if (!disStatus.includes(this.model.status)) {
        switch (action) {
          case 'print':
            return this.modelPlanStatus ? false : true
          case 'add':
            return this.modelPlanStatus ? true : false
          case 'edit':
            return this.modelPlanStatus ? false : true
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
        `รายการเพชรเเละพลอย แผนผลิตเลขที่ [${this.modelValue.wo}-${this.modelValue.woNumber}].csv`
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
</style>
