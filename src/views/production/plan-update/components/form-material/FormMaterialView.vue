<template>
  <div class="form-container">
    <div class="data-container">
      <DataTable
        :value="modelMatValue"
        class="p-datatable-sm"
        showGridlines
        scrollable
        scrollHeight="calc(100vh - 280px)"
      >
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
        <template #footer>
          <div>
            <button class="btn btn-sm btn-warning" type="button" @click="onShowFormMaterialUpdate">
              <span class="mr-2"><i class="bi bi-plus"></i></span>
              <span>เพิ่มส่วนประกอบ</span>
            </button>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import api from '@/axios/axios-config.js'
import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  components: {
    DataTable,
    Column
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
    }
  },
  computed: {
    model() {
      console.log(this.modelMatValue)
      return this.modelMatValue
    }
  },
  //   watch: {
  //     async modelMatValue(value) {
  //       console.log(value)
  //       this.mat = [...value]
  //     }
  //   },
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
        `${item.goldNavigation.code}-${item.goldNavigation.nameTh}, จำนวน ${item.goldQty}`,
        'ยืนยันลบส่วนประกอบ',
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
    }
  }
}
</script>

<style lang="scss" scoped>
.data-container {
  border: 1px solid #dddddd;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  padding: 10px;
  height: calc(100vh - 210px);
  overflow: auto;
}
</style>
