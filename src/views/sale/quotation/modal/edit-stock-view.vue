<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="1300px">
      <template v-slot:content>
        <div class="title-text-lg-bg">
          <span><i class="bi bi-brush mr-2"></i></span>
          <span>{{ `เเก้ไขสินค้า | เลขที่ผลิต: ${stock.stockNumber}` }}</span>
        </div>

        <form @submit.prevent="onSubmit" class="mt-2">
          <!-- image -->
          <div class="form-col-container">
            <div v-if="imageStage === 'SHOW'" class="image-container">
              <div class="filter-container-img">
                <!-- ส่วนแสดงรูป -->
                <div class="image-preview">
                  <imagePreview
                    v-if="stock.imagePath"
                    :imageName="stock.imagePath"
                    :path="stock.imagePath"
                    :type="type"
                    :width="150"
                    :height="150"
                    :preview="true"
                    class="image-body"
                  />
                  <img
                    v-else
                    src="@/assets/no-image.png"
                    :width="150"
                    :height="150"
                    alt="Image"
                    class="image-body"
                  />
                </div>
                <!-- ลบปุ่มเลือกรูปสินค้าออก -->
              </div>
            </div>
            <div v-if="imageStage === 'SELECT'" class="image-container">
              <div class="input-group input-group-sm">
                <div class="input-group input-group-inner">
                  <input
                    class="form-control"
                    :style="getBgColor(search)"
                    type="text"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    v-model="search"
                    placeholder="ค้นหาด้วยชื่อรูปภาพ"
                    required
                  />
                  <div class="input-group-append">
                    <button
                      type="button"
                      class="btn btn-main btn-sm btn-input-group mt-1"
                      @click="fetchLatestImage"
                    >
                      <span class="bi bi-search"></span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <BaseDataTable
                  scrollHeight="200px"
                  :items="latestImage"
                  :totalRecords="latestImageTotalRecords"
                  :columns="imageColumns"
                  :perPage="take"
                  :rowsPerPageOptions="[10, 20, 50]"
                  :selectionMode="true"
                  :itemsSelection="selectedItems"
                  :selectionType="selectionType"
                  @update:itemsSelection="updateSelection"
                  @page="handlePageChange"
                  @sort="handleSortChange"
                >
                  <!-- Image Column -->
                  <template #imageTemplate="{ data }">
                    <div>
                      <imagePreview
                        :imageName="data.path"
                        :path="data.path"
                        :type="type"
                        :width="30"
                        :height="30"
                        :preview="true"
                      />
                    </div>
                  </template>

                  <!-- Custom Footer/Paginator Buttons -->
                  <template #paginator-buttons>
                    <button
                      class="btn btn-sm btn-dark mr-2"
                      type="button"
                      @click="onSelectImage('SHOW')"
                    >
                      <span><i class="bi bi-x"></i></span>
                    </button>
                    <button
                      :class="[
                        'btn btn-sm',
                        !selectedItems.length > 0 ? 'btn-secondary' : 'btn-main'
                      ]"
                      type="button"
                      :disabled="!selectedItems.length > 0"
                      title="ปรับปรุง"
                      @click="onSelect"
                    >
                      <span><i class="bi bi-pencil-square"></i></span>
                    </button>
                  </template>
                </BaseDataTable>
              </div>
            </div>
          </div>

          <div class="data-container mt-4">
            <div class="d-flex justify-content-between">
              <div class="vertical-center-container">
                <span class="title-text-lg bi bi-clipboard2-check-fill"></span>
                <span class="title-text-lg ml-2">ข้อมูลสินค้า</span>
              </div>
              <div></div>
            </div>
            <div class="filter-container data-container pt-3 pb-4">
              <!-- productNumber -->
              <div class="form-col-sm-container">
                <div>
                  <span class="title-text">รหัสสินค้า</span>
                  <input
                    class="form-control form-control-sm"
                    type="text"
                    v-model="stock.productNumber"
                    required
                  />
                </div>
                <div></div>
              </div>
              <!-- description -->
              <div class="form-col-sm-container mt-2">
                <div>
                  <span class="title-text">รายละเอียด</span>
                  <input
                    class="form-control form-control-sm"
                    type="text"
                    v-model="stock.description"
                  />
                </div>
                <div></div>
              </div>
            </div>
          </div>

          <div class="data-container mt-4">
            <div class="d-flex justify-content-between">
              <div class="vertical-center-container">
                <span class="title-text-lg bi bi-gem"></span>
                <span class="title-text-lg ml-2">ทอง | เพชร | พลอย</span>
              </div>
              <!-- Add button -->
              <div class="d-flex justify-content-center mt-2">
                <div type="button" class="pr-2 text-dark" @click="addMaterialItem(stock.materials)">
                  <span class="bi bi-plus-lg"></span>
                  <span></span>
                </div>
              </div>
            </div>

            <BaseDataTable :items="stock.materials" :columns="materialColumns" :paginator="false">
              <template #typeTemplate="{ data }">
                <div class="d-flex justify-content-center">
                  <Dropdown
                    v-model="data.type"
                    :options="masterMaterialType"
                    optionLabel="description"
                    optionValue="value"
                    class="w-full md:w-14rem"
                  />
                </div>
              </template>
              <template #typeCodeTemplate="{ data }">
                <div class="">
                  <div v-if="data.type === 'Gold' || data.type === 'Silver'">
                    <Dropdown
                      v-model="data.typeCode"
                      :options="masterGold"
                      optionLabel="description"
                      optionValue="code"
                      class="w-full md:w-14rem"
                      placeholder="เลือกทอง"
                      :showClear="data.typeCode ? true : false"
                    />
                  </div>
                  <div v-else-if="data.type === 'Diamond'">
                    <Dropdown
                      v-model="data.typeCode"
                      :options="masterDiamondGrade"
                      optionLabel="description"
                      optionValue="nameEn"
                      class="w-full md:w-14rem"
                      placeholder="เลือกเพชร"
                      :showClear="data.typeCode ? true : false"
                    />
                  </div>
                  <div v-else-if="data.type === 'Gem'">
                    <Dropdown
                      v-model="data.typeCode"
                      :options="masterGem"
                      optionLabel="description"
                      optionValue="nameEn"
                      class="w-full md:w-14rem"
                      placeholder="เลือกพลอย"
                      :showClear="data.typeCode ? true : false"
                    />
                  </div>
                  <div v-else class="vertical-center-container text-center">
                    <span> --- โปรดระบุประเภท ---</span>
                  </div>
                </div>
              </template>
              <template #qtyTemplate="{ data }">
                <div class="d-flex justify-content-center">
                  <input
                    type="number"
                    v-model="data.qty"
                    class="form-control"
                    placeholder="จำนวน"
                    min="0"
                  />
                  <input
                    type="text"
                    style="margin-left: 1px"
                    v-model="data.qtyUnit"
                    class="form-control"
                    placeholder="หน่วย"
                  />
                </div>
              </template>
              <template #weightTemplate="{ data }">
                <div class="d-flex justify-content-center">
                  <input
                    type="number"
                    v-model="data.weight"
                    class="form-control"
                    placeholder="น้ำหนัก"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="text"
                    style="margin-left: 1px"
                    v-model="data.weightUnit"
                    class="form-control"
                    placeholder="หน่วย"
                  />
                </div>
              </template>
              <template #priceTemplate="{ data }">
                <div class="d-flex justify-content-center">
                  <input
                    type="number"
                    v-model="data.price"
                    class="form-control"
                    min="0"
                    step="0.01"
                  />
                </div>
              </template>
              <template #actionTemplate="{ index }">
                <div class="d-flex align-items-center mt-1">
                  <button
                    type="button"
                    class="btn btn-red btn-sm"
                    @click="removeMaterialItem(stock, index)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </template>
            </BaseDataTable>
          </div>

          <!-- ประเมินราคาสินค้า (inline, ไม่ใช้ modal) -->
          <div class="data-container mt-4 pb-4">
            <div class="vertical-center-container mb-2">
              <span class="title-text-lg bi bi-calculator"></span>
              <span class="title-text-lg ml-2">ประเมินราคาสินค้า</span>
            </div>
            <!-- ข้อความแจ้งเตือนว่ารายการที่แสดงเป็นราคาต่อชิ้น -->
            <div class="mb-2" style="color: #888; font-size: 14px;">
              * รายการที่แสดงในตารางนี้เป็นราคาต่อ 1 ชิ้น (หารต้นทุนตามจำนวนแผนผลิตแล้ว)
            </div>
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
                    title="ลบ"
                    @click="delTranItem(slotProps.index)"
                  >
                    <span class="bi bi-trash"></span>
                  </button>
                </template>
              </Column>
              <Column field="nameDescription">
                <template #body="slotProps">
                  <div v-if="slotProps.data.isAdd">
                    <input
                      type="text"
                      style="background-color: #b5dad4"
                      class="form-control"
                      v-model="slotProps.data.nameDescription"
                      required
                    />
                  </div>
                  <div v-else>
                    <span>{{ slotProps.data.nameDescription }}</span>
                    <span
                      v-if="slotProps.data.nameGroup === 'Gold' && slotProps.data.priceReference"
                      class="ml-2 text-ref"
                    >
                      {{
                        `[ ราคาอ้างอิง --> ${Number(slotProps.data.priceReference).toFixed(2)} ]`
                      }}
                    </span>
                  </div>
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
                        <span>ต้นทุนรวมทั้งหมด</span>
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
              </ColumnGroup>
            </DataTable>
            <!-- ต้นทุนต่อชิ้น -->
            <div class="d-flex align-items-center mt-3">
              <span class="mr-2 type-container">ต้นทุนต่อชิ้น:</span>
              <span class="font-weight-bold mr-3 type-container">{{
                costPerPiece.toFixed(2)
              }}</span>
              <!-- <span class="mr-3 type-container"
                >(แผนผลิต {{ stock.planQty || stock.qty || 1 }} ชิ้น)</span
              > -->
              <input type="checkbox" id="useCostPerPiece" v-model="useCostPerPiece" class="mr-1" />
              <span for="useCostPerPiece">ใช้ต้นทุนต่อชิ้นเป็นราคาประเมิน</span>
            </div>
            <div class="action-group-container mt-2">
              <div class="d-flex align-items-center gap-2">
                <Dropdown
                  v-model="masterValue"
                  :options="masterType"
                  optionLabel="name"
                  optionValue="code"
                  class="w-full md:w-14rem mr-2"
                  placeholder="เลือกรายการ"
                />
                <button
                  type="button"
                  class="btn btn-sm btn-green mt-1 mr-2"
                  title="เพิ่มรายการ"
                  @click="addTranItem"
                >
                  <span><i class="bi bi-plus"></i></span>
                </button>
              </div>
              <div></div>
            </div>
          </div>

          <div class="data-container mt-4 pb-4">
            <div class="d-flex justify-content-center">
              <button class="btn btn-sm btn-green" type="button" @click="onSave">
                <span class="bi bi-calendar-check mr-2"></span>
                <span>บันทึก</span>
              </button>
              <button class="btn btn-sm btn-secondary ml-2" type="button" @click="closeModal">
                <span class="bi bi-x mr-2"></span>
                <span>ยกเลิก</span>
              </button>
            </div>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))
const BaseDataTable = defineAsyncComponent(() =>
  import('@/components/prime-vue/DataTableWithPaging.vue')
)

import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'

import { stockProductImageApiStor } from '@/stores/modules/api/stock/image-api.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  components: {
    modal,
    imagePreview,
    BaseDataTable,
    Dropdown,
    DataTable,
    Column,
    ColumnGroup,
    Row
  },

  setup() {
    const stockProductImageStore = stockProductImageApiStor()
    const productStore = usrStockProductApiStore()
    const masterStore = useMasterApiStore()
    return { stockProductImageStore, productStore, masterStore }
  },

  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    },
    modelStock: {
      type: Object,
      required: true,
      default: () => {}
    }
  },

  computed: {
    masterGold() {
      return this.masterStore.gold
    },
    masterGem() {
      return this.masterStore.gem
    },
    masterDiamondGrade() {
      return this.masterStore.diamondGrade
    },
    costPerPiece() {
      // tranItems เป็นราคาต่อชิ้นอยู่แล้ว ไม่ต้องหารซ้ำ
      return Number(this.caltotalPrice(this.tranItems))
    }
  },

  watch: {
    isShow: {
      handler(val) {
        this.isShowModal = val
      },
      immediate: true
    },
    modelStock: {
      handler(val) {
        if (!val) return
        this.stock = { ...val }
        // ใช้ข้อมูล priceTransactions เสมอถ้ามี ต้องหารด้วย planQty เพื่อทำเป็นข้อมูลต่อชิ้น
        if (this.stock.priceTransactions && this.stock.priceTransactions.length > 0) {
          const planQty = Number(this.stock.planQty) || 1
          this.tranItems = this.stock.priceTransactions.map((item) => ({
            // ต้องหารด้วย planQty ทุกรายการ เพื่อทำเป็นข้อมูลต่อชิ้น
            nameGroup: item.nameGroup || (item.type === 'Diamond' ? 'Gem' : item.type) || 'ETC',
            nameDescription: item.nameDescription || item.typeCode || item.description || item.type || '',
            qty: (Number(item.qty) || 0) / planQty,
            qtyPrice: (Number(item.qtyPrice) || 0) / planQty,
            qtyWeight: (Number(item.qtyWeight) || 0) / planQty,
            qtyWeightPrice: (Number(item.qtyWeightPrice) || 0) / planQty,
            totalPrice: (((Number(item.qty) || 0) / planQty) * ((Number(item.qtyPrice) || 0) / planQty) + ((Number(item.qtyWeight) || 0) / planQty) * ((Number(item.qtyWeightPrice) || 0) / planQty)).toFixed(2),
            isAdd: true
          }))
        } else if (this.stock.materials && this.stock.materials.length > 0) {
          this.tranItems = this.stock.materials.map((mat) => ({
            nameGroup: mat.type === 'Diamond' ? 'Gem' : mat.type,
            //nameGroup: mat.type,
            nameDescription: mat.typeCode || mat.description || mat.type || '',
            qty: mat.qty || 0,
            qtyPrice: mat.price || 0,
            qtyWeight: mat.weight || 0,
            qtyWeightPrice: 0,
            totalPrice: ((mat.qty || 0) * (mat.price || 0) + (mat.weight || 0) * 0).toFixed(2),
            isAdd: true
          }))
        } else {
          this.tranItems = []
        }
      },
      immediate: true
    }
  },

  data() {
    return {
      isShowModal: false,
      type: 'STOCK-PRODUCT',
      imageStage: 'SHOW',

      stock: {},
      search: null,

      imageColumns: [
        {
          field: 'image',
          header: '',
          width: '50px',
          sortable: false,
          align: 'center'
        },

        {
          field: 'name',
          header: 'ชื่อ',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'createDate',
          header: 'วันที่สร้าง',
          sortable: false,
          format: 'datetime',
          minWidth: '150px'
        }
        // {
        //   field: 'remark',
        //   header: 'รายละเอียด',
        //   sortable: false,
        //   minWidth: '150px'
        // }
      ],
      tableHeight: '800px',
      take: 10,
      skip: 0,
      sort: [],

      latestImage: [],
      latestImageTotalRecords: 0,
      selectedItems: [],
      selectionType: 'single',

      materialColumns: [
        {
          field: 'type',
          header: 'ประเภท',
          sortable: false,
          width: '100px'
        },
        {
          field: 'typeCode',
          header: 'รหัส',
          sortable: false,
          minWidth: '100px'
        },
        {
          field: 'size',
          header: 'ขนาด',
          sortable: false,
          width: '100px'
        },
        {
          field: 'region',
          header: 'เเหล่งผลิต',
          sortable: false,
          width: '80px'
        },
        {
          field: 'qty',
          header: 'จำนวน',
          sortable: false,
          width: '200px'
        },
        {
          field: 'weight',
          header: 'น้ำหนัก',
          sortable: false,
          width: '200px'
        },
        {
          field: 'price',
          header: 'ราคา',
          sortable: false,
          width: '100px'
        },

        {
          field: 'action',
          header: '',
          sortable: false,
          width: '50px'
        }
      ],
      masterMaterialType: [
        { value: 'Gold', description: 'ทอง' },
        { value: 'Silver', description: 'เงิน' },
        { value: 'Diamond', description: 'เพชร' },
        { value: 'Gem', description: 'พลอย' }
      ],

      isShowPriceModal: false, // ไม่ใช้ modal แล้ว แต่คงไว้ไม่กระทบ logic เดิม
      tranItems: [],
      masterValue: 'ETC',
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
      priceColumns: [
        { field: 'nameDescription', header: 'รายละเอียด', sortable: false },
        { field: 'qty', header: 'จำนวน', sortable: false },
        { field: 'qtyPrice', header: 'ราคา/จำนวน', sortable: false },
        { field: 'qtyWeight', header: 'น้ำหนัก', sortable: false },
        { field: 'qtyWeightPrice', header: 'ราคา/น้ำหนัก', sortable: false },
        { field: 'totalPrice', header: 'ราคารวม', sortable: false },
        { field: 'action', header: '', sortable: false }
      ],

      useCostPerPiece: false
    }
  },
  mounted() {
    // ใช้ข้อมูล priceTransactions เสมอถ้ามี
    if (this.stock.priceTransactions && this.stock.priceTransactions.length > 0) {
      this.tranItems = this.stock.priceTransactions.map((item) => ({
        ...item,
        qty: item.qty ?? 0,
        qtyPrice: item.qtyPrice ?? 0,
        qtyWeight: item.qtyWeight ?? 0,
        qtyWeightPrice: item.qtyWeightPrice ?? 0,
        totalPrice: (
          (Number(item.qty) || 0) * (Number(item.qtyPrice) || 0) +
          (Number(item.qtyWeight) || 0) * (Number(item.qtyWeightPrice) || 0)
        ).toFixed(2),
        isAdd: !!item.isAdd
      }))
    } else if (this.stock.materials && this.stock.materials.length > 0) {
      this.tranItems = this.stock.materials.map((mat) => ({
        nameGroup: mat.type,
        nameDescription: mat.typeCode || mat.description || '',
        qty: mat.qty || 0,
        qtyPrice: mat.price || 0,
        qtyWeight: mat.weight || 0,
        qtyWeightPrice: 0,
        totalPrice: ((mat.qty || 0) * (mat.price || 0) + (mat.weight || 0) * 0).toFixed(2),
        isAdd: true
      }))
    } else {
      this.tranItems = []
    }
  },

  methods: {
    onClear() {
      this.stock = {}
      this.imageStage = 'SHOW'
      ;(this.search = null), (this.selectedItems = [])
      this.latestImage = []
    },
    closeModal() {
      this.$emit('closeModal', { action: 'cancel' })
      this.onClear()
    },
    onSave() {
      // อัปเดต priceTransactions ก่อนส่งข้อมูลกลับ parent
      this.stock.priceTransactions = [...this.tranItems]
      // ถ้าเลือกใช้ต้นทุนต่อชิ้นเป็นราคาพิเศษ
      if (this.useCostPerPiece) {
        // ส่ง appraisalPrice = costPerPiece * markup กลับไปด้วย
        const markup = this.$parent?.customer?.markup || 1
        this.stock.appraisalPrice = Number((this.costPerPiece * markup).toFixed(2))
      }
      // ส่งข้อมูลกลับ parent
      this.$emit('closeModal', { action: 'save', data: { ...this.stock } })
      this.onClear()
    },
    getBgColor(data) {
      if (data) {
        return 'background-color: #b5dad4'
      } else {
        return 'background-color: #dad4b5'
      }
    },
    isRequiredSizeField(data) {
      return ['G', 'B', 'R'].includes(data)
    },

    removeMaterialItem(item, index) {
      item.materials.splice(index, 1)
    },
    addMaterialItem(data) {
      data.push({
        type: '',
        qty: 1,
        qtyUnit: 'pc',
        weight: null,
        weightUnit: 'ct.',
        description: ''
      })
    },

    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchLatestImage()
    },
    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => ({
        field: item.field,
        dir: item.order === 1 ? 'asc' : 'desc'
      }))
      this.fetchLatestImage()
    },
    async fetchLatestImage() {
      this.selectedItems = []
      const res = await this.stockProductImageStore.fetchListImage({
        take: this.take,
        skip: this.skip,
        sort: [{ field: 'createDate', dir: 'desc' }],
        search: {
          name: this.search,
          year: null
        },
        skipLoading: true
      })

      if (res) {
        this.latestImageTotalRecords = res.total
        this.latestImage = res.data.map((item) => {
          return {
            id: item.id,
            name: item.name,
            year: item.year,
            remark: item.remark,
            path: item.namePath,
            createDate: item.createDate
          }
        })
      }
    },
    updateSelection(newSelection) {
      this.selectedItems = newSelection
    },
    onSelectImage(stage) {
      this.imageStage = stage
      this.fetchLatestImage()
    },
    onSelect() {
      this.stock.imagePath = this.selectedItems[0].path
      this.stock.name = this.selectedItems[0].name
      console.log('stock:', this.stock)

      this.imageStage = 'SHOW'
    },

    onSubmit() {
      console.log('submit', this.stock)
      swAlert.confirmSubmit('', 'ยืนยันการบันทึกข้อมูล?', async () => {
        this.fetchConfirm()
      })
    },
    async fetchConfirm() {
      //set type barcode
      if (this.stock.materials && this.stock.materials.length > 0) {
        this.stock.materials.forEach((item) => {
          item.typeBarcode = this.getBarcode(item)
        })
      }

      const response = await this.productStore.fetchUpdateStockProduct({
        formValue: this.stock
      })

      if (response) {
        this.$emit('closeModal', 'fetch')
        this.onClear()
      }
    },
    getBarcode(item) {
      let display = ''

      if (item.type === 'Diamond') {
        display = `${item.qty ?? ''}${item.type ?? ''}${item.weight ?? ''}${
          item.weightUnit ? ` ${item.weightUnit}` : ''
        }${item.typeCode ? `, ${item.typeCode}` : ''}`
      }

      if (item.type === 'Gold' || item.type === 'Silver') {
        display = `${item.weight ?? ``}${item.weightUnit ? ` ${item.weightUnit}` : ``}${
          item.type ? ` ${item.type}` : ``
        }`
      }

      if (item.type === 'Gem') {
        display = `${item.qty ?? ''}${item.typeCode ?? ''}${item.weight ?? ''}${
          item.weightUnit ? ` ${item.weightUnit}` : ``
        }`
      }

      return display
    },

    openPriceModal() {
      this.tranItems = this.prepareTranItemsFromStock()
      this.isShowPriceModal = true
    },
    closePriceModal() {
      this.isShowPriceModal = false
    },
    onSubmitPrice() {
      // อัปเดต stock.materials จาก tranItems
      this.updateStockWithTranItems(this.tranItems)
      // แจ้งเตือนหรือแสดงผลลัพธ์ตามต้องการ
    },
    syncMaterialsToTranItems() {
      this.tranItems = this.prepareTranItemsFromStock()
    },
    prepareTranItemsFromStock() {
      // แปลง stock.materials ไปเป็น tranItems (mapping ตามที่ต้องการ)
      return (this.stock.materials || []).map((mat) => ({
        nameDescription: mat.description || '',
        qty: mat.qty || 0,
        qtyPrice: mat.price || 0,
        qtyWeight: mat.weight || 0,
        qtyWeightPrice: 0,
        totalPrice: ((mat.qty || 0) * (mat.price || 0) + (mat.weight || 0) * 0).toFixed(2),
        isAdd: true
      }))
    },
    updateStockWithTranItems(tranItems) {
      // อัปเดต stock.materials จาก tranItems ที่ประเมินแล้ว
      this.stock.materials = tranItems.map((item) => ({
        description: item.nameDescription,
        qty: item.qty,
        price: item.qtyPrice,
        weight: item.qtyWeight
        // เพิ่ม field อื่น ๆ ตามต้องการ
      }))
    },
    onBluePrice(item, fieldName) {
      // คำนวณราคารวมใหม่เมื่อเปลี่ยนค่า (ใช้ค่าต่อชิ้น ไม่ต้องหาร planQty ซ้ำ)
      item[fieldName] = item[fieldName] ? Number(item[fieldName]) : 0
      item.totalPrice = (
        (Number(item.qty) || 0) * (Number(item.qtyPrice) || 0) +
        (Number(item.qtyWeight) || 0) * (Number(item.qtyWeightPrice) || 0)
      ).toFixed(2)
    },
    delTranItem(index) {
      this.tranItems.splice(index, 1)
    },
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

// ** ------ overide primevue style ------
.custom-input {
  margin-top: 5px !important;
}
input {
  margin-top: 0px !important;
}
:deep(.p-autocomplete .p-component) {
  margin-top: 0px !important;
  //background-color: #dad4b5;
}
// :deep(.p-datatable .p-datatable-tfoot > tr > td) {
//   text-align: left;
//   padding: 1rem 1rem;
//   border: 1px solid white;
//   border-width: 0 0 1px 0;
//   color: white;
//   background: var(--base-font-color);
// }

.type-container {
  font-size: 15px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;
  //margin: 0px 0px 10px 0px;
}
.action-group-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.text-ref {
  color: gray;
  font-size: small;
}

.form-col-fix-2-container {
  display: grid;
  //gap: 10px;
  padding: 0px;
  grid-template-columns: 4fr 2fr; /* แก้จาก repeat(auto-fit) เป็นการกำหนด 2 คอลัมน์แบบตายตัว */
}

.image-container {
  padding: 0px 100px;
}

.data-container {
  padding: 0px 20px;
}

.gem-container {
  padding: 0px 10px;
}

.filter-container-img {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  //gap: 1rem;
  padding: 1.5rem;
  border: 2px dashed #dddddd;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
  height: 299px;

  &:hover {
    border-color: #adb5bd;
  }

  .image-preview {
    //width: 200px;
    //height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: f8f9fa;
    border-radius: 4px;
    //box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .image-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-1px);
    }
  }
}

.image-body {
  //height: 100px;
  //width: 100px;
  border: 1px solid var(--base-color);
}

.btn-input-group {
  height: 35px;
  padding: 6px 12px;
  margin-top: 5px !important;
}
</style>
