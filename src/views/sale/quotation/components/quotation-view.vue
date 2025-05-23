<template>
  <div class="mt-2">
    <form>
      <div class="base-datatable">
        <DataTable
          :value="customer.quotationItems"
          rowGroupMode="subheader"
          groupRowsBy="nameGroup"
          stripedRows
          showGridlines
        >
          <ColumnGroup type="header">
            <Row>
              <Column header="" :colspan="2" />
              <Column header="" />
              <Column header="เลขที่ผลิต" />
              <Column header="รหัสสินค้า" />
              <Column header="รายละเอียด" />
              <Column header="Gold (gms)" />
              <Column header="Diamond (cts)" />
              <Column header="Stone (cts)" />
              <Column header="ราคาขาย (THB)" />
              <Column header="ราคาพิเศษ (THB)" />
              <Column header="ตัวแปลง" />
              <Column :header="'ราคาแปลง (' + (customer.currencyUnit || '') + ') '" />
              <Column header="จำนวน" />
              <Column :header="'รวมราคา (' + (customer.currencyUnit || '') + ') '" />
            </Row>
          </ColumnGroup>

          <Column field="index" style="width: 10px">
            <template #body="slotProps">
              <span>{{ slotProps.index + 1 }}</span>
            </template>
          </Column>

          <Column field="action" style="width: 10px">
            <template #body="slotProps">
              <div class="d-flex justify-content-center align-items-center">
                <button
                  class="btn btn-sm btn-red"
                  type="button"
                  title="ลบ"
                  @click="delItem(slotProps.index)"
                >
                  <span class="bi bi-trash"></span>
                </button>
                <button
                  class="btn btn-sm btn-main ml-2"
                  type="button"
                  title="แก้ไข"
                  @click="onEditStock(slotProps.data, slotProps.index)"
                >
                  <span class="bi bi-brush"></span>
                </button>
                <button
                  class="btn btn-sm btn-outline-dark ml-2"
                  type="button"
                  title="คัดลอก"
                  @click="copyItem(slotProps.data)"
                >
                  <span class="bi bi-files"></span>
                </button>
              </div>
            </template>
          </Column>

          <column field="image" header="" style="width: 50px">
            <template #body="slotProps">
              <div class="image-container">
                <div v-if="slotProps.data.imagePath">
                  <imagePreview
                    :imageName="slotProps.data.imagePath"
                    :path="slotProps.data.imagePath"
                    :type="type"
                    :width="25"
                    :height="25"
                    :emitImage="true"
                    @image-loaded="handleImageLoaded($event, slotProps.index)"
                  />
                </div>
              </div>
            </template>
          </column>

          <column field="stockNumber" header="เลขที่ผลิต" style="min-width: 150px">
            <template #body="slotProps">
              <span>{{ slotProps.data.stockNumber }}</span>
            </template>
          </column>
          <column field="stockNumber" header="รหัสสินค้า" style="min-width: 150px">
            <template #body="slotProps">
              <span>{{ slotProps.data.productNumber }}</span>
            </template>
          </column>

          <column field="description" header="รายละเอียด" style="min-width: 200px">
            <template #body="slotProps">
              <input
                v-model="slotProps.data.description"
                type="text"
                class="form-control bg-input input-bg"
                @blur="onBlueDescription(slotProps.data, slotProps.index, 'description')"
                style="background-color: #b5dad4; width: 100%"
              />
            </template>
          </column>

          <column field="gold" style="min-width: 120px; max-width: 300px;">
            <template #body="slotProps">
              <div v-if="slotProps.data.materials">
                <div
                  v-for="(item, idx) in slotProps.data.materials.filter((m) => m.type === 'Gold')"
                  :key="idx"
                  class="material-cell"
                >
                  <div class="material-typecode-gold">
                    {{ item.typeCode }}
                  </div>
                  <div class="material-weight">
                    {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </template>
          </column>

          <column field="diamond" style="min-width: 140px; max-width: 300px;">
            <template #body="slotProps">
              <div v-if="slotProps.data.materials">
                <div
                  v-for="(item, idx) in slotProps.data.materials.filter((m) => m.type === 'Diamond')"
                  :key="idx"
                  class="material-cell"
                >
                  <div class="material-typecode">
                    {{ `${item.qty ? `(${item.qty})` : ''} ${item.typeCode}` }}
                  </div>
                  <div class="material-weight">
                    {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </template>
          </column>

          <column field="gem" style="min-width: 140px; max-width: 300px;">
            <template #body="slotProps">
              <div v-if="slotProps.data.materials">
                <div
                  v-for="(item, idx) in slotProps.data.materials.filter((m) => m.type === 'Gem')"
                  :key="idx"
                  class="material-cell"
                >
                  <div class="material-typecode">
                    {{ `${item.qty ? `(${item.qty})` : ''} ${item.typeCode}` }}
                  </div>
                  <div class="material-weight">
                    {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </template>
          </column>

          <column field="priceOrigin" header="ราคาขาย (THB)" style="min-width: 150px">
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{
                  Number(slotProps.data.priceOrigin || slotProps.data.price || 0).toFixed(2)
                }}</span>
              </div>
            </template>
          </column>
          <column field="price" header="ราคาส่วนลด (THB)" style="min-width: 150px">
            <template #body="slotProps">
              <div class="qty-container">
                <input
                  v-model.number="slotProps.data.discountPrice"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  step="any"
                  @blur="onBluePrice(slotProps.data, slotProps.index, 'discountPrice')"
                  style="background-color: #b5dad4; width: 100%"
                />
              </div>
            </template>
          </column>
          <column field="multiplier" header="ตัวคูณ" style="min-width: 100px">
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{ customer.currencyMultiplier }}</span>
              </div>
            </template>
          </column>
          <column
            field="priceAfterMultiply"
            header="ราคาแปลง ({{ customer.currencyUnit || '' }})"
            style="min-width: 150px"
          >
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{
                  (Number(slotProps.data.discountPrice || 0) * customer.currencyMultiplier).toFixed(
                    2
                  )
                }}</span>
              </div>
            </template>
          </column>
          <column field="qty" header="จำนวน" style="width: 80px">
            <template #body="slotProps">
              <div class="qty-container">
                <input
                  v-model.number="slotProps.data.qty"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  step="1"
                  @blur="onBlueQty(slotProps.data, slotProps.index, 'qty')"
                  style="background-color: #b5dad4; width: 100%"
                />
              </div>
            </template>
          </column>
          <column
            field="totalConverted"
            :header="'รวมราคา (' + (customer.currencyUnit || '') + ') '"
            style="min-width: 150px"
          >
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{
                  (
                    Number(slotProps.data.discountPrice || 0) *
                    customer.currencyMultiplier *
                    (slotProps.data.qty || 0)
                  ).toFixed(2)
                }}</span>
              </div>
            </template>
          </column>

          <ColumnGroup type="footer">
            <!-- total -->
            <Row>
              <column :colspan="5">
                <template #footer>
                  <div class="text-left type-container">
                    <span class="mr-2">Net Weight Of Merchandise</span>
                    <span class="mr-2">{{ sumNetWeight }}</span>
                    <span>gms.</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>รวม</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumGoldWeight }}</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumDiamondWeight }}</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumGemWeight }}</span>
                  </div>
                </template>
              </column>
              <column :colspan="2">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumDiscountPrice }}</span>
                  </div>
                </template>
              </column>
              <column :colspan="2">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumConvertPrice }}</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumQty }}</span>
                  </div>
                </template>
              </column>
              <column :colspan="2">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumConvertedPrice }}</span>
                  </div>
                </template>
              </column>
            </Row>

            <!-- freight -->
            <Row>
              <column :colspan="14">
                <template #footer>
                  <div class="text-right type-container">
                    <span>Freight & Insurance</span>
                  </div>
                </template>
              </column>
              <column :colspan="1">
                <template #footer>
                  <div class="qty-container">
                    <input
                      style="background-color: #b5dad4"
                      v-model="customer.freight"
                      type="number"
                      class="form-control text-right bg-input input-bg"
                      step="any"
                      min="0"
                      required
                      @blur="onBlueFreight(customer.freight)"
                    />
                  </div>
                </template>
              </column>
            </Row>

            <!-- total after discount -->
            <Row>
              <column :colspan="14">
                <template #footer>
                  <div class="text-right type-container">
                    <span>ราคารวม</span>
                  </div>
                </template>
              </column>
              <column :colspan="1">
                <template #footer>
                  <div class="text-right type-container">
                    <span
                      >{{ formatPrice(calTotalPriceAfterDiscount(customer.quotationItems)) }}
                    </span>
                  </div>
                </template>
              </column>
            </Row>
          </ColumnGroup>
        </DataTable>
      </div>

      <div class="base-customer">
        <div class="filter-container mt-2">
          <div class="form-col-container">
            <!-- date -->
            <div class="form-col-container">
              <div>
                <span class="title-text">วันที่ใบเสนอราคา</span>
                <Calendar
                  class="w-100"
                  v-model="form.quotationDate"
                  showIcon
                  :manualInput="true"
                  dateFormat="dd/mm/yy"
                />
              </div>

              <div>
                <span class="title-text">เลขที่ใบเสนอราคา</span>
                <input
                  :class="['form-control bg-input input-bg']"
                  type="text"
                  v-model.trim="customer.invoiceNumber"
                />
              </div>
            </div>

            <!-- convert price -->
            <div class="form-col-container d-flex justify-content-end align-items-end">
              <div class="">
                <span class="title-text">สกุลเงิน</span>
                <input
                  :class="['form-control bg-input', 'input-bg']"
                  type="text"
                  v-model.trim="customer.currencyUnit"
                  style="width: 100px"
                />
              </div>
              <div class="">
                <span class="title-text">ตัวแปลง</span>
                <input
                  :class="['form-control bg-input', 'input-bg']"
                  type="number"
                  v-model.number="customer.currencyMultiplier"
                  min="0"
                  step="any"
                  style="width: 100px"
                />
              </div>
            </div>
          </div>

          <div class="form-col-container mt-2">
            <div>
              <span class="title-text">ชื่อลูกค้า</span>
              <input
                :class="['form-control bg-input', 'input-bg']"
                type="text"
                v-model.trim="customer.name"
              />
            </div>
            <div>
              <span class="title-text">ที่อยู่</span>
              <input
                :class="['form-control bg-input', 'input-bg']"
                type="text"
                v-model.trim="customer.address"
              />
            </div>
            <div>
              <span class="title-text">เบอร์โทร</span>
              <input
                :class="['form-control bg-input', 'input-bg']"
                type="text"
                v-model.trim="customer.tel"
              />
            </div>
            <div>
              <span class="title-text">อีเมล</span>
              <input
                :class="['form-control bg-input', 'input-bg']"
                type="email"
                v-model.trim="customer.email"
              />
            </div>
          </div>
          <div class="form-col-container mt-2">
            <div>
              <span class="title-text">หมายเหตุ</span>
              <input
                :class="['form-control bg-input', 'input-bg']"
                type="text"
                v-model.trim="customer.remark"
              />
            </div>
          </div>

          <div class="right-container mt-2">
            <button class="btn btn-sm btn-green" type="button" @click="printInvoice()">
              <span>สร้างใบเสนอราคา</span>
            </button>
          </div>
        </div>
      </div>
    </form>

    <edit-stock-view
      :isShow="isShow.isEditStock"
      :modelStock="modelEditStock"
      @closeModal="onCloseEditStockModal"
    />
  </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import Calendar from 'primevue/calendar'

import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'
import editStockView from '@/views/sale/quotation/modal/edit-stock-view.vue'

import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { generateInvoicePdf } from '@/services/helper/pdf/quotation/quotation-pdf-integration.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import { formatDate, formatDateTime } from '@/services/utils/dayjs'
//import swAlert from '@/services/alert/sweetAlerts.js'
import dayjs from 'dayjs'

const interfaceForm = {
  discount: 0,
  freight: 0,
  quotationDate: new Date(),
  name: null,
  invoiceNumber: null
}
const interfaceShow = {
  isEditStock: false
}

export default {
  name: 'QuotationView',

  components: {
    DataTable,
    Column,
    ColumnGroup,
    Row,
    imagePreview,
    Calendar,
    editStockView
  },

  setup() {
    const productStore = usrStockProductApiStore()
    const masterStore = useMasterApiStore()
    return { productStore, masterStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  computed: {
    form() {
      return this.modelForm || {}
    },
    sumGoldWeight() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        if (item.materials) {
          item.materials
            .filter((m) => m.type === 'Gold')
            .forEach((m) => {
              sum += Number(m.weight) || 0
            })
        }
      })
      return sum.toFixed(2)
    },
    sumDiamondWeight() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        if (item.materials) {
          item.materials
            .filter((m) => m.type === 'Diamond')
            .forEach((m) => {
              sum += Number(m.weight) || 0
            })
        }
      })
      return sum.toFixed(2)
    },
    sumGemWeight() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        if (item.materials) {
          item.materials
            .filter((m) => m.type === 'Gem')
            .forEach((m) => {
              sum += Number(m.weight) || 0
            })
        }
      })
      return sum.toFixed(2)
    },
    sumQty() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        sum += Number(item.qty) || 0
      })
      return sum
    },
    sumConvertPrice() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        sum += (Number(item.discountPrice) || 0) * this.customer.currencyMultiplier
      })
      return sum.toFixed(2)
    },
    sumDiscountPrice() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        sum += Number(item.discountPrice) || 0
      })
      return sum.toFixed(2)
    },
    sumConvertedPrice() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        sum +=
          Number(item.discountPrice || 0) *
          this.customer.currencyMultiplier *
          (Number(item.qty) || 0)
      })
      return sum.toFixed(2)
    },
    sumNetWeight() {
      let gold = 0
      let diamond = 0
      let gem = 0
      this.customer.quotationItems.forEach((item) => {
        if (item.materials) {
          item.materials.forEach((m) => {
            if (m.type === 'Gold') gold += Number(m.weight) || 0
            if (m.type === 'Diamond') diamond += Number(m.weight) || 0
            if (m.type === 'Gem') gem += Number(m.weight) || 0
          })
        }
      })
      const net = (diamond + gem) / 5 + gold
      return net ? net.toFixed(2) : (0).toFixed(2)
    },
    masterGold() {
      return this.masterStore.gold
    },
    masterGem() {
      return this.masterStore.gem
    },
    masterDiamondGrade() {
      return this.masterStore.diamondGrade
    }
  },

  watch: {
    async modelForm() {
      await this.fetchGetData()
    }
  },

  data() {
    return {
      // quotationItems: [],
      // groupOrderRunning: {
      //   product: 1,
      //   etc: 5
      // },
      type: 'STOCK-PRODUCT',
      customer: {
        ...interfaceForm,
        quotationItems: [],
        currencyMultiplier: 1,
        currencyUnit: 'THB'
      },
      groupOrderRunning: {
        product: 1,
        etc: 5
      },
      isShow: { ...interfaceShow, isEditStock: false },
      modelEditStock: {},
      editStockIndex: null
    }
  },

  methods: {
    delItem(index) {
      this.customer.quotationItems.splice(index, 1)
    },

    calTotalPrice(items) {
      // ใช้ currencyMultiplier ในการคำนวณราคารวม
      const sum = items.reduce((total, item) => {
        return (
          total + Number(item.price) * this.customer.currencyMultiplier * (Number(item.qty) || 1)
        )
      }, 0)
      return sum.toFixed(2)
    },
    calTotalPriceAfterDiscount(items) {
      // ใช้ currencyMultiplier ในการคำนวณราคารวมหลังหักส่วนลด
      const sum = items.reduce((total, item) => {
        return (
          total +
          Number(item.discountPrice) * this.customer.currencyMultiplier * (Number(item.qty) || 0)
        )
      }, 0)
      var freight = this.customer.freight ? Number(this.customer.freight) : 0
      let sumFreight = sum + freight
      var discount = this.customer.discount ? Number(this.customer.discount) : 0
      return (sumFreight - discount).toFixed(2)
    },

    getGroupName(id) {
      switch (id) {
        case 'product':
          return 'รายการสินค้า'

        default:
          return 'Unknown'
      }
    },
    getDescription(stock) {
      return `${stock.productNameEn} ${stock.size ?? ''}`
    },
    GetMaterial(materials, fieldName, type) {
      let result = ''
      if (materials) {
        materials = materials.filter((item) => {
          return item.type === type
        })

        materials.forEach((item) => {
          result += `${item[fieldName]} `
        })
      }
      return result
    },
    onBluePrice(item, index, fieldName) {
      // แปลงค่าเป็นทศนิยม 3 ตำแหน่งเมื่อออกจาก input
      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? Number(item[fieldName]).toFixed(2) : 0,
        totalPrice: Number(item.price).toFixed(2)
      }

      // ในVue 3, เราสามารถอัปเดตได้โดยตรง
      this.customer.quotationItems[index] = newCal

      //console.log('onBluePrice' + fieldName, this.quotationItems[item])
      //console.log('onBluePrice' + fieldName, this.quotationItems)
      //this.onUpdateQty(item)
    },
    onBlueFreight(freight) {
      // แปลงค่าเป็นทศนิยม 3 ตำแหน่งเมื่อออกจาก input
      this.customer.freight = freight ? Number(freight).toFixed(2) : 0
    },
    onBlueQty(item, index, fieldName) {
      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? Number(item[fieldName]) : 0
      }
      this.customer.quotationItems[index] = newCal
    },
    onBlueDescription(item, index, fieldName) {
      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? item[fieldName] : ''
      }
      this.customer.quotationItems[index] = newCal
    },
    // ฟังก์ชันสำหรับจัดรูปแบบตัวเลขให้มีลูกน้ำและทศนิยม 2 ตำแหน่ง
    formatPrice(price) {
      const numPrice = Number(price)

      // ใช้ toLocaleString เพื่อจัดรูปแบบตัวเลขให้มีลูกน้ำคั่นและทศนิยม 2 ตำแหน่ง
      return numPrice.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    async fetchGetData() {
      var data = await this.productStore.fetchDataGet({ formValue: this.form })

      if (data) {
        data = {
          ...data,
          price: data.productPrice ? Number(data.productPrice).toFixed(2) : 0,
          discountPrice: data.productPrice ? Number(data.productPrice).toFixed(2) : 0,
          description: data.productNameEn,
          group: 'product'
        }

        //data is object
        this.customer.quotationItems.push(data)
      }
    },
    handleImageLoaded(imageData, index) {
      // อัปเดตข้อมูลใน quotationItems ด้วยข้อมูลรูปภาพ
      if (this.customer.quotationItems[index]) {
        this.customer.quotationItems[index] = {
          ...this.customer.quotationItems[index],
          imageBase64: imageData.base64 // เก็บ base64 ไว้ใช้ในการสร้าง PDF
        }
      }
    },

    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return date ? formatDate(date) : ''
    },

    printInvoice() {
      const filename = `Invoice_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`
      // Only generate the main PDF, which now includes the breakdown section
      const win1 = window.open('', '_blank')
      generateInvoicePdf({
        items: this.customer.quotationItems,
        customer: this.customer,
        invoiceDate: this.form.quotationDate,
        filename,
        openInNewTab: true,
        targetWindow: win1
      })
    },
    onEditStock(item, index) {
      this.modelEditStock = JSON.parse(JSON.stringify(item))
      this.editStockIndex = index
      this.isShow.isEditStock = true
    },
    onCloseEditStockModal(payload) {
      this.isShow.isEditStock = false
      if (payload && payload.action === 'save' && payload.data) {
        // อัปเดตข้อมูลในตาราง
        this.customer.quotationItems[this.editStockIndex] = payload.data
        // sync discountPrice ถ้ามี priceDiscount (จาก modal)
        if (payload.data.priceDiscount !== undefined && payload.data.priceDiscount !== null) {
          this.customer.quotationItems[this.editStockIndex].discountPrice = payload.data.priceDiscount
        }
      }
      this.modelEditStock = {}
      this.editStockIndex = null
    },
    copyItem(item) {
      // Deep copy the item
      const newItem = JSON.parse(JSON.stringify(item))
      newItem.stockNumber = null
      this.customer.quotationItems.push(newItem)
    }
  },

  async created() {
    this.$nextTick(async () => {
      await this.masterStore.fetchGold()
      await this.masterStore.fetchGem()
      await this.masterStore.fetchDiamondGrade()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/overide-prime-vue/data-table-dub.scss';

.input-bg {
  background-color: #b5dad4 !important;
}

.remark-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 0.5rem;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.qty-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-right: 5px;
}

.type-container {
  font-size: 13px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;
  //margin: 0px 0px 10px 0px;
}

.material-cell {
  display: flex;
  gap: 1px;
  align-items: flex-start;
  min-width: 0;
}
.material-typecode {
  flex: 5;
  text-align: left;
  margin-right: 0.5rem;
  min-width: 120px;
  word-break: break-word;
  white-space: normal;
  overflow-wrap: anywhere;
  vertical-align: top;
}
.material-typecode-gold {
  flex: 5;
  text-align: center;
  margin-right: 0.5rem;
  min-width: 0;
  word-break: break-word;
  white-space: normal;
  overflow-wrap: anywhere;
  vertical-align: top;
}
.material-weight {
  flex: 1;
  vertical-align: top;
}

/* --- align cell content to top for all columns --- */
:deep(.p-column-body),
:deep(.p-cell-text),
.qty-container,
.type-container,
.form-control {
  align-items: flex-start !important;
  vertical-align: top !important;
}
:deep(.p-column-body) {
  vertical-align: top !important;
}
:deep(.p-column-body) > * {
  align-items: flex-start !important;
  justify-content: flex-start !important;
  display: flex;
}
</style>
