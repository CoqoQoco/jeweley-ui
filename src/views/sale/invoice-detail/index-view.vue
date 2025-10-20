<template>
  <div class="app-container">
    <!-- Header Section -->
    <div class="card mb-3">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-file-earmark-text mr-2"></i>
          รายละเอียด Invoice
        </h5>
        <div>
          <button
            class="btn btn-success btn-sm mr-2"
            @click="reprintPDF"
          >
            <i class="bi bi-printer mr-1"></i>
            Reprint PDF
          </button>
          <button
            class="btn btn-danger btn-sm mr-2"
            @click="confirmReverseInvoice"
          >
            <i class="bi bi-arrow-counterclockwise mr-1"></i>
            Reverse Invoice
          </button>
          <button
            class="btn btn-secondary btn-sm"
            @click="goBack"
          >
            <i class="bi bi-arrow-left mr-1"></i>
            ย้อนกลับ
          </button>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="loadError" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle mr-2"></i>
      {{ loadError }}
    </div>

    <!-- Invoice Detail Content -->
    <div v-else-if="invoiceData && invoiceData.invoiceNumber">
      <!-- Invoice Header Information -->
      <div class="card-container mb-3">
        <div class="card-header">
          <h6 class="mb-0">ข้อมูล Invoice</h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group row">
                <label class="col-sm-4 col-form-label font-weight-bold">เลขที่ Invoice:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ invoiceData.invoiceNumber || '-' }}</p>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-4 col-form-label font-weight-bold">เลขที่ SO:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">
                    {{ invoiceData.soNumber || '-' }}
                  </p>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-4 col-form-label font-weight-bold">วันที่สร้าง:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ formatDate(invoiceData.createDate) }}</p>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-4 col-form-label font-weight-bold">วันกำหนดส่ง:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ formatDate(invoiceData.deliveryDate) }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group row">
                <label class="col-sm-4 col-form-label font-weight-bold">สถานะ:</label>
                <div class="col-sm-8">
                  <span :class="getStatusBadgeClass(invoiceData.statusName)">
                    {{ invoiceData.statusName || '-' }}
                  </span>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-4 col-form-label font-weight-bold">เงื่อนไขการชำระ:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ invoiceData.paymentName || '-' }}</p>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-4 col-form-label font-weight-bold">มัดจำ (%):</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ invoiceData.depositPercent || 0 }}%</p>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-4 col-form-label font-weight-bold">ผู้สร้าง:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ invoiceData.createBy || '-' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Information -->
      <div class="card-container mb-3">
        <div class="card-header">
          <h6 class="mb-0">ข้อมูลลูกค้า</h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group row">
                <label class="col-sm-4 col-form-label font-weight-bold">ชื่อลูกค้า:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ invoiceData.customerName || '-' }}</p>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-4 col-form-label font-weight-bold">ที่อยู่:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ invoiceData.customerAddress || '-' }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group row">
                <label class="col-sm-4 col-form-label font-weight-bold">เบอร์โทร:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ invoiceData.customerTel || '-' }}</p>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-4 col-form-label font-weight-bold">อีเมล:</label>
                <div class="col-sm-8">
                  <p class="form-control-plaintext">{{ invoiceData.customerEmail || '-' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Items -->
      <div class="card-container mb-3">
        <div class="card-header">
          <h6 class="mb-0">รายการสินค้า</h6>
        </div>
        <div class="card-body p-0">
          <DataTable
            :value="invoiceItems"
            class="p-datatable-sm"
            :scrollable="true"
            scrollHeight="400px"
            responsiveLayout="scroll"
            showGridlines
          >
            <ColumnGroup type="header">
              <Row>
                <Column header="#" :rowspan="2" style="width: 50px" />
                <Column header="รูปภาพ" :rowspan="2" style="width: 80px" />
                <Column header="เลขที่ผลิต" :rowspan="2" style="min-width: 150px" />
                <Column header="รหัสสินค้า" :rowspan="2" style="min-width: 150px" />
                <Column header="รายละเอียด" :rowspan="2" style="min-width: 200px" />
                <Column header="วัตถุดิบ" :colspan="3" />
                <Column header="ราคา" :colspan="5" />
                <Column header="จำนวน" :rowspan="2" style="width: 100px" />
                <Column header="รวม" :rowspan="2" style="min-width: 120px" />
              </Row>
              <Row>
                <Column header="Gold (gms)" style="min-width: 120px" />
                <Column header="Diamond (cts)" style="min-width: 140px" />
                <Column header="Stone (cts)" style="min-width: 140px" />
                <Column header="ราคาขาย (THB)" style="min-width: 150px" />
                <Column header="ราคาประเมิน (THB)" style="min-width: 150px" />
                <Column header="ส่วนลด (%)" style="min-width: 100px" />
                <Column header="ราคาส่วนลด (THB)" style="min-width: 150px" />
                <Column :header="'ราคาแปลง (' + (invoiceData.currencyUnit || 'USD') + ')'" style="min-width: 150px" />
              </Row>
            </ColumnGroup>

            <Column field="index" style="width: 50px">
              <template #body="slotProps">
                {{ slotProps.index + 1 }}
              </template>
            </Column>

            <Column field="image" style="width: 80px">
              <template #body="slotProps">
                <div v-if="slotProps.data.imagePath" class="text-center">
                  <img
                    :src="getImageUrl(slotProps.data.imagePath)"
                    alt="Product"
                    style="width: 50px; height: 50px; object-fit: cover;"
                    @error="handleImageError"
                  />
                </div>
              </template>
            </Column>

            <Column field="stockNumber" style="min-width: 150px">
              <template #body="slotProps">
                <div>{{ slotProps.data.stockNumberOrigin || slotProps.data.stockNumber || '-' }}</div>
                <small v-if="!slotProps.data.stockNumber" class="text-danger">Debug: No stockNumber</small>
              </template>
            </Column>

            <Column field="productNumber" style="min-width: 150px">
              <template #body="slotProps">
                <div>{{ slotProps.data.productNumber || slotProps.data.productCode || '-' }}</div>
                <small v-if="!slotProps.data.productNumber" class="text-danger">Debug: No productNumber</small>
              </template>
            </Column>

            <Column field="description" style="min-width: 200px">
              <template #body="slotProps">
                <div>{{ slotProps.data.description || slotProps.data.productDescription || '-' }}</div>
                <small v-if="!slotProps.data.description" class="text-danger">Debug: No description</small>
              </template>
            </Column>

            <!-- Materials Columns -->
            <Column field="gold" style="min-width: 120px">
              <template #body="slotProps">
                <div v-if="slotProps.data.materials && slotProps.data.materials.length > 0">
                  <div
                    v-for="(item, idx) in slotProps.data.materials.filter((m) => m.type === 'Gold')"
                    :key="idx"
                    class="material-cell"
                  >
                    <div class="material-typecode-gold">{{ item.typeCode }}</div>
                    <div class="material-weight">
                      {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                    </div>
                  </div>
                </div>
                <small v-else class="text-muted">No materials</small>
              </template>
            </Column>

            <Column field="diamond" style="min-width: 140px">
              <template #body="slotProps">
                <div v-if="slotProps.data.materials && slotProps.data.materials.length > 0">
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
                <small v-else class="text-muted">-</small>
              </template>
            </Column>

            <Column field="gem" style="min-width: 140px">
              <template #body="slotProps">
                <div v-if="slotProps.data.materials && slotProps.data.materials.length > 0">
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
                <small v-else class="text-muted">-</small>
              </template>
            </Column>

            <Column field="priceOrigin" style="min-width: 150px">
              <template #body="slotProps">
                <div class="text-right">
                  {{ formatNumber(slotProps.data.priceOrigin || slotProps.data.price || slotProps.data.pricePerUnit) }}
                </div>
                <small v-if="!slotProps.data.priceOrigin && !slotProps.data.price" class="text-danger">Debug: No price</small>
              </template>
            </Column>

            <Column field="appraisalPrice" style="min-width: 150px">
              <template #body="slotProps">
                <div class="text-right">
                  {{ formatNumber(slotProps.data.appraisalPrice || slotProps.data.price) }}
                </div>
                <small v-if="!slotProps.data.appraisalPrice" class="text-danger">Debug: No appraisalPrice</small>
              </template>
            </Column>

            <Column field="discountPercent" style="min-width: 100px">
              <template #body="slotProps">
                <div class="text-right">
                  {{ (slotProps.data.discountPercent || 0).toFixed(2) }}%
                </div>
              </template>
            </Column>

            <Column field="discountPrice" style="min-width: 150px">
              <template #body="slotProps">
                <div class="text-right">
                  {{
                    formatNumber(
                      Number(slotProps.data.appraisalPrice || 0) *
                        (1 - (slotProps.data.discountPercent || 0) / 100)
                    )
                  }}
                </div>
              </template>
            </Column>

            <Column field="convertedPrice" style="min-width: 150px">
              <template #body="slotProps">
                <div class="text-right">
                  {{
                    formatNumber(
                      (Number(slotProps.data.appraisalPrice || 0) *
                        (1 - (slotProps.data.discountPercent || 0) / 100)) /
                        (invoiceData.currencyRate || 1)
                    )
                  }}
                </div>
              </template>
            </Column>

            <Column field="qty" style="width: 100px">
              <template #body="slotProps">
                <div class="text-right">{{ slotProps.data.qty || 0 }}</div>
              </template>
            </Column>

            <Column field="total" style="min-width: 120px">
              <template #body="slotProps">
                <div class="text-right">
                  {{
                    formatNumber(
                      ((Number(slotProps.data.appraisalPrice || 0) *
                        (1 - (slotProps.data.discountPercent || 0) / 100)) /
                        (invoiceData.currencyRate || 1)) *
                        (Number(slotProps.data.qty) || 0)
                    )
                  }}
                </div>
              </template>
            </Column>

            <!-- Footer Section - same as Sale Order -->
            <ColumnGroup type="footer">
              <!-- Total Row -->
              <Row>
                <!-- Columns: #, รูปภาพ, เลขที่ผลิต, รหัสสินค้า, รายละเอียด = 5 cols -->
                <Column :colspan="5">
                  <template #footer>
                    <div class="text-left type-container">
                      <span class="mr-2">Net Weight Of Merchandise</span>
                      <span class="mr-2">{{ getNetWeight(invoiceItems) }}</span>
                      <span>gms.</span>
                    </div>
                  </template>
                </Column>
                <!-- Gold column = 1 col -->
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ getGoldWeight(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>
                <!-- Diamond column = 1 col -->
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ getDiamondWeight(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>
                <!-- Stone column = 1 col -->
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ getGemWeight(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>
                <!-- ราคาขาย + ราคาประเมิน = 2 cols -->
                <Column :colspan="2">
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ getSumAppraisalPrice(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>
                <!-- ส่วนลด + ราคาส่วนลด = 2 cols -->
                <Column :colspan="2">
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ getSumDiscountPrice(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>
                <!-- ราคาแปลง = 1 col -->
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ getSumConvertedPrice(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>
                <!-- จำนวน = 1 col -->
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ getSumQty(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>
                <!-- รวม = 1 col -->
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ getSumTotalConvertedPrice(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>
              </Row>

              <!-- Grand Total Row -->
              <Row>
                <!-- All columns except last one = 14 cols -->
                <Column :colspan="14">
                  <template #footer>
                    <div class="text-right type-container">
                      <span>ราคารวม</span>
                    </div>
                  </template>
                </Column>
                <!-- Last column = 1 col -->
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ formatNumber(calculateGrandTotal()) }}</span>
                    </div>
                  </template>
                </Column>
              </Row>
            </ColumnGroup>
          </DataTable>
        </div>
      </div>

      <!-- Price Summary -->
      <div class="card-container mb-3">
        <div class="card-header">
          <h6 class="mb-0">สรุปยอด</h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6 offset-md-6">
              <div class="form-group row">
                <label class="col-sm-6 col-form-label font-weight-bold">หน่วยเงิน:</label>
                <div class="col-sm-6 text-right">
                  <p class="form-control-plaintext">{{ invoiceData.currencyUnit || 'THB' }}</p>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-6 col-form-label font-weight-bold">อัตราแลกเปลี่ยน:</label>
                <div class="col-sm-6 text-right">
                  <p class="form-control-plaintext">{{ formatNumber(invoiceData.currencyRate) }}</p>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-6 col-form-label font-weight-bold">ส่วนลด:</label>
                <div class="col-sm-6 text-right">
                  <p class="form-control-plaintext">{{ formatNumber(invoiceData.discount) }}</p>
                </div>
              </div>
              <div class="form-group row border-top pt-2">
                <label class="col-sm-6 col-form-label font-weight-bold">ยอดรวมทั้งสิ้น:</label>
                <div class="col-sm-6 text-right">
                  <p class="form-control-plaintext font-weight-bold text-success">
                    {{ formatNumber(calculateTotal()) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Remark -->
      <div v-if="invoiceData.remark" class="card-container mb-3">
        <div class="card-header">
          <h6 class="mb-0">หมายเหตุ</h6>
        </div>
        <div class="card-body">
          <p class="mb-0">{{ invoiceData.remark }}</p>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="alert alert-warning">
      <i class="bi bi-info-circle mr-2"></i>
      ไม่พบข้อมูล Invoice
    </div>
  </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { error, success, confirmSubmit } from '@/services/alert/sweetAlerts.js'
import { invoicePdfService } from '@/services/helper/pdf/invoice/invoice-pdf-integration.js'
import dayjs from 'dayjs'

export default {
  name: 'InvoiceDetailView',
  components: {
    DataTable,
    Column,
    ColumnGroup,
    Row
  },
  data() {
    return {
      invoiceData: null,
      invoiceItems: [],
      loadError: null,
      invoiceStore: useInvoiceApiStore(),
      saleOrderStore: usrSaleOrderApiStore(),
      fromRoute: null // Store the route we came from
    }
  },
  async mounted() {
    // Store the route we came from for navigation after delete
    this.fromRoute = this.$route.query.from || null

    // Get invoice number from route query
    const invoiceNumber = this.$route.query.invoiceNumber
    if (invoiceNumber) {
      await this.loadInvoiceData(invoiceNumber)
    } else {
      this.loadError = 'ไม่พบเลขที่ Invoice ในระบบ'
    }
  },
  methods: {
    async loadInvoiceData(invoiceNumber) {
      try {
        this.loadError = null

        // Load Invoice data - same structure as Sale Order
        const invoiceResponse = await this.invoiceStore.fetchGet({
          formValue: { invoiceNumber: invoiceNumber }
        })

        console.log('Invoice API Response:', invoiceResponse)

        // Check if response has data directly or nested in data property
        const invoiceData = invoiceResponse

        if (!invoiceData || !invoiceData.invoiceNumber) {
          console.warn('No invoice data found in response:', invoiceResponse)
          this.loadError = 'ไม่พบข้อมูล Invoice ที่ต้องการ'
          return
        }

        // Set invoice header data
        this.invoiceData = invoiceData

        // Parse items from Data field (JSON string) - same as Sale Order
        if (invoiceData.data && typeof invoiceData.data === 'string') {
          try {
            let parsedData = JSON.parse(invoiceData.data)
            console.log('Parsed Sale Order Data:', parsedData)

            // Extract items from correct property - Sale Order data structure has stockItems, copyItems, allItems
            let allItems = []
            if (Array.isArray(parsedData)) {
              allItems = parsedData
            } else if (parsedData && typeof parsedData === 'object') {
              // Check for Sale Order data structure properties
              if (Array.isArray(parsedData.allItems)) {
                allItems = parsedData.allItems
                console.log('Using allItems array from parsed data')
              } else if (Array.isArray(parsedData.stockItems)) {
                allItems = parsedData.stockItems
                console.log('Using stockItems array from parsed data')
              } else if (Array.isArray(parsedData.items)) {
                allItems = parsedData.items
                console.log('Using items array from parsed data')
              } else {
                // Fallback: wrap object in array
                allItems = [parsedData]
                console.warn('No known array property found, wrapping object in array')
              }
            }

            console.log('All items array:', allItems)
            console.log('Confirmed items:', invoiceData.confirmedItems)

            // Filter items that belong to this invoice using confirmedItems
            if (invoiceData.confirmedItems && invoiceData.confirmedItems.length > 0) {
              // Get stock numbers that have this invoice
              const invoiceStockNumbers = invoiceData.confirmedItems.map(ci => ci.stockNumber)
              console.log('Invoice stock numbers to filter:', invoiceStockNumbers)

              // Filter and merge
              this.invoiceItems = allItems
                .filter(item => invoiceStockNumbers.includes(item.stockNumber))
                .map(item => {
                  // Find confirmedItem for this stock
                  const confirmedItem = invoiceData.confirmedItems.find(
                    ci => ci.stockNumber === item.stockNumber
                  )

                  // Merge item data with confirmed info
                  return {
                    ...item,
                    id: confirmedItem?.id,
                    isConfirmed: true,
                    invoice: confirmedItem?.invoice,
                    invoiceItem: confirmedItem?.invoiceItem
                  }
                })

              console.log('Filtered invoice items:', this.invoiceItems)
            } else {
              console.warn('No confirmedItems found, using all items')
              this.invoiceItems = allItems
            }
          } catch (e) {
            console.error('Error parsing invoice data:', e)
            this.invoiceItems = []
          }
        } else {
          console.warn('No data field found in invoice response', invoiceData.data)
          this.invoiceItems = []
        }

        console.log('Invoice data loaded:', this.invoiceData)
        console.log('Invoice items count:', this.invoiceItems.length)

        if (this.invoiceItems.length > 0) {
          console.log('First item structure:', this.invoiceItems[0])
          console.log('First item has materials:', this.invoiceItems[0].materials)
        }

      } catch (err) {
        console.error('Error loading invoice:', err)
        this.loadError = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล Invoice'
        error(this.loadError, 'ไม่สามารถโหลดข้อมูล Invoice ได้')
      }
    },
    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY')
    },
    formatNumber(value) {
      if (!value && value !== 0) return '0.00'
      return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    getStatusBadgeClass(status) {
      const statusMap = {
        'Draft': 'badge badge-secondary',
        'Confirmed': 'badge badge-success',
        'Cancelled': 'badge badge-danger',
        'Pending': 'badge badge-warning'
      }
      return statusMap[status] || 'badge badge-info'
    },
    calculateTotal() {
      let total = 0
      this.invoiceItems.forEach(item => {
        total += (item.price || 0) * (item.qty || 0)
      })

      // Apply discount
      total -= (this.invoiceData.discount || 0)

      return total
    },

    // Weight calculation methods - same as Sale Order
    getNetWeight(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials.reduce((matSum, mat) => {
              return matSum + (mat.weight || 0)
            }, 0)
          )
        }, 0)
        .toFixed(2)
    },

    getGoldWeight(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials
              .filter((m) => m.type === 'Gold')
              .reduce((matSum, mat) => matSum + (mat.weight || 0), 0)
          )
        }, 0)
        .toFixed(2)
    },

    getDiamondWeight(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials
              .filter((m) => m.type === 'Diamond')
              .reduce((matSum, mat) => matSum + (mat.weight || 0), 0)
          )
        }, 0)
        .toFixed(2)
    },

    getGemWeight(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials
              .filter((m) => m.type === 'Gem')
              .reduce((matSum, mat) => matSum + (mat.weight || 0), 0)
          )
        }, 0)
        .toFixed(2)
    },

    // Price calculation methods
    getAppraisalPrice(item) {
      return item.appraisalPrice || item.price || 0
    },

    getDiscountedPrice(item) {
      const appraisalPrice = this.getAppraisalPrice(item)
      const discountPercent = item.discountPercent || 0
      return appraisalPrice * (1 - discountPercent / 100)
    },

    getConvertedPrice(item) {
      const discountedPrice = this.getDiscountedPrice(item)
      const currencyRate = this.invoiceData.currencyRate || 1
      return discountedPrice / currencyRate
    },

    getTotalConvertedPrice(item) {
      const convertedPrice = this.getConvertedPrice(item)
      const qty = item.qty || 0
      return convertedPrice * qty
    },

    // Sum calculation methods
    getSumAppraisalPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      const total = items.reduce((sum, item) => {
        const price = this.getAppraisalPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    getSumDiscountPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      const total = items.reduce((sum, item) => {
        const price = this.getDiscountedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    getSumConvertedPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      const total = items.reduce((sum, item) => {
        const price = this.getConvertedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    getSumQty(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return 0

      return items.reduce((sum, item) => {
        return sum + (Number(item.qty) || 0)
      }, 0)
    },

    getSumTotalConvertedPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      const total = items.reduce((sum, item) => {
        const price = this.getTotalConvertedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    calculateGrandTotal() {
      const total = this.invoiceItems.reduce((sum, item) => {
        return sum + this.getTotalConvertedPrice(item)
      }, 0)

      return total
    },
    goBack() {
      this.$router.back()
    },
    async reprintPDF() {
      try {
        if (!this.invoiceData || !this.invoiceData.invoiceNumber) {
          error('ไม่พบข้อมูล Invoice', 'ไม่สามารถสร้าง PDF ได้')
          return
        }

        // Prepare data for PDF generation matching the expected structure
        const pdfData = {
          saleOrder: {
            soNumber: this.invoiceData.soNumber,
            date: this.invoiceData.createDate,
            expectedDeliveryDate: this.invoiceData.deliveryDate,
            paymentTerms: this.invoiceData.paymentName,
            depositPercent: this.invoiceData.depositPercent,
            remark: this.invoiceData.remark
          },
          customer: {
            name: this.invoiceData.customerName,
            address: this.invoiceData.customerAddress,
            tel: this.invoiceData.customerTel,
            email: this.invoiceData.customerEmail
          },
          currency: {
            unit: this.invoiceData.currencyUnit || 'THB',
            rate: this.invoiceData.currencyRate || 1
          },
          items: this.invoiceItems
        }

        const options = {
          invoiceNo: this.invoiceData.invoiceNumber,
          invoiceDate: dayjs(this.invoiceData.createDate).format('DD/MM/YYYY'),
          download: true,
          open: false
        }

        ////console.log('Generating PDF with data:', pdfData)

        await invoicePdfService.generateInvoicePDF(pdfData, options)
        success('สร้าง PDF สำเร็จ', 'Invoice PDF')
      } catch (err) {
        console.error('Error generating PDF:', err)
        error(err.message || 'ไม่สามารถสร้าง PDF ได้', 'เกิดข้อผิดพลาด')
      }
    },
    getImageUrl(imagePath) {
      if (!imagePath) return ''
      // Construct full image URL based on API base path
      // Adjust this path according to your API configuration
      const baseUrl = this.$store.state.apiBaseUrl || 'https://localhost:49153'
      return `${baseUrl}/Images/Stock/${imagePath}`
    },
    handleImageError(event) {
      // Hide broken image or show placeholder
      event.target.style.display = 'none'
    },
    async confirmReverseInvoice() {
      try {
        // Show confirmation dialog
        confirmSubmit(
          'การยกเลิก Invoice จะลบข้อมูลการออก Invoice และคืนสถานะสินค้ากลับไปยัง Sale Order',
          'คุณต้องการยกเลิก Invoice นี้หรือไม่?',
          async (result) => {
            if (result.isConfirmed) {
              await this.reverseInvoice()
            }
          },
          {
            confirmText: 'ยืนยัน',
            cancelText: 'ยกเลิก'
          },
          'warning'
        )
      } catch (err) {
        console.error('Error in confirmation:', err)
      }
    },
    async reverseInvoice() {
      try {
        if (!this.invoiceData || !this.invoiceData.invoiceNumber) {
          error('ไม่พบข้อมูล Invoice', 'ไม่สามารถยกเลิก Invoice ได้')
          return
        }

        // Call delete API
        await this.invoiceStore.fetchDelete({
          formValue: { invoiceNumber: this.invoiceData.invoiceNumber }
        })

        // Show success message
        success('ยกเลิก Invoice สำเร็จ', 'Invoice ได้ถูกยกเลิกแล้ว')

        // Navigate based on where we came from
        if (this.fromRoute === 'sale-order' && this.invoiceData.soNumber) {
          // If we came from sale-order, go back to sale-order with the SO number
          // This will trigger the sale-order page to reload the data
          this.$router.push({
            path: '/sale/sale-order',
            query: { soNumber: this.invoiceData.soNumber, mode: 'view' }
          })
        } else {
          // Otherwise just go back to previous page
          this.$router.back()
        }
      } catch (err) {
        console.error('Error reversing invoice:', err)
        error(err.message || 'ไม่สามารถยกเลิก Invoice ได้', 'เกิดข้อผิดพลาด')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.app-container {
  padding: 1rem;
}

.card-container {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: var(--base-font-color);
  border-bottom: 1px solid #e9ecef;
  border-radius: 5px 5px 0px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  font-weight: 300;
  color: white;
}

.card-body {
  padding: 1rem;
}

.form-control-plaintext {
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
  margin-bottom: 0;
  line-height: 1.5;
}

.badge {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

// Material cell styling for table
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
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.material-typecode-gold {
  flex: 5;
  text-align: left;
  margin-right: 0.5rem;
  min-width: 40px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  color: #d4af37;
  font-weight: 600;
}

.material-weight {
  flex: 3;
  text-align: right;
  min-width: 60px;
  margin-left: auto;
  font-weight: 500;
}

// Table styling - same as Sale Order
:deep(.p-datatable-thead > tr > th) {
  text-align: center;
  vertical-align: middle;
  padding: 0.75rem 0.5rem;
  font-weight: 600;
}

:deep(.p-datatable-tbody > tr > td) {
  vertical-align: top;
  padding: 0.5rem;
}

:deep(.p-datatable-tfoot > tr > td) {
  vertical-align: middle;
  padding: 0.5rem;
  font-weight: 500;
}

.type-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: 30px;
}

.qty-container {
  text-align: right;
  min-width: 80px;
}

.text-right {
  text-align: right;
}
</style>
