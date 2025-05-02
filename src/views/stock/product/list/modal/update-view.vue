<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="1200px">
      <template v-slot:content>
        <div class="title-text-lg-bg">
          <span><i class="bi bi-brush mr-2"></i></span>
          <span>{{ `เเก้ไขสินค้า | เลขที่ผลิต: ${stock.stockNumber}` }}</span>
        </div>

        <form @submit.prevent="onSubmit" class="p-2">
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

                <!-- ส่วนปุ่มควบคุม -->
                <div class="image-controls mt-1">
                  <button
                    class="btn btn-green btn-sm ms-2"
                    type="button"
                    @click="onSelectImage('SELECT')"
                  >
                    <span class="bi bi-image"></span>
                    <span>เลือกรูปสินค้า</span>
                  </button>
                </div>
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
              <!-- mold -->
              <div class="form-col-sm-container">
                <div>
                  <div>
                    <span class="title-text">เเม่พิมพ์</span>
                    <span class="title-text"> *</span>
                  </div>
                  <input
                    class="form-control form-control-sm"
                    :style="getBgColor(stock.mold)"
                    type="text"
                    v-model="stock.mold"
                    required
                  />
                </div>
                <div></div>
              </div>

              <!-- name -->
              <div class="form-col-sm-container mt-2">
                <div>
                  <div>
                    <span class="title-text">ชื่อสินค้า EN</span>
                    <span class="title-text"> *</span>
                  </div>
                  <input
                    class="form-control form-control-sm"
                    :style="getBgColor(stock.productNameEn)"
                    type="text"
                    v-model="stock.productNameEn"
                    required
                  />
                </div>
                <div>
                  <div>
                    <span class="title-text">ชื่อสินค้า TH</span>
                    <span class="title-text"> *</span>
                  </div>
                  <input
                    class="form-control form-control-sm"
                    :style="getBgColor(stock.productNameTh)"
                    type="text"
                    v-model="stock.productNameTh"
                    required
                  />
                </div>
              </div>

              <!-- qty && price -->
              <div class="form-col-sm-container mt-2">
                <div>
                  <div>
                    <span class="title-text">จำนวน</span>
                    <span class="title-text"> *</span>
                  </div>
                  <input
                    class="form-control form-control-sm"
                    :style="getBgColor(stock.qty)"
                    type="number"
                    step="any"
                    min="0"
                    v-model="stock.qty"
                    required
                  />
                </div>
                <div>
                  <div>
                    <span class="title-text">ราคาขาย</span>
                    <span class="title-text"> *</span>
                  </div>
                  <input
                    class="form-control form-control-sm"
                    :style="getBgColor(stock.productPrice)"
                    type="number"
                    step="any"
                    min="0"
                    v-model="stock.productPrice"
                    required
                  />
                </div>
              </div>

              <!-- size && location -->
              <div class="form-col-sm-container mt-2">
                <div>
                  <div>
                    <span class="title-text">ขนาด</span>
                    <!-- <span class="title-text"> *</span> -->
                  </div>
                  <input
                    class="form-control form-control-sm"
                    :style="getBgColor(stock.size)"
                    type="text"
                    v-model="stock.size"
                    :required="isRequiredSizeField(stock.productType)"
                  />
                </div>
                <div>
                  <div>
                    <span class="title-text">คลังจัดเก็บ</span>
                    <!-- <span class="title-text"> *</span> -->
                  </div>
                  <input
                    class="form-control form-control-sm"
                    type="text"
                    v-model="stock.location"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    disabled
                  />
                </div>
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
                    :class="data.type === true ? `p-invalid` : ``"
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
                    >
                    </Dropdown>
                  </div>
                  <div v-else-if="data.type === 'Diamond'">
                    <!-- <input
                              type="text"
                              v-model="data.typeCode"
                              class="form-control"
                              placeholder="เกรดเพชร"
                              :style="getBgColor(false, data.typeCode)"
                              @input="updateTypeBarcode(data, slotProps.data.stockReceiptNumber)"
                            /> -->
                    <Dropdown
                      v-model="data.typeCode"
                      :options="masterDiamondGrade"
                      optionLabel="description"
                      optionValue="nameEn"
                      class="w-full md:w-14rem"
                      placeholder="เลือกพลอย"
                      :showClear="data.typeCode ? true : false"
                    >
                    </Dropdown>
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
                    >
                    </Dropdown>
                  </div>
                  <div v-else class="vertical-center-container text-center">
                    <span> --- โปรดระบุประเภท ---</span>
                  </div>
                </div>
              </template>

              <template #sizeTemplate="{ data }">
                <div class="d-flex justify-content-center">
                  <input
                    type="text"
                    v-model="data.size"
                    class="form-control"
                    :style="getBgColor(data.size)"
                  />
                </div>
              </template>

              <template #regionTemplate="{ data }">
                <div class="d-flex justify-content-center">
                  <input
                    type="text"
                    v-model="data.region"
                    class="form-control"
                    :style="getBgColor(data.region)"
                  />
                </div>
              </template>

              <template #qtyTemplate="{ data }">
                <div class="d-flex justify-content-center">
                  <input
                    type="number"
                    v-model="data.qty"
                    class="form-control"
                    :style="getBgColor(data.qty)"
                    placeholder="จำนวน"
                    min="0"
                  />
                  <input
                    type="text"
                    style="margin-left: 1px"
                    v-model="data.qtyUnit"
                    class="form-control"
                    :style="getBgColor(data.qtyUnit)"
                    placeholder="หน่วย"
                    min="0"
                  />
                </div>
              </template>

              <template #weightTemplate="{ data }">
                <div class="d-flex justify-content-center">
                  <input
                    type="number"
                    v-model="data.weight"
                    class="form-control"
                    :style="getBgColor(data.weight)"
                    placeholder="น้ำหนัก"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="text"
                    style="margin-left: 1px"
                    v-model="data.weightUnit"
                    class="form-control"
                    :style="getBgColor(data.qtyUnit)"
                    placeholder="หน่วย"
                    min="0"
                  />
                </div>
              </template>

              <template #priceTemplate="{ data }">
                <div class="d-flex justify-content-center">
                  <input
                    type="number"
                    v-model="data.price"
                    class="form-control"
                    :style="getBgColor(data.price)"
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

          <div class="data-container mt-4 pb-4">
            <div class="d-flex justify-content-center">
              <button class="btn btn-sm btn-green" type="submit">
                <span class="bi bi-calendar-check mr-2"></span>
                <span>เเก้ไขสินค้า</span>
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

import { stockProductImageApiStor } from '@/stores/modules/api/stock/image-api.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  components: {
    modal,
    imagePreview,
    BaseDataTable,
    Dropdown
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
    }
  },

  watch: {
    isShow: {
      handler(val) {
        //console.log('isShow', val)
        this.isShowModal = val
      },
      immediate: true
    },
    modelStock: {
      handler(val) {
        if (!val) return
        this.stock = { ...val }
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
      ]
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
      this.$emit('closeModal')
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

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
  padding: 0px 100px;
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
