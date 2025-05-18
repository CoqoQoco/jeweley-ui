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
              <Column header="ทอง" />
              <Column header="เพชร" />
              <Column header="พลอย" />
              <Column header="จำนวน" />
              <Column header="ราคา (THB)" />
            </Row>
          </ColumnGroup>

          <!-- <Column field="nameGroup"> </Column> -->

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
                  <!-- <imagePreview
                    :imageName="slotProps.data.imagePath"
                    :path="slotProps.data.imagePath"
                    :type="type"
                    :width="25"
                    :height="25"
                  /> -->
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

          <column field="stockNumber" header="เลขที่ผลิต" style="width: 150px">
            <template #body="slotProps">
              <span>{{ slotProps.data.stockNumber }}</span>
            </template>
          </column>
          <column field="stockNumber" header="รหัสสินค้า" style="width: 150px">
            <template #body="slotProps">
              <span>{{ slotProps.data.productNumber }}</span>
            </template>
          </column>

          <column field="description" header="รายละเอียด">
            <template #body="slotProps">
              <span>{{ getDescription(slotProps.data) }}</span>
            </template>
          </column>

          <column field="gold">
            <template #body="slotProps">
              <span>{{ GetMaterial(slotProps.data.materials, 'textGold', 'Gold') }}</span>
            </template>
          </column>
          <column field="diamond">
            <template #body="slotProps">
              <span>{{ GetMaterial(slotProps.data.materials, 'textDiamond', 'Diamond') }}</span>
            </template>
          </column>

          <column field="gem">
            <template #body="slotProps">
              <span>{{ GetMaterial(slotProps.data.materials, 'textGem', 'Gem') }}</span>
            </template>
          </column>

          <column field="qty" header="จำนวน" style="width: 80px">
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{ slotProps.data.qty }}</span>
              </div>
            </template>
          </column>
          <column field="price" header="ราคา (THB)" style="width: 150px">
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

          <!-- <template #groupheader="slotProps">
            <div class="flex align-items-center gap-2 type-container">
              <span><i class="bi bi-clipboard2-check mr-2"></i></span>
              <span>{{ getGroupName(slotProps.data.group) }}</span>
            </div>
          </template> -->

          <ColumnGroup type="footer">
            <!-- total -->
            <Row>
              <column :colspan="10">
                <template #footer>
                  <div class="text-right type-container">
                    <span>ราคารวม</span>
                  </div>
                </template>
              </column>
              <column :colspan="1">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ formatPrice(calTotalPrice(quotationItems)) }}</span>
                  </div>
                </template>
              </column>
            </Row>

            <!-- discount -->
            <Row>
              <column :colspan="10">
                <template #footer>
                  <div class="text-right type-container">
                    <span>ส่วนลดพิเศษ</span>
                  </div>
                </template>
              </column>
              <column :colspan="1">
                <template #footer>
                  <div class="qty-container">
                    <input
                      style="background-color: #b5dad4"
                      v-model="customer.discount"
                      type="number"
                      class="form-control text-right"
                      step="any"
                      min="0"
                      required
                      @blur="onBlueDiscount(customer.discount)"
                    />
                  </div>
                </template>
              </column>
            </Row>

            <!-- total after discount -->
            <Row>
              <column :colspan="10">
                <template #footer>
                  <div class="text-right type-container">
                    <span>ราคาหลังส่วนลด</span>
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

            <div></div>
            <div></div>
            <div></div>
          </div>

          <div class="form-col-container mt-1">
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

          <div class="center-container mt-2">
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
  quotationDate: new Date(),
  name: null
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
      customer: { ...interfaceForm }
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

      return (sum - this.customer.discount).toFixed(2) // แสดงผลเป็นทศนิยม 2 ตำแหน่ง
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
      console.log('onBluePrice' + fieldName, item, index)

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
    onBlueDiscount(discount) {
      // แปลงค่าเป็นทศนิยม 3 ตำแหน่งเมื่อออกจาก input
      console.log('onBluePrice discount', discount)
      this.customer.discount = discount ? Number(discount).toFixed(2) : 0
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
      console.log('fetchGetData', data)

      if (data) {
        data = {
          ...data,
          price: data.productPrice ? Number(data.productPrice).toFixed(2) : 0,
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
            freight: this.customer.freight
          },
          invoiceDate: this.form.quotationDate,
          filename,
          openInNewTab: true // เปิดในแท็บใหม่
        })

        // แสดงข้อความสำเร็จ
      } catch (error) {
        // แสดงข้อความผิดพลาด

        console.error('PDF generation error:', error)
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
