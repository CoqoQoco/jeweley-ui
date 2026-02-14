<template>
  <div class="container-create-wo">
    <form @submit.prevent="onSubmitPlan">
      <div class="filter-container-main">
        <pageTitle
          title="สร้างใบจ่าย-รับคืนงาน"
          description="หน้าสร้างใบจ่าย-รับคืนงาน เเละรายละเอียดต่างๆ"
          :isShowBtnClose="false"
          :isShowRightSlot="true"
        >
          <template #rightSlot>
            <button
              class="btn btn-sm btn-dark mr-2"
              type="button"
              @click="onModifyPlan"
              title="งานแปลง"
            >
              <span class="bi bi-collection mr-2"></span>
              <span>เลือกเเบบงาน</span>
            </button>
          </template>
        </pageTitle>

        <div class="p-2">
          <div class="title-text-lg-bg mt-1">
            <span class="bi bi-card-list mr-2"></span>
            <span>ส่วนที่ 1 ระบุรายละเอียดใบจ่าย-รับคืน</span>
          </div>

          <!-- ส่วนที่ 1  -->
          <div class="form-col-container border-container p-4">
            <!-- data -->
            <div>
              <!-- row 1  -->
              <div class="form-col-sm-container">
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
                    placeholder="รหัสเเม่พิมพ์ ...."
                    :class="val.isValMold === true ? `p-invalid` : ``"
                    forceSelection
                    @item-select="onSelectMold"
                  />
                </div>
              </div>

              <!-- row 2  -->
              <div class="form-col-sm-container mt-1">
                <div>
                  <span class="title-text">รหัสลูกค้า</span>
                  <AutoComplete
                    v-model="form.customerNumber"
                    :suggestions="customerItemSearch"
                    @complete="onSearchCustomer"
                    placeholder="กรอกรหัสลูกค้า ...."
                    :class="val.isValCustomerNumber === true ? `p-invalid` : ``"
                    forceSelection
                  />
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

              <!-- row 3  -->
              <div class="form-col-sm-container mt-1">
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

              <!-- row 4  -->
              <div class="form-col-sm-container mt-1">
                <div>
                  <span class="title-text">รายละเอียดสินค้า</span>
                  <textarea class="form-control" v-model="form.productDetail" required> </textarea>
                </div>
              </div>

              <!-- row 5  -->
              <div class="form-col-sm-container mt-1">
                <div>
                  <span class="title-text">หมายเหตุ</span>
                  <textarea class="form-control" v-model="form.remark"> </textarea>
                </div>
              </div>

              <!-- row 6  -->
              <div class="form-col-sm-container mt-1">
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
                <div></div>
              </div>

              <!-- row 7  -->
              <div class="form-col-sm-container mt-1">
                <div>
                  <span class="title-text">สีของทองทอง/เงิน</span>
                  <Dropdown
                    v-model="form.gold"
                    :options="masterGold"
                    optionLabel="description"
                    class="w-full md:w-14rem"
                    placeholder="เลือกทอง"
                    :class="val.isValGold === true ? `p-invalid` : ``"
                    :showClear="form.gold ? true : false"
                  >
                  </Dropdown>
                </div>
                <div>
                  <span class="title-text">ประเภททอง/เงิน</span>
                  <Dropdown
                    v-model="form.goldSize"
                    :options="masterGoldSize"
                    optionLabel="description"
                    placeholder="เลือกเปอร์เซ็น"
                    class="w-full md:w-14rem"
                    :class="val.isValGoldSize === true ? `p-invalid` : ``"
                    :showClear="form.goldSize ? true : false"
                  >
                  </Dropdown>
                </div>
                <div></div>
              </div>
            </div>

            <!-- image -->
            <div>
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

          <div class="title-text-lg-bg mt-4">
            <span class="bi bi-card-list mr-2"></span>
            <span>ส่วนที่ 2 ระบุส่วนประกอบการผลิต</span>
          </div>
          <!-- ส่วนที่ 2  -->
          <div class="form-col-container border-container p-2">
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
              <Column style="min-width: 60px">
                <template #body="prop">
                  <div
                    class="btn btn-sm btn-danger text-center w-100"
                    @click="onDelMaterial(prop.data)"
                  >
                    <i class="bi bi-trash-fill"></i>
                  </div>
                </template>
              </Column>
              <Column field="gold" header="สีของทอง/เงิน" style="min-width: 150px">
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
              <!-- <Column field="gemSize" header="ขนาดพลอย" style="min-width: 150px">
              <template #body="slotProps">
                <span>{{ slotProps.data.gemSize?.description }}</span>
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
            </Column> -->
              <Column field="gemSize" header="ขนาดพลอย" style="min-width: 100px">
                <template #editor="{ data, field }">
                  <input
                    type="text"
                    :class="data[field] ? `` : `bg-warning`"
                    class="form-control"
                    v-model="data[field]"
                  />
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
                  <div class="btn btn-sm btn-dark" @click="onAddMaterial">
                    <span class="text-center">
                      <i class="bi bi-plus"></i>
                    </span>
                    <!-- <span>เพิ่ม</span> -->
                  </div>
                </div>
              </template>
            </DataTable>
          </div>

          <!-- action -->
          <div class="submit-container mt-2">
            <div class="check-return-container mr-4 p-1">
              <Checkbox v-model="form.isModifyPlan" :binary="true" />
              <span for="ingredient1" class="ml-2 title-text">งานแปลงสินค้า</span>
            </div>
            <button class="btn btn-sm btn-main" type="submit">
              <span class="bi bi-calendar-check mr-2"> </span>
              <span>สร้างใบจ่าย-รับคืนงาน</span>
            </button>
          </div>
        </div>
      </div>
    </form>

    <modifyPlanView
      :isShow="isShow.modifyPlan"
      @modifyPlan="modifyPlan"
      @closeModal="onCloseModal"
    ></modifyPlanView>
  </div>
</template>

<script>
import pageTitle from '@/components/custom/PageTitle.vue'

import AutoComplete from 'primevue/autocomplete'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Checkbox from 'primevue/checkbox'

import api from '@/axios/axios-helper.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { formatISOString } from '@/services/utils/dayjs'
import { useLoadingStore } from '@/stores/modules/master/loading-store.js'
import { getAzureBlobUrl } from '@/config/azure-storage-config.js'

import modifyPlanView from '../modal/modify-plan-view.vue'

const interfaceForm = {
  wo: '',
  nowo: null,
  mold: '',
  customerNumber: '',
  customerType: '',
  //+ 1
  requestDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  productNumber: '',
  productName: '',
  productType: '',
  productQty: '',
  productQtyUnit: '',
  productDetail: '',
  remark: '',
  gold: null,
  goldSize: null,
  material: [],
  isModifyPlan: false
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
  isValProductType: false,
  isValCustomerNumber: false,
  isValGold: false,
  isValGoldSize: false
}

const interfaceIsShow = {
  modifyPlan: false
}
export default {
  components: {
    pageTitle,
    AutoComplete,
    Dropdown,
    Calendar,
    DataTable,
    Column,
    modifyPlanView,
    Checkbox
  },

  setup() {
    const loadingStore = useLoadingStore()
    return { loadingStore }
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
    },
    'form.customerNumber'() {
      if (this.form.customerNumber) {
        this.val.isValCustomerNumber = false
      }
    },
    'form.gold'() {
      if (this.form.gold) {
        this.val.isValGold = false
      }
    },
    'form.goldSize'() {
      if (this.form.goldSize) {
        this.val.isValGoldSize = false
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
      isShow: {
        ...interfaceIsShow
      },
      imageurl: '',

      // --- master --- //
      customerItemSearch: [],
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
      if (!this.form.customerNumber) {
        this.val = {
          isValCustomerNumber: true
        }
        return false
      }

      //gold
      if (!this.form.gold) {
        this.val = {
          isValGold: true
        }
        return false
      }

      //goldSize
      if (!this.form.goldSize) {
        this.val = {
          isValGoldSize: true
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

    onCloseModal() {
      this.isShow = {
        ...interfaceIsShow
      }
    },
    onModifyPlan() {
      this.isShow.modifyPlan = true
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
    async onSearchCustomer(e) {
      try {
        //this.isLoading = true
        const param = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null
          }
        }

        const res = await api.jewelry.post('Customer/SearchCustomer', param, { skipLoading: true })
        if (res) {
          this.customerItemSearch = res.data.map((x) => `${x.code}`)
          console.log(this.customerItemSearch)
        }
      } catch (error) {
        console.log(error)
      }
    },
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

        const res = await api.jewelry.post('Mold/SearchMold', param, { skipLoading: true })
        if (res) {
          this.moldItemSearch = res.data.map((x) => `${x.code}`)
        }
      } catch (error) {
        console.log(error)
      }
    },
    async onSelectMold(e) {
      try {
        // Build Azure Blob URL for mold image
        const blobPath = `Mold/${e.value}-Mold.png`
        this.imageurl = getAzureBlobUrl(blobPath)
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

        params.append('gold', this.form.gold ? this.form.gold.nameEn : '')
        params.append('goldSize', this.form.goldSize ? this.form.goldSize.nameEn : '')

        params.append('productQty', this.form.productQty)
        params.append('productQtyUnit', this.form.productQtyUnit)

        params.append('productDetail', this.form.productDetail)
        params.append('remark', this.form.remark)

        params.append('isModifyPlan', this.form.isModifyPlan)

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
    },

    async modifyPlan(item) {
      //console.log(item)

      this.form = {
        wo: item.data.wo,
        nowo: null,
        mold: item.data.mold,
        requestDate:  new Date(new Date().setDate(new Date().getDate() + 7)),

        customerNumber: item.data.customerNumber,
        customerType: this.masterCustomer.find((x) => x.code === item.data.customerType),

        productNumber: item.data.productNumber,
        productName: item.header.productName,
        productType: this.masterProduct.find((x) => x.code === item.data.productType),

        productQty: item.data.productQty,
        productQtyUnit: item.header.productQtyUnit,
        productDetail: item.header.productDetail,

        remark: '',
        gold: this.masterGold.find((x) => x.nameEn === item.data.gold),
        goldSize: this.masterGoldSize.find((x) => x.nameEn === item.data.goldSize),
        material: []
      }

      //get image - Build Azure Blob URL
      const blobPath = `Mold/${item.data.mold}-Mold.png`
      this.imageurl = getAzureBlobUrl(blobPath)

      if (item.headerMat.length > 0) {
        this.form.material = item.headerMat.map((x) => {
          return {
            id: ++this.autoId,
            gold: this.masterGold.find((y) => y.code === x.gold),
            goldSize: this.masterGoldSize.find((y) => y.code === x.goldSize),
            goldQty: x.goldQty,
            gem: this.masterGem.find((y) => y.code === x.gem),
            gemShape: this.masterGemShape.find((y) => y.code === x.gemShape),
            gemQty: x.gemQty,
            gemUnit: x.gemUnit,
            gemWeight: x.gemWeight,
            gemWeightUnit: x.gemWeightUnit,
            gemSize: x.gemSize,
            diamondQty: x.diamondQty,
            diamondUnit: x.diamondUnit,
            diamondQuality: x.diamondQuality,
            diamondWeight: x.diamondWeight,
            diamondWeightUnit: x.diamondWeightUnit,
            diamondSize: x.diamondSize
          }
        })
      } else {
        this.form.material = []
      }

      //alway true
      this.form.isModifyPlan = true

      console.log('modifyPlan', this.form)

      this.onCloseModal()
      this.loadingStore.hideLoading()
    }
  },

  created() {
    this,
      this.$nextTick(() => {
        this.fetchMasterCustomerType()
        this.fetchMasterProductType()
        this.fetchMasterGold()
        this.fetchMasterGoldSize()
        this.fetchMasterGem()
        this.fetchMasterGemShape()
      })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.image-container {
  display: grid;
  place-items: center;
  border: 1px solid var(--base-font-sub-color);
  height: 325px;
  border-radius: 8px;
  margin-top: 5px;
}

.image-preview {
  max-width: 300px;
  max-height: 300px;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
  padding: 20px 0px;
}

.container-create-wo {
  :deep(.p-datatable) {
    font-size: 14px !important;

    // Header Styles
    .p-datatable-thead > tr > th {
      background-color: var(--base-font-color) !important;
      padding: 0.5rem 1rem !important;
      border: 1px solid #dee2e6 !important;
      color: #ffffff !important;

      .p-column-header-content {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;

        .p-column-title {
          color: #ffffff !important;
          font-weight: normal !important;
          margin-right: 0.5rem !important;
        }

        .p-sortable-column-icon,
        .pi {
          color: #ffffff !important;
          font-size: 0.8rem !important;
        }

        .p-sortable-column-badge {
          background-color: #ffffff !important;
          color: var(--base-font-color) !important;
          font-size: 0.7rem !important;
          margin-left: 0.2rem !important;
        }
      }

      &.p-sortable-column {
        &:hover {
          background-color: var(--base-font-color) !important;
          .p-sortable-column-icon,
          .pi {
            color: #ffffff !important;
          }
        }

        &.p-highlight {
          background-color: var(--base-font-color) !important;

          .p-sortable-column-icon,
          .pi {
            color: #ffffff !important;
          }
        }
      }
    }

    // Body Styles
    .p-datatable-tbody > tr {
      &.p-highlight {
        // เพิ่ม style สำหรับ row ที่ถูก select
        background-color: #e3f2fd !important; // สีฟ้าอ่อน

        // ถ้าต้องการให้ยังคง hover effect
        &:hover {
          background-color: #bbdefb !important; // สีฟ้าที่เข้มขึ้นเมื่อ hover
        }

        // สำหรับ striped rows
        &:nth-child(even) {
          background-color: #e3f2fd !important;
        }
      }

      > td {
        padding: 3px 10px !important;
        font-size: 14px !important;
        //color: #7a1010;
        //border: 1px solid #dee2e6 !important;
      }

      &:nth-child(even) {
        background-color: #f8f9fa !important;
      }

      &:hover {
        background-color: #e9ecef !important;
      }
    }

    // Empty Message
    .p-datatable-emptymessage > td {
      text-align: center !important;
      padding: 2rem !important;
    }
  }

  // Paginator Styles
  :deep(.p-paginator) {
    font-size: 14px !important;
    padding: 5px !important;
    background: #ffffff !important;
    border: 1px solid #dee2e6 !important;
    border-radius: 0px !important;

    .p-paginator-first,
    .p-paginator-prev,
    .p-paginator-next,
    .p-paginator-last,
    .p-paginator-page {
      min-width: 2rem !important;
      height: 2rem !important;
      margin: 0 0.1rem !important;
      border: 1px solid #dee2e6 !important;

      &:not(.p-disabled):not(.p-highlight):hover {
        background: #e9ecef !important;
        border-color: #dee2e6 !important;
      }

      &.p-highlight {
        background: var(--base-font-color) !important;
        color: #ffffff !important;
      }
    }

    .p-dropdown {
      height: 2rem !important;
      width: 100px !important;
      margin: 0 0.5rem !important;

      .p-dropdown-label {
        font-size: 14px !important;
        padding: 0.25rem 0.5rem !important;
      }

      .p-dropdown-trigger {
        width: 2rem !important;
      }
    }

    .p-paginator-current {
      margin: 0 0.5rem !important;
      color: #6c757d !important;
    }
  }

  // Empty Message
  :deep(.empty-message) {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 1rem !important;
    text-align: center !important;
    color: #6c757d !important;

    i {
      font-size: 2rem !important;
      margin-bottom: 0.5rem !important;
    }

    p {
      margin: 0 !important;
      font-size: 14px !important;
    }
  }

  // Action Buttons
  .btn-action-container {
    display: flex !important;
    gap: 0.5rem !important;
    justify-content: center !important;

    .btn {
      padding: 0.25rem 0.5rem !important;

      i {
        font-size: 1rem !important;
      }
    }
  }

  // Loading Overlay
  :deep(.p-datatable-loading-overlay) {
    background: rgba(255, 255, 255, 0.8) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  // Table Scrollbar
  :deep(.p-datatable-wrapper) {
    &::-webkit-scrollbar {
      width: 6px !important;
      height: 6px !important;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #c1c1c1 !important;
      border-radius: 3px !important;
    }

    &::-webkit-scrollbar-track {
      background-color: #f1f1f1 !important;
    }
  }

  // Resize Handle
  :deep(.p-column-resizer) {
    &:hover {
      background-color: var(--base-font) !important;
    }
  }

  // Override for sort icons
  :deep(.p-datatable .p-sortable-column),
  :deep(.p-datatable .p-sortable-column.p-highlight) {
    .p-sortable-column-icon,
    .pi-sort,
    .pi-sort-amount-up-alt,
    .pi-sort-amount-down,
    .p-sortable-column-badge {
      color: #ffffff !important;
    }
  }

  // เพิ่ม style สำหรับ expanded content
  :deep(.expanded-row-content) {
    background-color: #f8f9fa;
    //padding: 1rem;
    border-bottom: 1px solid #dee2e6;
  }

  // Style สำหรับ expand button
  :deep(.p-row-toggler) {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background-color: var(--row-hover-bg);
    }

    .p-row-toggler-icon {
      font-size: 1rem;
    }
  }
}

.check-return-container {
  display: flex;
  align-items: center;
}
</style>
