<template>
  <div>
    <div class="filter-container-highlight">
      <div class="d-flex justify-content-between">
        <div class="title-text-white vertical-center-container">
          <span class="bi bi-list-check mr-2"></span>
          <span>แผนผลิตผสมทอง</span>
        </div>
        <div>
          <div class="btn-add" title="เพิ่ม" type="button" @click="onShowFormMaterialUpdate">
            <span class="bi bi-plus"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- plan gold -->
    <div>
      <DataTable :value="modelMatValue" class="p-datatable-sm" showGridlines scrollable>
        <Column style="width: 50px; text-align: center">
          <template #body="prop">
            <button
              class="btn btn-sm btn-main"
              title="ลบส่วนประกอบ"
              type="button"
              @click="onDeletItem(prop.data)"
            >
              <i class="bi bi-trash-fill"></i>
            </button>
          </template>
        </Column>
        <Column field="goldNavigation" header="ประเภททอง">
          <template #body="prop">
            <div v-if="prop.data.goldNavigation?.code">
              {{ `${prop.data.goldNavigation?.code}: ${prop.data.goldNavigation?.nameTh}` }}
            </div>
            <div v-else>-</div>
          </template>
        </Column>
        <Column field="goldSizeNavigation" header="เปอร์เซ็นทอง">
          <template #body="prop">
            <div v-if="prop.data.goldSizeNavigation?.code">
              {{ `${prop.data.goldSizeNavigation?.nameTh}` }}
            </div>
            <div v-else>-</div>
          </template>
        </Column>
        <Column field="goldQty" header="จำนวนทอง">
          <template #body="prop">
            {{ `${prop.data.goldQty ?? '-'}` }}
          </template>
        </Column>
        <Column field="gemNavigation" header="ประเภทพลอย">
          <template #body="prop">
            <div v-if="prop.data.gemNavigation?.code">
              {{ `${prop.data.gemNavigation?.code}: ${prop.data.gemNavigation?.nameTh}` }}
            </div>
            <div v-else>-</div>
          </template>
        </Column>
        <Column field="gemShapeNavigation.code" header="รูปร่าง/ขนาด พลอย">
          <template #body="prop">
            <div v-if="prop.data.gemShapeNavigation?.code">
              {{
                `${prop.data.gemShapeNavigation?.code}: ${prop.data.gemShapeNavigation?.nameTh}  ${
                  prop.data.gemSize ?? ``
                }`
              }}
            </div>
            <div v-else>-</div>
          </template>
        </Column>
        <!-- <Column field="gemSize" header="ขนาดพลอย"> </Column> -->
        <Column field="gemQty" header="จำนวนพลอย">
          <template #body="prop">
            {{ `${prop.data.gemQty ?? '-'}  ${prop.data.gemQty ? prop.data.gemUnit : ''}` }}
          </template>
        </Column>
        <Column field="gemQty" header="น้ำหนักพลอย">
          <template #body="prop">
            {{
              `${prop.data.gemWeight ?? '-'}  ${prop.data.gemWeight ? prop.data.gemWeightUnit : ''}`
            }}
          </template>
        </Column>
        <Column field="gemQty" header="จำนวนเพชร">
          <template #body="prop">
            {{
              `${prop.data.diamondQty ?? '-'}  ${prop.data.diamondQty ? prop.data.diamondUnit : ''}`
            }}
          </template>
        </Column>
        <Column field="gemQty" header="น้ำหนักเพชร">
          <template #body="prop">
            {{
              `${prop.data.diamondWeight ?? '-'}  ${
                prop.data.diamondWeight ? prop.data.diamondWeightUnit : ''
              }`
            }}
          </template>
        </Column>
        <Column field="diamondSize" header="ขนาดเพชร">
          <template #body="prop">
            {{ `${prop.data.diamondSize ?? '-'}` }}
          </template>
        </Column>
        <Column field="diamondQuality" header="คุณภาพเพชร">
          <template #body="prop">
            {{ `${prop.data.diamondQuality ?? '-'}` }}
          </template>
        </Column>
        <!-- <template #footer>
            <div>
              <button class="btn btn-sm btn-warning" type="button" @click="onShowFormMaterialUpdate">
                <span class="mr-2"><i class="bi bi-plus"></i></span>
                <span>เพิ่มส่วนประกอบ</span>
              </button>
            </div>
          </template> -->
      </DataTable>
    </div>

    <div class="filter-container-highlight mt-3">
      <div class="d-flex justify-content-between">
        <div class="title-text-white vertical-center-container">
          <span class="bi bi-list-check mr-2"></span>
          <span>รายการเบิกผสมทอง</span>
        </div>
      </div>
    </div>

    <!-- plan cost gold -->
    <div>
      <DataTable :value="modelGold" class="p-datatable-sm" showGridlines scrollable>
        <Column field="goldCode" header="ประเภททอง" style="min-width: 100px">
          <template #body="prop">
            <div v-if="prop.data.goldCode">
              {{ `${prop.data.goldCode}: ${prop.data.goldName}` }}
            </div>
            <div v-else>-</div>
          </template>
        </Column>
        <Column field="goldSizeName" header="เปอร์เซ็นทอง" style="min-width: 100px"> </Column>
        <Column field="goldReceipt" header="สูตรผสมทอง" style="min-width: 100px"> </Column>
        <Column field="bookNo" header="เล่มที่" style="min-width: 100px"> </Column>
        <Column field="no" header="เลขที่" style="min-width: 100px"> </Column>
        <Column field="goldReceipt" header="สูตรผสมทอง" style="min-width: 100px"> </Column>
        <Column field="cost" header="ราคา" style="min-width: 100px"> </Column>
        <Column header="วันที่" field="assignDate" style="min-width: 150px">
          <template #body="prop">
            <div>
              <span>{{ formatDate(prop.data.assignDate) }}</span>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- plan gold history -->
    <div class="mt-3">
      <planOverview :modelValue="modelHerder"></planOverview>
    </div>
  </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import api from '@/axios/axios-helper.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

import planOverview from './plan-overview.vue'

export default {
  components: {
    DataTable,
    Column,
    planOverview
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
    modelGoldItem: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    model() {
      console.log(this.modelMatValue)
      return this.modelMatValue
    },
    modelGold() {
      return this.modelGoldItem
    },
    modelHerder() {
      return this.modelValue
    }
  },

  data() {
    return {
      // --- from --- //
      mat: []
    }
  },
  methods: {
    // --- controller --- //
    onDeletItem(item) {
      swAlert.confirmSubmit(
        `${item.goldNavigation.code}-${item.goldNavigation.nameTh}, จำนวน ${item.goldQty ?? 0}`,
        'ยืนยันลบ',
        async () => {
          await this.DeletMatItem(item)
        },
        null,
        null
      )
    },
    onShowFormMaterialUpdate() {
      //console.log('test')
      this.$emit('onShowFormMaterialUpdate')
    },
    // --- APIs --- //
    async DeletMatItem(item) {
      try {
        this.isLoading = true

        const params = {
          planId: this.modelValue.id,
          wo: this.modelValue.wo,
          woNumber: this.modelValue.woNumber,
          materialId: item.id
        }

        //console.log(params)
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanDeleteMaterial', params)
        if (res) {
          swAlert.success(
            ``,
            '',
            async () => {
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
    },

    // ------ helper ------//
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form.scss';

.btn-add {
  display: grid;
  place-items: center;
  background-color: white;
  width: 20px;
}
</style>
