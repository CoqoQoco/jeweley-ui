<template>
  <div class="create-container">
    <loading :isLoading="isLoading"></loading>
    <form @submit.prevent="onSubmitPlan">
      <div class="zone-container">
        <div class="title-header mb-3">
          <div class="font-weight-bold">
            <span class="mr-2"><i class="bi bi-card-list"></i></span>
            <span>ส่วนที่ 1 ระบุรายละเอียดใบจ่าย-รับคืน</span>
          </div>
        </div>
        <div class="form-header-container">
          <div class="form-header-left-container">
            <div class="form-header-left-row-container">
              <div>
                <span class="title-text">เลขที่ W.O.</span>
                <input type="text" class="form-control" v-model="form.wo" required />
              </div>
              <div>
                <span class="title-text">ลำดับ W.O.</span>
                <input type="number" min="1" class="form-control" v-model="form.nowo" required />
              </div>
              <div>
                <span class="title-text">เเม่พิมพ์</span>
                <AutoComplete
                  v-model="form.mold"
                  :suggestions="moldItemSearch"
                  @complete="onSearchMold"
                  placeholder="กรอกรหัสเเม่พิมพ์ ...."
                  :class="val.isValMold === true ? `p-invalid` : ``"
                  forceSelection
                  @item-select="onSelectMold"
                />
              </div>
            </div>
            <div class="form-header-left-row-container">
              <div>
                <span class="title-text">รหัสลูกค้า</span>
                <input type="text" class="form-control" v-model="form.customerNumber" required />
              </div>
              <div>
                <span class="title-text">ประเภทลูกค้า</span>
                <Dropdown
                  v-model="form.customerType"
                  :options="masterCustomer"
                  optionLabel="description"
                  :class="val.isValCustomerType === true ? `p-invalid` : ``"
                  :showClear="form.customerType ? true : false"
                />
              </div>
              <div>
                <span class="title-text">วันส่งงานลูกค้า</span>
                <Calendar v-model="form.requestDate" showIcon showButtonBar required />
              </div>
            </div>
            <div class="form-header-left-row-container">
              <div>
                <span class="title-text">รหัสสินค้า</span>
                <input type="text" class="form-control" v-model="form.productNumber" />
              </div>
              <div>
                <span class="title-text">ชื่อสินค้า</span>
                <input type="text" class="form-control" v-model="form.productName" required />
              </div>
              <div>
                <span class="title-text">ประเภทสินค้า</span>
                <Dropdown
                  v-model="form.productType"
                  :options="masterProduct"
                  optionLabel="description"
                  :class="val.isValProductType === true ? `p-invalid` : ``"
                  :showClear="form.productType ? true : false"
                />
              </div>
            </div>
            <div class="form-header-left-row-custom-container">
              <div>
                <span class="title-text">รายละเอียดสินค้า</span>
                <textarea class="form-control" v-model="form.productDetail" required> </textarea>
              </div>
              <div>
                <span class="title-text">หมายเหตุ</span>
                <textarea class="form-control" v-model="form.remark"> </textarea>
              </div>
            </div>
            <div class="form-header-left-row-container">
              <div>
                <span class="title-text">จำนวนสินค้า</span>
                <input
                  type="number"
                  min="1"
                  class="form-control"
                  v-model="form.productQty"
                  required
                />
              </div>
              <div>
                <span class="title-text">หน่วย</span>
                <input type="text" class="form-control" v-model="form.productQtyUnit" required />
              </div>
            </div>
          </div>
          <div class="form-header-right-container">
            <div>
              <span class="title-text ml-2">รูปเเม่พิมพ์</span>
              <div class="image-container">
                <div v-if="imageurl">
                  <img class="image-preview" :src="imageurl" alt="Image" preview />
                </div>
                <div v-else>
                  <img
                    class="image-preview"
                    src="@/assets/duangkaew-logo.png"
                    alt="Image"
                    preview
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="zone-container">
        <div class="title-header mb-3">
          <div class="font-weight-bold">
            <span class="mr-2"><i class="bi bi-card-list"></i></span>
            <span>ส่วนที่ 2 ระบุส่วนประกอบการผลิต</span>
          </div>
        </div>
        <div>
          <DataTable
            class="p-datatable-sm"
            showGridlines
            v-model:editingRows="editingRows"
            :value="form.material"
            editMode="row"
            dataKey="id"
            @row-edit-save="onRowEditSave"
            :pt="{
              table: { style: 'min-width: 50rem' },
              column: {
                bodycell: ({ state }) => ({
                  style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                })
              }
            }"
          >
            <Column :rowEditor="true" style="min-width: 100px" bodyStyle="text-align:center">
            </Column>
            <Column style="width: 10px">
              <template #body="prop">
                <div class="btn btn-danger text-center w-100" @click="onDelMaterial(prop.data)">
                  <i class="bi bi-trash-fill"></i>
                </div>
              </template>
            </Column>
            <Column field="gold" header="ประเภททอง/เงิน" style="min-width: 150px">
              <template #body="slotProps">
                <span>{{ slotProps.data.gold?.description }}</span>
              </template>
              <template #editor="{ data, field }">
                <Dropdown
                  v-model="data[field]"
                  :options="masterGold"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  placeholder="เลือกทอง"
                  :showClear="data[field] ? true : false"
                >
                </Dropdown>
              </template>
            </Column>
            <Column field="goldSize" header="เปอร์เซ็น" style="min-width: 150px">
              <template #body="slotProps">
                <span>{{ slotProps.data.goldSize?.description }}</span>
              </template>
              <template #editor="{ data, field }">
                <Dropdown
                  v-model="data[field]"
                  :options="masterGoldSize"
                  optionLabel="description"
                  placeholder="เลือกเปอร์เซ็น"
                  class="w-full md:w-14rem"
                  :showClear="data[field] ? true : false"
                >
                </Dropdown>
              </template>
            </Column>
            <Column field="goldQty" header="จำนวนทอง/เงิน" style="min-width: 100px">
              <template #editor="{ data, field }">
                <input
                  type="number"
                  min="1"
                  :class="data[field] ? `` : `bg-warning`"
                  class="form-control"
                  v-model="data[field]"
                />
              </template>
            </Column>
            <Column field="gem" header="ประเภทพลอย" style="min-width: 150px">
              <template #body="slotProps">
                <span>{{ slotProps.data.gem?.description }}</span>
              </template>
              <template #editor="{ data, field }">
                <Dropdown
                  v-model="data[field]"
                  :options="masterGem"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  placeholder="เลือกพลอย"
                  :showClear="data[field] ? true : false"
                >
                </Dropdown>
              </template>
            </Column>
            <Column field="gemShape" header="รูปร่างพลอย" style="min-width: 150px">
              <template #body="slotProps">
                <span>{{ slotProps.data.gemShape?.description }}</span>
              </template>
              <template #editor="{ data, field }">
                <Dropdown
                  v-model="data[field]"
                  :options="masterGemShape"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  placeholder="เลือกรูปร่าง"
                  :showClear="data[field] ? true : false"
                >
                </Dropdown>
              </template>
            </Column>
            <Column field="gemQty" header="จำนวน" style="min-width: 100px">
              <template #editor="{ data, field }">
                <input
                  type="number"
                  min="1"
                  :class="data[field] ? `` : `bg-warning`"
                  class="form-control"
                  v-model="data[field]"
                />
              </template>
            </Column>
            <Column field="gemUnit" header="หน่วย" style="min-width: 100px">
              <template #editor="{ data, field }">
                <input
                  type="text"
                  :class="data[field] ? `` : `bg-warning`"
                  class="form-control"
                  v-model="data[field]"
                />
              </template>
            </Column>
            <Column field="gemWeight" header="น้ำหนัก" style="min-width: 100px">
              <template #editor="{ data, field }">
                <input
                  type="text"
                  :class="data[field] ? `` : `bg-warning`"
                  class="form-control"
                  v-model="data[field]"
                />
              </template>
            </Column>
            <Column field="gemWeightUnit" header="หน่วย" style="min-width: 100px">
              <template #editor="{ data, field }">
                <input
                  type="text"
                  :class="data[field] ? `` : `bg-warning`"
                  class="form-control"
                  v-model="data[field]"
                />
              </template>
            </Column>
            <Column field="diamondQty" header="จำนวนเพชร" style="min-width: 100px">
              <template #editor="{ data, field }">
                <input
                  type="number"
                  min="1"
                  :class="data[field] ? `` : `bg-warning`"
                  class="form-control"
                  v-model="data[field]"
                />
              </template>
            </Column>
            <Column field="diamondUnit" header="หน่วย" style="min-width: 100px">
              <template #editor="{ data, field }">
                <input
                  type="text"
                  :class="data[field] ? `` : `bg-warning`"
                  class="form-control"
                  v-model="data[field]"
                />
              </template>
            </Column>
            <Column field="diamondSize" header="ขนาดเพชร" style="min-width: 100px">
              <template #editor="{ data, field }">
                <input
                  type="text"
                  :class="data[field] ? `` : `bg-warning`"
                  class="form-control"
                  v-model="data[field]"
                />
              </template>
            </Column>
            <Column field="diamondWeight" header="น้ำหนักเพชร" style="min-width: 100px">
              <template #editor="{ data, field }">
                <input
                  type="text"
                  :class="data[field] ? `` : `bg-warning`"
                  class="form-control"
                  v-model="data[field]"
                />
              </template>
            </Column>
            <Column field="diamondWeightUnit" header="หน่วย" style="min-width: 100px">
              <template #editor="{ data, field }">
                <input
                  type="text"
                  :class="data[field] ? `` : `bg-warning`"
                  class="form-control"
                  v-model="data[field]"
                />
              </template>
            </Column>
            <Column field="diamondQuality" header="คุณภาพเพชร" style="min-width: 200px">
              <template #editor="{ data, field }">
                <input
                  type="text"
                  :class="data[field] ? `` : `bg-warning`"
                  class="form-control"
                  v-model="data[field]"
                />
              </template>
            </Column>
            <template #footer>
              <div class="d-flex justify-content-between">
                <div>ทั้งหมด {{ this.form.material.length }} รายการ</div>
                <div class="btn btn-sm btn-warning" @click="onAddMaterial">
                  <spna class="text-center">
                    <i class="bi bi-plus"></i>
                  </spna>
                  <!-- <span>เพิ่ม</span> -->
                </div>
              </div>
            </template>
          </DataTable>
        </div>
      </div>
      <div class="zone-container d-flex justify-content-end">
        <button class="btn btn-sm btn-main" type="submit">
          <span class="mr-2">
            <i class="bi bi-gem"></i>
          </span>
          <span>สร้างใบจ่าย-รับคืนงาน</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import AutoComplete from 'primevue/autocomplete'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import api from '@/axios/axios-config.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { formatISOString } from '@/services/utils/dayjs'

const interfaceForm = {
  wo: '',
  nowo: null,
  mold: '',
  customerNumber: '',
  customerType: '',
  requestDate: new Date().toISOString().substr(0, 10),
  productNumber: '',
  productName: '',
  productType: '',
  productQty: '',
  productQtyUnit: '',
  productDetail: '',
  remark: '',
  material: []
}
const interfaceMaterial = {
  //   gold: {
  //     id: null,
  //     code: null,
  //     nameTh: null,
  //     nameEn: null,
  //     description: null
  //   },
  gold: null,
  goldSize: null,
  // goldSize: {
  //   id: null,
  //   code: null,
  //   nameTh: null,
  //   nameEn: null,
  //   description: null
  // },
  goldQty: null,
  gem: null,
  gemShape: null,
  gemQty: null,
  gemUnit: null,
  gemWeight: null,
  gemWeightUnit: null,
  gemSize: null,
  diamondQty: null,
  diamondUnit: null,
  diamondQuality: null,
  diamondWeight: null,
  diamondWeightUnit: null,
  diamondSize: null
}
const interfaceValid = {
  isValMold: false,
  isValCustomerType: false,
  isValProductType: false
}
export default {
  components: {
    loading,
    AutoComplete,
    Dropdown,
    Calendar,
    DataTable,
    Column
  },
  watch: {
    'form.mold'() {
      if (this.form.mold) {
        this.val.isValMold = false
      }
    },
    'form.customerType'() {
      if (this.form.customerType) {
        this.val.isValCustomerType = false
      }
    },
    'form.productType'() {
      if (this.form.productType) {
        this.val.isValProductType = false
      }
    }
  },
  data() {
    return {
      // --- flag --- //
      isLoading: false,
      autoId: 0,

      // --- from --- //
      form: {
        ...interfaceForm
      },
      val: {
        ...interfaceValid
      },
      imageurl: '',

      // --- master --- //
      moldItemSearch: [],
      masterCustomer: [],
      masterProduct: [],
      masterGold: [],
      masterGoldSize: [],
      masterGem: [],
      masterGemShape: [],

      // ---- datatable ---- //
      editingRows: []
    }
  },
  methods: {
    // --- controller --- //
    onSubmitPlan() {
      if (this.validateForm()) {
        swAlert.confirmSubmit(
          `W.O. ${this.form.wo}-${this.form.nowo} `,
          'ยืนยันสร้างใบจ่าย-รับคืน',
          async () => {
            await this.submitPlan()
          },
          null,
          null
        )
      }
    },
    validateForm() {
      if (!this.form.mold) {
        this.val = {
          isValMold: true
        }
        return false
      }
      if (!this.form.customerType) {
        this.val = {
          isValCustomerType: true
        }
        return false
      }
      if (!this.form.productType) {
        this.val = {
          isValProductType: true
        }
        return false
      }

      return true
    },
    onResetPage() {
      this.form = {
        ...interfaceForm
      }
    },

    // --- datatable --- //
    onRowEditSave(event) {
      let { newData, index } = event
      this.form.material[index] = newData
    },
    onDelMaterial(item) {
      const index = this.form.material.indexOf(item)
      this.form.material.splice(index, 1)
    },
    onAddMaterial() {
      const addMaterial = {
        id: ++this.autoId,
        ...interfaceMaterial
      }
      this.form.material.push(addMaterial)
    },

    // --- APIs --- //
    async onSearchMold(e) {
      try {
        //this.isLoading = true

        const param = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null
          }
        }

        const res = await api.jewelry.post('Mold/SearchMold', param)
        if (res) {
          this.moldItemSearch = res.data.map((x) => `${x.code}`)
        }
      } catch (error) {
        console.log(error)
      }
    },
    async onSelectMold(e) {
      try {
        const param = {
          imageName: `${e.value}-Mold.png`
        }
        const res = await api.jewelry.get('FileExtension/GetMoldImage', param)

        if (res) {
          this.imageurl = `data:image/png;base64,${res}`
        }
      } catch (error) {
        console.log(error)
      }
    },
    async submitPlan() {
      try {
        //console.log('submitPlan')
        this.isLoading = true
        //console.log(this.form)

        let params = new FormData()
        params.append('wo', this.form.wo)
        params.append('woNumber', this.form.nowo)
        params.append('mold', this.form.mold)

        params.append('customerNumber', this.form.customerNumber)
        params.append('customerType', this.form.customerType.code)
        params.append('requestDate', formatISOString(this.form.requestDate))

        params.append('productNumber', this.form.productNumber)
        params.append('productName', this.form.productName)
        params.append('productType', this.form.productType ? this.form.productType.code : '')

        //console.log(productQty);

        params.append('productQty', this.form.productQty)
        params.append('productQtyUnit', this.form.productQtyUnit)

        params.append('productDetail', this.form.productDetail)
        params.append('remark', this.form.remark)

        //console.log(this.form.material)
        params.append('material', JSON.stringify(this.form.material))
        let options = {
          headers: {
            'Content-Type': `multipart/form-data`
          }
        }
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanCreate', params, options)

        //let res = true
        if (res) {
          //this.isResetImage = !this.isResetImage
          swAlert.success(
            `W.O. ${this.form.wo}-${this.form.nowo} `,
            'สร้างใบจ่าย-รับคืน สำเร็จ',
            () => {
              this.onResetPage()
              this.$router.push('/plan-order-tracking')
            },
            null,
            null
          )
          //this.onClearVal()
        }

        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },

    async fetchMasterCustomerType() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterCustomerType')
        if (res) {
          this.masterCustomer = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterProductType() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterProductType')
        if (res) {
          this.masterProduct = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterGold() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGold')
        if (res) {
          this.masterGold = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterGoldSize() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGoldSize')
        if (res) {
          this.masterGoldSize = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterGem() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGem')
        if (res) {
          this.masterGem = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterGemShape() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGemShape')
        if (res) {
          this.masterGemShape = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  },
  mounted() {
    this.fetchMasterCustomerType()
    this.fetchMasterProductType()
    this.fetchMasterGold()
    this.fetchMasterGoldSize()
    this.fetchMasterGem()
    this.fetchMasterGemShape()
  }
}
</script>

<style lang="scss" scoped>
.zone-container {
  border: 1px solid #dddddd;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  padding: 20px 40px;
  margin-bottom: 20px;
}
.title-header {
  font-size: 15px;
  display: grid;
  color: var(--base-font-color);
}
.title-text {
  color: var(--base-font-color);
}
.form-header-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}
.form-header-left-row-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}
.form-header-left-row-custom-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.image-container {
  display: grid;
  place-items: center;
  border: 1px solid var(--base-color);
  border-radius: 8px;
  //height: 500px;
  margin-top: 5px;
}

.image-preview {
  max-width: 300px;
  height: auto;
  //border: 1px solid var(--base-color);
  border-radius: 8px;
  object-fit: contain;
  padding: 20px 0px;
}
</style>
