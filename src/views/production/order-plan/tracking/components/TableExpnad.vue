<template>
  <div class="table-expand-container">
    <loading :isLoading="isLoading" :fullPage="isLoadingFullPage"></loading>
    <div class="row form-group">
      <div class="col-md-12">
        <DataTable class="expnad-table-container" :value="data" showGridlines>
          <Column field="goldNavigation.code" header="ประเภททอง">
            <template #body="prop">
              {{ `${prop.data.goldNavigation.code}: ${prop.data.goldNavigation.nameTh}` }}
            </template>
          </Column>
          <Column field="goldSizeNavigation.code" header="ขนาดทอง">
            <template #body="prop">
              {{ `${prop.data.goldSizeNavigation.nameTh}` }}
            </template>
          </Column>
          <Column field="gemNavigation.code" header="ประเภทพลอย">
            <template #body="prop">
              {{ `${prop.data.gemNavigation.code}: ${prop.data.gemNavigation.nameTh}` }}
            </template>
          </Column>
          <Column field="gemShapeNavigation.code" header="รูปร่างพลอย">
            <template #body="prop">
              {{ `${prop.data.gemShapeNavigation.code}: ${prop.data.gemShapeNavigation.nameTh}` }}
            </template>
          </Column>
          <Column field="gemSize" header="ขนาดพลอย"> </Column>
          <Column field="gemQty" header="จำนวน">
            <template #body="prop">
              {{ `${prop.data.gemQty}  ${prop.data.gemUnit}` }}
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script>
import loading from '@/components/overlay/loading-overlay.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import api from '@/axios/axios-config.js'
export default {
  components: { DataTable, Column, loading },
  props: {
    formValue: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  watch: {
    async formValue() {
      //this.take = 10
      //this.skip = 0
      //   if (value) {
      //     console.log('api call')
      //     await this.fetchData()
      //   } else {
      //     console.log('not api call')
      //   }
    }
  },
  data() {
    return { data: [], isLoading: false, isLoadingFullPage: false }
  },
  methods: {
    // ----- api -----
    async fetchData() {
      try {
        this.isLoading = true
        const param = {
          id: this.formValue.id
        }
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanMaterialSearch', param)
        if (res) {
          //this.data = [...res.data]
          this.data = [...res]
        }
        //console.log(this.data)
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  },
  created() {
    //console.log(this.formValue)
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped></style>
