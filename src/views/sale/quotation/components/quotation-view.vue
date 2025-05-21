<template>
  <div class="mt-2">
    <form>
      <div class="base-datatable">
        <DataTable
          :value="quotationItems"
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
              <Column header="จำนวน" />
              <Column header="ราคา (THB)" />
              <Column header="ตัวคูณ" />
              <Column header="ราคาแปลงสกุลเงิน" />
            </Row>
          </ColumnGroup>

          <Column field="index" style="width: 10px">
            <template #body="slotProps">
              <span>{{ slotProps.index + 1 }}</span>
            </template>
          </Column>

          <Column field="action" style="width: 10px">
            <template #body="slotProps">
              <button
                class="btn btn-sm btn-red"
                type="button"
                title="ลบ"
                @click="delItem(slotProps.index)"
              >
                <span class="bi bi-trash"></span>
              </button>
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
                class="form-control"
                @blur="onBlueDescription(slotProps.data, slotProps.index, 'description')"
                style="background-color: #b5dad4; width: 100%"
              />
            </template>
          </column>

          <column field="gold" style="min-width: 140px">
            <template #body="slotProps">
              <div v-if="slotProps.data.materials">
                <div
                  v-for="(item, idx) in slotProps.data.materials.filter((m) => m.type === 'Gold')"
                  :key="idx"
                  style="display: flex; gap: 1px"
                >
                  <div style="flex: 5; text-align: right" class="mr-2">{{ item.typeCode }}</div>
                  <div style="flex: 1">
                    {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </template>
          </column>

          <column field="diamond" style="min-width: 140px">
            <template #body="slotProps">
              <div v-if="slotProps.data.materials">
                <div
                  v-for="(item, idx) in slotProps.data.materials.filter(
                    (m) => m.type === 'Diamond'
                  )"
                  :key="idx"
                  style="display: flex; gap: 1px"
                >
                  <div style="flex: 5; text-align: right" class="mr-2">
                    {{ `${item.qty ? `(${item.qty})` : ''} ${item.typeCode}` }}
                  </div>
                  <div style="flex: 1">
                    {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </template>
          </column>

          <column field="gem" style="min-width: 140px">
            <template #body="slotProps">
              <div v-if="slotProps.data.materials">
                <div
                  v-for="(item, idx) in slotProps.data.materials.filter((m) => m.type === 'Gem')"
                  :key="idx"
                  style="display: flex; gap: 1px"
                >
                  <div style="flex: 5; text-align: right" class="mr-2">
                    {{ `${item.qty ? `(${item.qty})` : ''} ${item.typeCode}` }}
                  </div>
                  <div style="flex: 1">
                    {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </template>
          </column>

          <column field="qty" header="จำนวน" style="width: 80px">
            <template #body="slotProps">
              <div class="qty-container">
                <input
                  v-model.number="slotProps.data.qty"
                  type="number"
                  class="form-control text-right"
                  min="0"
                  step="1"
                  @blur="onBlueQty(slotProps.data, slotProps.index, 'qty')"
                  style="background-color: #b5dad4; width: 100%"
                />
              </div>
            </template>
          </column>

          <column field="price" header="ราคา (THB)" style="min-width: 150px">
            <template #body="slotProps">
              <div class="qty-container">
                <input
                  style="background-color: #b5dad4"
                  v-model="slotProps.data.price"
                  type="number"
                  class="form-control text-right"
                  step="any"
                  min="0"
                  required
                  @blur="onBluePrice(slotProps.data, slotProps.index, 'price')"
                />
              </div>
            </template>
          </column>

          <column header="ตัวแปลง" style="min-width: 80px">
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{ currencyMultiplier }}</span>
              </div>
            </template>
          </column>

          <column header="ราคาแปลง" style="min-width: 150px">
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{ (slotProps.data.price * currencyMultiplier * slotProps.data.qty).toFixed(2) }}</span>
              </div>
            </template>
          </column>

          <ColumnGroup type="footer">
            <!-- total -->
            <Row>
              <column :colspan="6">
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
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumQty }}</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumPrice }}</span>
                  </div>
                </template>
              </column>
              <column :colspan="4">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ formatPrice(calTotalPrice(quotationItems)) }}</span>
                  </div>
                </template>
              </column>
            </Row>

            <!-- freight -->
            <Row>
              <column :colspan="12">
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
                      class="form-control text-right"
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
              <column :colspan="12">
                <template #footer>
                  <div class="text-right type-container">
                    <span>ราคารวม</span>
                  </div>
                </template>
              </column>
              <column :colspan="1">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ formatPrice(calTotalPriceAfterDiscount(quotationItems)) }}</span>
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
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="customer.invoiceNumber"
              />
            </div>
            <div></div>
            <div></div>
          </div>

          <div class="form-col-container mt-2">
            <div>
              <span class="title-text">ชื่อลูกค้า</span>
              <input :class="['form-control bg-input']" type="text" v-model.trim="customer.name" />
            </div>

            <div>
              <span class="title-text">หมายเหตุ</span>
              <input
                :class="['form-control bg-input']"
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
  </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import Calendar from 'primevue/calendar'

import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'

import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { generateInvoicePdf } from '@/services/helper/pdf/quotation/quotation-pdf-integration.js'

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
export default {
  name: 'QuotationView',

  components: {
    DataTable,
    Column,
    ColumnGroup,
    Row,
    imagePreview,
    Calendar
  },

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
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
      this.quotationItems.forEach((item) => {
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
      this.quotationItems.forEach((item) => {
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
      this.quotationItems.forEach((item) => {
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
      this.quotationItems.forEach((item) => {
        sum += Number(item.qty) || 0
      })
      return sum
    },
    sumPrice() {
      let sum = 0
      this.quotationItems.forEach((item) => {
        sum += Number(item.price) || 0
      })
      return sum.toFixed(2)
    }
  },

  watch: {
    async modelForm() {
      await this.fetchGetData()
    }
  },

  data() {
    return {
      quotationItems: [],
      groupOrderRunning: {
        product: 1,
        etc: 5
      },
      type: 'STOCK-PRODUCT',
      customer: { ...interfaceForm },
      currencyMultiplier: 1
    }
  },

  methods: {
    delItem(index) {
      this.quotationItems.splice(index, 1)
    },

    calTotalPrice(items) {
      const sum = items.reduce((total, item) => {
        // แปลง item.price เป็นตัวเลขด้วย Number() หรือ parseFloat()
        return total + Number(item.price)
      }, 0)

      return sum.toFixed(2) // แสดงผลเป็นทศนิยม 2 ตำแหน่ง
    },
    calTotalPriceAfterDiscount(items) {
      const sum = items.reduce((total, item) => {
        // แปลง item.price เป็นตัวเลขด้วย Number() หรือ parseFloat()
        return total + Number(item.price)
      }, 0)

      var freight = this.customer.freight ? Number(this.customer.freight) : 0
      let sumFreight = sum + freight
      var discount = this.customer.discount ? Number(this.customer.discount) : 0

      return (sumFreight - discount).toFixed(2) // แสดงผลเป็นทศนิยม 2 ตำแหน่ง
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
      this.quotationItems[index] = newCal

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
      this.quotationItems[index] = newCal
    },
    onBlueDescription(item, index, fieldName) {
      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? item[fieldName] : ''
      }
      this.quotationItems[index] = newCal
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
          description: data.productNameEn,
          group: 'product'
        }

        //data is object
        this.quotationItems.push(data)
      }
    },
    handleImageLoaded(imageData, index) {
      // อัปเดตข้อมูลใน quotationItems ด้วยข้อมูลรูปภาพ
      if (this.quotationItems[index]) {
        this.quotationItems[index] = {
          ...this.quotationItems[index],
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

    async printInvoice() {
      try {
        const filename = `Invoice_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`

        await generateInvoicePdf({
          items: this.quotationItems,
          customer: {
            name: this.customer.name,
            note: this.customer.remark,
            discount: this.customer.discount,
            freight: this.customer.freight,
            invoiceNumber: this.customer.invoiceNumber
          },
          invoiceDate: this.form.quotationDate,
          filename,
          openInNewTab: true // เปิดในแท็บใหม่
        })

        // แสดงข้อความสำเร็จ
      } catch (error) {
        // แสดงข้อความผิดพลาด
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/overide-prime-vue/data-table-dub.scss';

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
</style>
