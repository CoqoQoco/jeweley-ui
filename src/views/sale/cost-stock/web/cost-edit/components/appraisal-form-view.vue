<template>
  <div class="appraisal-form-container">
    <form @submit.prevent="onSubmit">
      <!-- Stock Information Section -->
      <div class="filter-container mt-2">
        <div class="vertical-center-container mb-2">
          <span class="title-text-lg bi bi-clipboard2-check-fill mr-2"></span>
          <span class="title-text-lg">ข้อมูลสินค้า</span>
        </div>

        <div class="form-col-sm-container">
          <div>
            <span class="title-text">เลขที่ผลิต</span>
            <input
              class="form-control form-control-sm"
              type="text"
              :value="stock.stockNumber || stock.stockNumberOrigin"
              readonly
              disabled
            />
          </div>
          <div>
            <span class="title-text">รหัสสินค้า</span>
            <input
              class="form-control form-control-sm"
              type="text"
              v-model="localStock.productNumber"
              readonly
              disabled
            />
          </div>

          <div>
            <span class="title-text">รายละเอียด</span>
            <input
              class="form-control form-control-sm"
              type="text"
              v-model="localStock.description"
              readonly
              disabled
            />
          </div>

          <div></div>
        </div>

        <!-- Plan Information (Only show when planRunning exists) -->
        <template v-if="localStock.planRunning">
          <div class="line mt-3 mb-3"></div>

          <div class="vertical-center-container mb-2">
            <span class="title-text-lg bi bi-list-check mr-2"></span>
            <span class="title-text-lg">ข้อมูลแผนตีราคา</span>
          </div>

          <div class="plan-info-display">
            <div class="form-col-sm-container">
              <div>
                <span class="title-text">เลขที่แผน</span>
                <div class="plan-display-field">
                  {{ localStock.planRunning }}
                </div>
              </div>
              <div>
                <span class="title-text">วันที่สร้างแผน</span>
                <div class="plan-display-field">
                  {{ formatDate(localStock.planCreateDate) }}
                </div>
              </div>
              <div>
                <span class="title-text">ผู้สร้างแผน</span>
                <div class="plan-display-field">
                  {{ localStock.planCreateBy }}
                </div>
              </div>
              <div></div>
            </div>
          </div>
        </template>

        <!-- Customer Information -->
        <div class="line mt-3 mb-3"></div>

        <div class="vertical-center-container mb-2">
          <span class="title-text-lg bi bi-person-fill mr-2"></span>
          <span class="title-text-lg">ข้อมูลลูกค้า</span>
        </div>

        <div class="mb-2">
          <button
            class="btn btn-sm btn-green mr-2"
            type="button"
            @click="onSearchCustomer"
            title="ค้นหาลูกค้า"
          >
            <i class="bi bi-search mr-1"></i>
            <span>ค้นหาลูกค้า</span>
          </button>
          <button
            class="btn btn-sm btn-main"
            type="button"
            @click="onCreateCustomer"
            title="เพิ่มลูกค้าใหม่"
          >
            <i class="bi bi-database-fill-add mr-1"></i>
            <span>เพิ่มลูกค้าใหม่</span>
          </button>
        </div>

        <div class="customer-info-display">
          <div class="form-col-sm-container">
            <div>
              <span class="title-text">ชื่อลูกค้า</span>
              <div class="customer-display-field">
                {{ localStock.customerName || '-' }}
              </div>
            </div>
            <div>
              <span class="title-text">ที่อยู่</span>
              <div class="customer-display-field">
                {{ localStock.customerAddress || '-' }}
              </div>
            </div>
            <div>
              <span class="title-text">เบอร์โทร</span>
              <div class="customer-display-field">
                {{ localStock.customerPhone || '-' }}
              </div>
            </div>
            <div>
              <span class="title-text">อีเมล</span>
              <div class="customer-display-field">
                {{ localStock.customerEmail || '-' }}
              </div>
            </div>
          </div>
          <div class="form-col-sm-container mt-2">
            <div>
              <span class="title-text">หมายเหตุ</span>
              <textarea
                class="form-control form-control-sm"
                v-model="localStock.remark"
                placeholder="กรอกหมายเหตุ"
                rows="2"
                autocomplete="off"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Price Appraisal Section -->
      <div class="filter-container mt-3 pb-4">
        <div class="vertical-center-container mb-2">
          <span class="title-text-lg bi bi-calculator mr-2"></span>
          <span class="title-text-lg">ประเมินราคาสินค้า</span>
        </div>

        <div class="responsive-text-note">
          * รายการที่แสดงในตารางนี้เป็นราคาต่อ 1 ชิ้น (หารต้นทุนตามจำนวนแผนผลิตแล้ว)
        </div>

        <div class="responsive-table-wrapper">
        <DataTable
          :value="tranItems"
          rowGroupMode="subheader"
          groupRowsBy="nameGroup"
          stripedRows
          showGridlines
        >
          <ColumnGroup type="header">
            <Row>
              <Column header="รายละเอียดงาน" :colspan="3" />
              <Column header="จำนวน" />
              <Column header="ราคา/จำนวน" />
              <Column header="น้ำหนัก" />
              <Column header="ราคา/น้ำหนัก" />
              <Column header="ราคารวม" />
            </Row>
          </ColumnGroup>

          <Column field="nameGroup" />
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
                @click="delTranItem(slotProps.index)"
              >
                <span class="bi bi-trash"></span>
              </button>
            </template>
          </Column>

          <Column field="nameDescription">
            <template #body="slotProps">
              <!-- AutoComplete for new items -->
              <AutoCompleteGeneric
                v-if="slotProps.data.isAdd"
                v-model="slotProps.data.nameDescription"
                :apiEndpoint="getApiEndpoint(slotProps.data.nameGroup)"
                :searchField="getSearchField(slotProps.data.nameGroup)"
                :useStaticList="useStaticList(slotProps.data.nameGroup)"
                :staticOptions="getStaticOptions(slotProps.data.nameGroup)"
                :placeholder="getPlaceholder(slotProps.data.nameGroup)"
                :optionLabel="getOptionLabel(slotProps.data.nameGroup)"
                :forceSelection="false"
                :minLength="getMinLength(slotProps.data.nameGroup)"
                customStyle="background-color: #b5dad4; width: 100%"
                @item-select="onItemSelect($event, slotProps.data)"
              >
                <template #option="{ option }">
                  <div class="flex align-options-center">
                    <div>{{ getOptionDisplay(option, slotProps.data.nameGroup) }}</div>
                  </div>
                </template>
              </AutoCompleteGeneric>

              <!-- Readonly input for existing items -->
              <input
                v-else
                type="text"
                class="form-control"
                v-model="slotProps.data.nameDescription"
                readonly
                disabled
              />
            </template>
          </Column>

          <Column field="qty" style="width: 130px">
            <template #body="slotProps">
              <input
                style="background-color: #b5dad4"
                v-model="slotProps.data.qty"
                type="number"
                class="form-control no-spinners text-right"
                step="any"
                min="0"
                required
                @blur="onBluePrice(slotProps.data, 'qty')"
              />
            </template>
          </Column>

          <Column field="qtyPrice" style="width: 110px">
            <template #body="slotProps">
              <input
                style="background-color: #b5dad4"
                v-model="slotProps.data.qtyPrice"
                type="number"
                class="form-control text-right"
                step="any"
                min="0"
                required
                @blur="onBluePrice(slotProps.data, 'qtyPrice')"
              />
            </template>
          </Column>

          <Column field="qtyWeight" style="width: 110px">
            <template #body="slotProps">
              <input
                style="background-color: #b5dad4"
                v-model="slotProps.data.qtyWeight"
                type="number"
                class="form-control text-right"
                step="any"
                min="0"
                required
                @blur="onBluePrice(slotProps.data, 'qtyWeight')"
              />
            </template>
          </Column>

          <Column field="qtyWeightPrice" style="width: 110px">
            <template #body="slotProps">
              <input
                style="background-color: #b5dad4"
                v-model="slotProps.data.qtyWeightPrice"
                type="number"
                class="form-control text-right"
                step="any"
                min="0"
                required
                @blur="onBluePrice(slotProps.data, 'qtyWeightPrice')"
              />
            </template>
          </Column>

          <Column field="totalPrice" style="width: 150px">
            <template #body="slotProps">
              <input
                v-model="slotProps.data.totalPrice"
                class="form-control text-right"
                min="0"
                disabled
              />
            </template>
          </Column>

          <template #groupheader="slotProps">
            <div class="flex align-items-center gap-2 type-container">
              <span><i class="bi bi-clipboard2-check mr-2"></i></span>
              <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
            </div>
          </template>

          <template #groupfooter="slotProps">
            <div class="d-flex align-items-center justify-content-between gap-2 type-container">
              <div>
                <span><i class="bi bi-clipboard2-check-fill mr-2"></i></span>
                <span>ต้นทุน</span>
                <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
              </div>
              <div class="text-right mr-2">
                {{ calculateGroupTotal(slotProps.data.nameGroup).toFixed(2) }}
              </div>
            </div>
          </template>

          <ColumnGroup type="footer">
            <Row>
              <Column :colspan="7">
                <template #footer>
                  <div class="text-right type-container">
                    <span>ต้นทุนรวมทั้งหมด (THB)</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="1">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ caltotalPrice(tranItems) }}</span>
                  </div>
                </template>
              </Column>
            </Row>
            <Row v-if="hasCurrencyConversion">
              <Column :colspan="7">
                <template #footer>
                  <div class="text-right type-container currency-summary-row">
                    <span>ต้นทุนรวม ({{ displayCurrency }})</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="1">
                <template #footer>
                  <div class="text-right type-container currency-summary-row">
                    <span>{{ displayTotalCost }}</span>
                  </div>
                </template>
              </Column>
            </Row>
            <Row>
              <Column :colspan="5">
                <template #footer>
                  <div class="text-right type-container">
                    <span>ราคาป้าย ({{ displayCurrency }})</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="2">
                <template #footer>
                  <div class="tag-price-multiplier">
                    <span class="multiplier-label">ต้นทุน ×</span>
                    <input
                      v-model="tagPriceMultiplier"
                      type="number"
                      class="form-control form-control-sm text-right"
                      step="any"
                      min="0"
                    />
                  </div>
                </template>
              </Column>
              <Column :colspan="1">
                <template #footer>
                  <div class="text-right type-container tag-price-value">
                    <span>{{ displayTagPrice }}</span>
                  </div>
                </template>
              </Column>
            </Row>
            <Row v-if="hasCurrencyConversion">
              <Column :colspan="7">
                <template #footer>
                  <div class="text-right type-container tag-reference-text">
                    <span>ราคาป้าย (THB)</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="1">
                <template #footer>
                  <div class="text-right type-container tag-reference-text">
                    <span>{{ tagPrice }}</span>
                  </div>
                </template>
              </Column>
            </Row>
          </ColumnGroup>
        </DataTable>
        </div>

        <!-- Add Transaction Item -->
        <div class="responsive-action-group mt-2">
          <Dropdown
            v-model="masterValue"
            :options="masterType"
            optionLabel="name"
            optionValue="code"
            class="w-full md:w-14rem"
            placeholder="เลือกรายการ"
          />
          <button
            type="button"
            class="btn btn-sm btn-green"
            title="เพิ่มรายการ"
            @click="addTranItem"
          >
            <span><i class="bi bi-plus mr-1"></i></span>
            <span>เพิ่มรายการ</span>
          </button>
        </div>
      </div>

      <!-- Currency Conversion Section -->
      <div class="filter-container mt-3">
        <div class="vertical-center-container mb-2">
          <span class="title-text-lg bi bi-currency-exchange mr-2"></span>
          <span class="title-text-lg">สกุลเงิน (Currency)</span>
        </div>
        <div class="form-col-sm-container">
          <div>
            <span class="title-text">สกุลเงิน</span>
            <input
              class="form-control form-control-sm"
              type="text"
              v-model.trim="currencyUnit"
              placeholder="เช่น US$, EUR (เว้นว่างถ้าเป็นบาท)"
              autocomplete="off"
            />
          </div>
          <div>
            <span class="title-text">อัตราแลกเปลี่ยน (1 หน่วย = ? บาท)</span>
            <input
              class="form-control form-control-sm"
              type="number"
              v-model.number="currencyRate"
              min="0"
              step="0.01"
              placeholder="เช่น 33.50"
            />
          </div>
          <div></div>
          <div></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="filter-container mt-3 pb-4">
        <div class="responsive-btn-group">
          <button class="btn btn-sm btn-green" type="submit">
            <span class="bi bi-save mr-2"></span>
            <span>บันทึก</span>
          </button>
          <button class="btn btn-sm btn-main" type="button" @click="onSaveAsOriginCost">
            <span class="bi bi-save mr-2"></span>
            <span>บันทึกและใช้เป็นต้นทุนหลัก</span>
          </button>
          <button class="btn btn-sm btn-secondary" type="button" @click="onCancel">
            <span class="bi bi-x mr-2"></span>
            <span>ยกเลิก</span>
          </button>
        </div>
      </div>
    </form>

    <!-- Customer Search Modal -->
    <CustomerSearchModal
      :showModal="showCustomerSearch"
      @closeModal="onCloseCustomerModal"
      @customerSelected="onCustomerSelected"
    />

    <!-- Customer Create Modal -->
    <CustomerCreateModal
      :showModal="showCustomerCreate"
      @closeModal="onCloseCustomerModal"
      @customerCreated="onCustomerCreated"
    />
  </div>
</template>

<script>
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'

import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import CustomerSearchModal from '@/views/sale/quotation/modal/customer-search-modal.vue'
import CustomerCreateModal from '@/views/sale/quotation/modal/customer-create-modal.vue'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { confirmSubmit } from '@/services/alert/sweetAlerts.js'
import { formatDate } from '@/services/utils/dayjs.js'

export default {
  name: 'AppraisalFormView',

  components: {
    Dropdown,
    DataTable,
    Column,
    ColumnGroup,
    Row,
    AutoCompleteGeneric,
    CustomerSearchModal,
    CustomerCreateModal
  },

  props: {
    stock: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },

  emits: ['save', 'cancel'],

  setup() {
    const masterStore = useMasterApiStore()
    const productStore = usrStockProductApiStore()
    return { masterStore, productStore, formatDate }
  },

  computed: {
    tagPrice() {
      const total = this.tranItems.reduce((sum, item) => sum + Number(item.totalPrice), 0)
      return (total * (Number(this.tagPriceMultiplier) || 0)).toFixed(2)
    },

    hasCurrencyConversion() {
      return !!(this.currencyUnit && this.currencyRate && this.currencyRate > 0 && this.currencyRate !== 1)
    },

    displayCurrency() {
      return this.hasCurrencyConversion ? this.currencyUnit : 'THB'
    },

    displayTotalCost() {
      const total = this.tranItems.reduce((sum, item) => sum + Number(item.totalPrice), 0)
      if (!this.hasCurrencyConversion) return total.toFixed(2)
      return (total / this.currencyRate).toFixed(2)
    },

    displayTagPrice() {
      const tagPriceNum = Number(this.tagPrice) || 0
      if (!this.hasCurrencyConversion) return tagPriceNum.toFixed(2)
      return (tagPriceNum / this.currencyRate).toFixed(2)
    },

    masterGoldList() {
      // Combine hardcoded gold list with API gold list
      const apiGold = this.masterStore.gold || []
      const combined = [...this.hardcodedGoldList]

      // Add API gold items that don't exist in hardcoded list
      apiGold.forEach((apiItem) => {
        const exists = combined.some(
          (item) => item.code.toLowerCase() === apiItem.code.toLowerCase()
        )
        if (!exists) {
          combined.push(apiItem)
        }
      })

      return combined
    }
  },


  watch: {
    stock: {
      handler(val) {
        if (!val) return
        this.localStock = { ...val }
        this.tagPriceMultiplier = val.tagPriceMultiplier || 1
        this.currencyUnit = val.currencyUnit || ''
        this.currencyRate = val.currencyRate || null

        // Initialize transaction items from priceTransactions only
        if (this.localStock.priceTransactions && this.localStock.priceTransactions.length > 0) {
          this.tranItems = this.localStock.priceTransactions.map((item) => ({
            nameGroup: item.nameGroup || (item.type === 'Diamond' ? 'Gem' : item.type) || 'ETC',
            nameDescription:
              item.nameDescription || item.typeCode || item.description || item.type || '',
            qty: Number(item.qty) || 0,
            qtyPrice: Number(item.qtyPrice) || 0,
            qtyWeight: Number(item.qtyWeight) || 0,
            qtyWeightPrice: Number(item.qtyWeightPrice) || 0,
            totalPrice: Number(item.totalPrice).toFixed(2) || '0.00',
            isAdd: true
          }))
        } else {
          this.tranItems = []
        }

        // Auto-add "น้ำหนักแป้น" for Ring products (productType === 'R')
        if (this.localStock.productType === 'R') {
          const hasRingP = this.tranItems.some(
            (item) =>
              item.nameGroup === 'Gold' &&
              (item.nameDescription === 'RINGP' || item.nameDescription === 'น้ำหนักแป้น')
          )

          if (!hasRingP) {
            this.tranItems.push({
              nameGroup: 'Gold',
              nameDescription: 'น้ำหนักแป้น',
              qty: 0,
              qtyPrice: 0,
              qtyWeight: 0,
              qtyWeightPrice: 0,
              totalPrice: '0.00',
              isAdd: true
            })

            // Sort by group order
            this.tranItems = this.tranItems.sort(
              (a, b) => this.groupOrderRunning[a.nameGroup] - this.groupOrderRunning[b.nameGroup]
            )
          }
        }
      },
      immediate: true
    }
  },

  data() {
    return {
      localStock: {},
      tranItems: [],
      tagPriceMultiplier: 1,
      currencyUnit: '',
      currencyRate: null,
      masterValue: 'ETC',
      showCustomerSearch: false,
      showCustomerCreate: false,

      masterType: [
        { code: 'Gold', name: 'รายการทอง' },
        { code: 'Gem', name: 'รายการวัถุดิบ' },
        { code: 'Worker', name: 'รายการงานช่าง' },
        { code: 'Embed', name: 'รายการงานฝัง' },
        { code: 'ETC', name: 'รายการเพิ่มเติม' }
      ],

      groupOrderRunning: {
        Gold: 1,
        Worker: 2,
        Embed: 3,
        Gem: 4,
        ETC: 5
      },

      // Hardcoded Gold master list (combined with API)
      hardcodedGoldList: [
        { code: 'น้ำหนักแป้น'  , name: 'น้ำหนักแป้น' }
        
      ],

      // Static master lists (temporary until API is ready)
      masterWorkerList: [
        { code: 'WORKER01', name: 'ค่าชุบ' },
        { code: 'WORKER02', name: 'ค่าเเม่พิมพ์' },
        { code: 'WORKER03', name: 'ค่ายิงเลเซอร์' },
        { code: 'WORKER04', name: 'ค่าเเรงทำแป้น' },
        { code: 'WORKER05', name: 'ค่าคัดพลอย' }
      ],

      masterEmbedList: [
        { code: 'EMBED01', name: 'งานฝังพลอย' },
        { code: 'EMBED02', name: 'งานฝังเพชร' },
        { code: 'EMBED03', name: 'งานฝังเกสร' },
        { code: 'EMBED04', name: 'งานฝังแบบตัวเรือน' }
      ],

      masterETCList: [
        { code: 'ETC01', name: 'ค่าบรรจุภัณฑ์' },
        { code: 'ETC02', name: 'ค่าขนส่ง' },
        { code: 'ETC03', name: 'ค่าธรรมเนียม' },
        { code: 'ETC04', name: 'ค่าใช้จ่ายอื่นๆ' },
        { code: 'ETC05', name: 'ค่าตรวจสอบคุณภาพ' }
      ]
    }
  },

  methods: {
    addTranItem() {
      this.tranItems.push({
        nameGroup: this.masterValue ?? 'ETC',
        nameDescription: '',
        qty: 0,
        qtyPrice: 0,
        qtyWeight: 0,
        qtyWeightPrice: 0,
        totalPrice: '0.00',
        isAdd: true
      })
      this.tranItems = this.tranItems.sort(
        (a, b) => this.groupOrderRunning[a.nameGroup] - this.groupOrderRunning[b.nameGroup]
      )
    },

    delTranItem(index) {
      this.tranItems.splice(index, 1)
    },

    onBluePrice(item, fieldName) {
      item[fieldName] = item[fieldName] ? Number(item[fieldName]) : 0
      item.totalPrice = (
        (Number(item.qty) || 0) * (Number(item.qtyPrice) || 0) +
        (Number(item.qtyWeight) || 0) * (Number(item.qtyWeightPrice) || 0)
      ).toFixed(2)
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

    caltotalPrice(data) {
      let total = 0
      data.forEach((item) => {
        total += Number(item.totalPrice)
      })
      return total.toFixed(2)
    },

    calculateGroupTotal(groupName) {
      return this.tranItems
        .filter((item) => item.nameGroup === groupName)
        .reduce((total, item) => total + Number(item.totalPrice), 0)
    },

    onSubmit() {
      confirmSubmit('', 'ยืนยันการบันทึกข้อมูล?', async () => {
        await this.fetchSave(false)
      })
    },

    onSaveAsOriginCost() {
      confirmSubmit('', 'ยืนยันการบันทึกและใช้เป็นต้นทุนหลัก?', async () => {
        await this.fetchSave(true)
      })
    },

    async fetchSave(isOriginCost = false) {
      // Mapping data to match API request structure
      const requestData = {
        stockNumber: this.localStock.stockNumber || this.localStock.stockNumberOrigin,
        planRunning: this.localStock.planRunning || null,
        customerCode: this.localStock.customerCode || null,
        customerName: this.localStock.customerName || null,
        customerAddress: this.localStock.customerAddress || null,
        customerTel: this.localStock.customerPhone || null,
        customerEmail: this.localStock.customerEmail || null,
        remark: this.localStock.remark || null,
        tagPriceMultiplier: Number(this.tagPriceMultiplier) || 1,
        currencyUnit: this.currencyUnit || null,
        currencyRate: this.currencyRate ? Number(this.currencyRate) : null,
        prictransection: this.tranItems.map((item, index) => ({
          no: index + 1,
          name: item.nameGroup || '',
          nameDescription: item.nameDescription || '',
          nameGroup: item.nameGroup || '',
          date: null,
          qty: Number(item.qty) || 0,
          qtyPrice: Number(item.qtyPrice) || 0,
          qtyWeight: Number(item.qtyWeight) || 0,
          qtyWeightPrice: Number(item.qtyWeightPrice) || 0
        })),
        isOriginCost: isOriginCost
      }

      const response = await this.productStore.fetchAddProductCostDeatialVersion({
        formValue: requestData
      })

      if (response) {
        this.$emit('save', this.localStock)
      }
    },

    onCancel() {
      this.$emit('cancel')
    },

    // Customer Management Methods
    onSearchCustomer() {
      this.showCustomerSearch = true
    },

    onCreateCustomer() {
      this.showCustomerCreate = true
    },

    onCustomerSelected(customerData) {
      this.localStock.customerCode = customerData.code
      this.localStock.customerName = customerData.nameTh || customerData.nameEn
      this.localStock.customerAddress = customerData.address
      this.localStock.customerPhone = customerData.telephone1
      this.localStock.customerEmail = customerData.email
      this.localStock.customerId = customerData.id
      this.showCustomerSearch = false
    },

    onCustomerCreated(customerData) {
      this.localStock.customerCode = customerData.code
      this.localStock.customerName = customerData.nameTh || customerData.nameEn || ''
      this.localStock.customerAddress = customerData.address || ''
      this.localStock.customerPhone = customerData.telephone1 || ''
      this.localStock.customerEmail = customerData.email || ''
      this.localStock.customerId = customerData.id
      this.showCustomerCreate = false
    },

    onCloseCustomerModal() {
      this.showCustomerSearch = false
      this.showCustomerCreate = false
    },

    // AutoComplete Configuration Methods
    getApiEndpoint(nameGroup) {
      switch (nameGroup) {
        case 'Gem':
          return 'StockGem/Search'
        default:
          return ''
      }
    },

    getSearchField(nameGroup) {
      return 'text'
    },

    useStaticList(nameGroup) {
      switch (nameGroup) {
        case 'Gold':
          return true
        case 'Worker':
          return true
        case 'Embed':
          return true
        case 'ETC':
          return true
        case 'Gem':
          return false
        default:
          return true
      }
    },

    getStaticOptions(nameGroup) {
      switch (nameGroup) {
        case 'Gold':
          return this.masterGoldList
        case 'Worker':
          return this.masterWorkerList
        case 'Embed':
          return this.masterEmbedList
        case 'ETC':
          return this.masterETCList
        default:
          return []
      }
    },

    getPlaceholder(nameGroup) {
      switch (nameGroup) {
        case 'Gold':
          return 'ค้นหาทอง...'
        case 'Gem':
          return 'ค้นหาพลอย/เพชร...'
        case 'Worker':
          return 'ค้นหางานช่าง...'
        case 'Embed':
          return 'ค้นหางานฝัง...'
        case 'ETC':
          return 'ค้นหารายการอื่นๆ...'
        default:
          return 'ค้นหา...'
      }
    },

    getOptionLabel(nameGroup) {
      switch (nameGroup) {
        case 'Gold':
          return 'code'
        default:
          return 'name'
      }
    },

    getMinLength(nameGroup) {
      switch (nameGroup) {
        case 'Gem':
          return 3
        default:
          return 1
      }
    },

    getOptionDisplay(option, nameGroup) {
      switch (nameGroup) {
        case 'Gold':
          return option.code || option.name
        default:
          return option.name
      }
    },

    // Item Select Handler
    onItemSelect(event, rowData) {
      const selected = event.value
      if (selected) {
        // Update nameDescription
        if (rowData.nameGroup === 'Gold') {
          rowData.nameDescription = selected.code
        } else {
          rowData.nameDescription = selected.name
        }

        // Auto-fill price if available (for Gem)
        if (rowData.nameGroup === 'Gem' && selected.price) {
          rowData.qtyWeightPrice = selected.price
        }
      }
    }
  },

  async created() {
    // Load master gold data
    await this.masterStore.fetchGold()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.appraisal-form-container {
  margin-top: 10px;
  padding: 0 5px;
}

.type-container {
  font-size: 15px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;

  @media (max-width: 1024px) {
    font-size: 14px;
  }
}

input {
  margin-top: 5px !important;
}

textarea {
  margin-top: 5px !important;
  resize: vertical;
}

:deep(.p-autocomplete .p-component) {
  margin-top: 0px !important;
}

// Plan Display Field Styles
.plan-info-display {
  margin-top: 10px;
}

.plan-display-field {
  background-color: #fff9e6;
  border: 1px solid #fabc3f;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 5px;
  min-height: 36px;
  color: #495057;
  font-size: 14px;
  font-weight: 600;

  @media (max-width: 1024px) {
    font-size: 13px;
    padding: 6px 10px;
    min-height: 34px;
  }
}

// Customer Display Field Styles
.customer-info-display {
  margin-top: 10px;
}

.customer-display-field {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 5px;
  min-height: 36px;
  color: #495057;
  font-size: 14px;

  @media (max-width: 1024px) {
    font-size: 13px;
    padding: 6px 10px;
    min-height: 34px;
  }
}

// Responsive DataTable styles for Tablet
:deep(.p-datatable) {
  font-size: 14px;

  @media (max-width: 1024px) {
    font-size: 13px;

    .p-datatable-thead > tr > th {
      padding: 0.5rem 0.4rem;
    }

    .p-datatable-tbody > tr > td {
      padding: 0.5rem 0.4rem;
    }

    input.form-control {
      font-size: 13px;
    }
  }
}

// Tag Price Multiplier Row
.tag-price-multiplier {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;

  .multiplier-label {
    font-size: 14px;
    font-weight: bold;
    color: var(--base-font-color);
    white-space: nowrap;
  }

  input {
    max-width: 120px;
    background-color: #b5dad4 !important;

    @media (max-width: 1024px) {
      max-width: 100px;
    }
  }
}

.tag-price-value {
  font-size: 15px;
  color: #e65100;

  @media (max-width: 1024px) {
    font-size: 14px;
  }
}

.currency-summary-row {
  color: #1565c0;
  font-weight: 600;
}

.tag-reference-text {
  color: #999;
  font-size: 12px;
}

// Responsive Column widths for Tablet
:deep(.p-datatable) {
  @media (max-width: 1024px) {
    th[style*="width: 130px"],
    td[style*="width: 130px"] {
      width: 110px !important;
    }

    th[style*="width: 110px"],
    td[style*="width: 110px"] {
      width: 95px !important;
    }

    th[style*="width: 150px"],
    td[style*="width: 150px"] {
      width: 130px !important;
    }
  }
}
</style>
