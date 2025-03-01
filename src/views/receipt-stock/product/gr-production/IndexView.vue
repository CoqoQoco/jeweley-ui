<template>
  <div class="app-container">
    <headerView
      :model="data"
      :modelHeader="header"
      :modelGem="gems"
      @onFetch="onFetch"
    ></headerView>
    <!-- <div class="line mt-4 mb-4"></div> -->
    <div class="mb-2">
      <div class="form-col-repeat-container">
        <button class="btn btn-sm btn-outline-dark" type="button">
          <span class="bi bi-gear mr-2"></span>
          <span>ปรับเเต่งสินค้า</span>
        </button>
        <button class="btn btn-sm btn-outline-dark ml-2" disabled type="button">
          <span class="bi bi-image mr-2"></span>
          <span>อัพโหลดรูป</span>
        </button>
        <button class="btn btn-sm btn-outline-dark ml-2" type="button">
          <span class="bi bi-upc-scan mr-2"></span>
          <span>ออก barcode</span>
        </button>
      </div>
    </div>

    <div class="line"></div>

    <div class="form-col-container">
      <form @submit.prevent="onSubmit">
        <BaseDataTable
          :items="form"
          dataKey="stockReceiptNumber"
          :columns="columns"
          :paginator="false"
          :selectionMode="true"
          :itemsSelection="selectedItems"
          @update:itemsSelection="updateSelection"
          :disabledItems="itemsToDisable"
          :preSelectedItems="itemsToPreSelect"
          :expandable="true"
          :scrollHeight="scrollHeight"
          class="custom-form-table"
        >
          <!-- auto index -->
          <template #noTemplate="{ index }">
            <div class="d-flex justify-content-center">
              <span>{{ index + 1 }}</span>
            </div>
          </template>

          <template #productNumberTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.productNumber)"
                type="text"
                v-model="data.productNumber"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
            </div>
          </template>

          <template #productNameEnTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.productNameEN)"
                type="text"
                v-model="data.productNameEN"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNameEN }}</span>
            </div>
          </template>

          <template #productNameThTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.productNameTH)"
                type="text"
                v-model="data.productNameTH"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNameTH }}</span>
            </div>
          </template>

          <template #expansion="slotProps">
            <div class="p-2">
              <div v-if="slotProps.data.isReceipt">
                <div class="form-col-fix-2-container">
                  <div class="form-col-container">
                    <div class="filter-container-bg-focus">
                      <barcodeDemo
                        :madeIn="formBarcode.madeIn"
                        :madeInText="formBarcode.madeInText"
                        :stockNumber="slotProps.stockNumber"
                        :mold="formBarcode.mold"
                        :gold="slotProps.data.barcodeGold"
                        :gems="slotProps.data.barcodeGems"
                        :size="slotProps.data.size"
                        :goldType="formBarcode.goldType"
                        class="mt-4"
                      >
                      </barcodeDemo>
                    </div>
                  </div>
                  <!-- รูปสินค้า -->
                  <div class="form-col-container">
                    <div class="filter-container-img">
                      <!-- ส่วนแสดงรูป -->
                      <div class="image-preview">
                        <imagePreview
                          v-if="slotProps.data.imagePath"
                          :imageName="slotProps.data.imagePath"
                          :path="slotProps.data.imagePath"
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
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <!-- data & img -->
                <div class="form-col-fix-2-container">
                  <!-- detail -->
                  <div class="p-2 filter-container-bg-focus">
                    <!-- qty -->
                    <div class="form-col-container">
                      <div>
                        <div>
                          <span class="title-text">จำนวน</span>
                          <span class="title-text"> *</span>
                        </div>
                        <input
                          class="form-control form-control-sm"
                          :style="getBgColor(slotProps.data.isReceipt, slotProps.data.qty)"
                          type="number"
                          step="any"
                          min="0"
                          v-model="slotProps.data.qty"
                          :required="isRequiredField(slotProps.data)"
                        />
                      </div>

                      <div>
                        <div>
                          <span class="title-text">ราคาขาย</span>
                          <span class="title-text"> *</span>
                        </div>
                        <input
                          class="form-control form-control-sm"
                          :style="getBgColor(slotProps.data.isReceipt, slotProps.data.price)"
                          type="number"
                          step="any"
                          min="0"
                          v-model="slotProps.data.price"
                          :required="isRequiredField(slotProps.data)"
                        />
                      </div>
                    </div>

                    <!-- size -->
                    <div class="form-col-container mt-1">
                      <!-- size -->
                      <div>
                        <div>
                          <span class="title-text">ขนาด</span>
                          <!-- <span class="title-text"> *</span> -->
                        </div>
                        <input
                          type="text"
                          class="form-control form-control-sm"
                          v-model="slotProps.data.size"
                          autocomplete="off"
                          autocorrect="off"
                          autocapitalize="off"
                          spellcheck="false"
                        />
                      </div>

                      <!-- location -->
                      <div>
                        <div>
                          <span class="title-text">คลังจัดเก็บ</span>
                          <!-- <span class="txt-required"> *</span> -->
                        </div>
                        <input
                          type="text"
                          class="form-control form-control-sm"
                          v-model="slotProps.data.location"
                          autocomplete="off"
                          autocorrect="off"
                          autocapitalize="off"
                          spellcheck="false"
                          disabled
                        />
                      </div>
                    </div>

                    <!-- remark -->
                    <div class="form-col-container mt-1">
                      <div>
                        <div>
                          <span class="title-text">หมายเหตุ</span>
                          <!-- <span class="txt-required"> *</span> -->
                        </div>
                        <textarea
                          type="text"
                          class="form-control form-control-sm"
                          v-model="slotProps.data.remark"
                          autocomplete="off"
                          autocorrect="off"
                          autocapitalize="off"
                          spellcheck="false"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- รูปสินค้า -->
                  <div class="form-col-container">
                    <div class="filter-container-img">
                      <!-- ส่วนแสดงรูป -->
                      <div class="image-preview">
                        <imagePreview
                          v-if="slotProps.data.imagePath"
                          :imageName="slotProps.data.imagePath"
                          :path="slotProps.data.imagePath"
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
                          @click="onSelectImage(slotProps.data)"
                        >
                          <span class="bi bi-image"></span>
                          <span>เลือกรูปสินค้า</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- gold/diamond/gem weight -->
                <div class="form-col-container">
                  <!-- List of items -->
                  <div class="filter-container mt-2">
                    <div class="d-flex justify-content-between">
                      <div class="vertical-center-container">
                        <span class="title-text-lg bi bi-gem"></span>
                        <span class="title-text-lg ml-2">ทอง/เพชร/พลอย</span>
                      </div>
                      <!-- Add button -->
                      <div class="d-flex justify-content-start mt-2">
                        <button
                          type="button"
                          class="btn btn-green btn-sm"
                          @click="addMaterialItem(slotProps.data.materials)"
                        >
                          <span class="bi bi-plus-lg"></span>
                          <span></span>
                        </button>
                      </div>
                    </div>

                    <BaseDataTable
                      :items="slotProps.data.materials"
                      :columns="materialColumns"
                      :paginator="false"
                      :scrollHeight="scrollHeight"
                      class="custom-form-table-material"
                    >
                      <template #typeTemplate="{ data }">
                        <div class="d-flex justify-content-center">
                          <Dropdown
                            v-model="data.type"
                            :options="masterMaterialType"
                            optionLabel="description"
                            optionValue="value"
                            class="w-full md:w-14rem"
                            :class="data.type === true ? `p-invalid` : ``"
                            @change="updateTypeBarcode(data, slotProps.data.stockReceiptNumber)"
                          />
                        </div>
                      </template>

                      <template #typeCodeTemplate="{ data }">
                        <div class="">
                          <div v-if="data.type === 'Gold'">
                            <Dropdown
                              v-model="data.typeCode"
                              :options="masterGold"
                              optionLabel="description"
                              optionValue="code"
                              class="w-full md:w-14rem"
                              placeholder="เลือกทอง"
                              :showClear="data.typeCode ? true : false"
                              @change="updateTypeBarcode(data, slotProps.data.stockReceiptNumber)"
                            >
                            </Dropdown>
                          </div>
                          <div v-else-if="data.type === 'Diamond'">
                            <input
                              type="text"
                              v-model="data.typeCode"
                              class="form-control"
                              placeholder="เกรดเพชร"
                              :style="getBgColor(false, data.typeCode)"
                              @input="updateTypeBarcode(data, slotProps.data.stockReceiptNumber)"
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
                              @change="updateTypeBarcode(data, slotProps.data.stockReceiptNumber)"
                            >
                            </Dropdown>
                          </div>
                          <div v-else class="mt-3">
                            <span>--- โปรดระบุประเภท ---</span>
                          </div>
                        </div>
                      </template>

                      <template #sizeTemplate="{ data }">
                        <div class="d-flex justify-content-center">
                          <input
                            type="text"
                            v-model="data.size"
                            class="form-control"
                            :style="getBgColor(false, data.size)"
                            @input="updateTypeBarcode(data, slotProps.data.stockReceiptNumber)"
                          />
                        </div>
                      </template>

                      <template #qtyTemplate="{ data }">
                        <div class="d-flex justify-content-center">
                          <input
                            type="number"
                            v-model="data.qty"
                            class="form-control"
                            :style="getBgColor(false, data.qty)"
                            placeholder="จำนวน"
                            min="0"
                            @input="updateTypeBarcode(data, slotProps.data.stockReceiptNumber)"
                          />
                          <input
                            type="text"
                            style="margin-left: 1px"
                            v-model="data.qtyUnit"
                            class="form-control"
                            :style="getBgColor(false, data.qtyUnit)"
                            placeholder="หน่วย"
                            min="0"
                            @input="updateTypeBarcode(data, slotProps.data.stockReceiptNumber)"
                          />
                        </div>
                      </template>

                      <template #weightTemplate="{ data }">
                        <div class="d-flex justify-content-center">
                          <input
                            type="number"
                            v-model="data.weight"
                            class="form-control"
                            :style="getBgColor(false, data.weight)"
                            placeholder="น้ำหนัก"
                            min="0"
                            step="0.01"
                            @input="updateTypeBarcode(data, slotProps.data.stockReceiptNumber)"
                          />
                          <input
                            type="text"
                            style="margin-left: 1px"
                            v-model="data.weightUnit"
                            class="form-control"
                            :style="getBgColor(false, data.qtyUnit)"
                            placeholder="หน่วย"
                            min="0"
                            @input="updateTypeBarcode(data, slotProps.data.stockReceiptNumber)"
                          />
                        </div>
                      </template>

                      <template #priceTemplate="{ data }">
                        <div class="d-flex justify-content-center">
                          <input
                            type="number"
                            v-model="data.price"
                            class="form-control"
                            :style="getBgColor(false, data.price)"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </template>

                      <template #typeBarcodeTemplate="{ data }">
                        <div class="d-flex justify-content-center">
                          <input
                            type="text"
                            v-model="data.typeBarcode"
                            class="form-control"
                            :style="getBgColor(false, data.typeBarcode)"
                            placeholder="ข้อความที่จะเเสดงบน Barcode"
                          />
                        </div>
                      </template>

                      <template #actionTemplate="{ index }">
                        <div class="d-flex align-items-center mt-1">
                          <button
                            type="button"
                            class="btn btn-red btn-sm"
                            @click="removeMaterialItem(slotProps.data.materials, index)"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </template>
                    </BaseDataTable>
                  </div>
                </div>

                <div class="form-col-container mt-2">
                  <div class="filter-container-bg-focus">
                    <barcodeDemo
                      :madeIn="formBarcode.madeIn"
                      :madeInText="formBarcode.madeInText"
                      :stockNumber="slotProps.stockNumber"
                      :mold="formBarcode.mold"
                      :gold="slotProps.data.barcodeGold"
                      :gems="slotProps.data.barcodeGems"
                      :size="slotProps.data.size"
                      :goldType="formBarcode.goldType"
                    >
                    </barcodeDemo>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="line"></div>

            <div class="d-flex justify-content-between items-center">
              <span>จำนวนรายการที่เลือก: {{ checkItemSelectedLength() }}</span>
              <div>
                <button class="btn btn-sm btn-green" type="button" @click="fetchDraft">
                  <span v-if="isOnDraft" class="spinner-border spinner-border-sm"></span>
                  <span v-else class="bi bi-clipboard2-pulse-fill"></span>
                  <span class="ml-2">บันทึกฉบับร่าง</span>
                </button>
                <button
                  :class="[
                    'btn btn-sm btn-main ml-2',
                    checkItemSelectedLength() > 0 ? 'btn-main' : 'btn-secondary'
                  ]"
                  type="submit"
                  :disabled="checkItemSelectedLength() === 0"
                >
                  <span class="bi bi-upload"></span>
                  <span class="ml-2">บันทึกสินค้า</span>
                </button>
              </div>
            </div>
          </template>
        </BaseDataTable>
      </form>
    </div>

    <modalSelectImage
      :isShow="isShowSelectImage"
      :modelStock="stockUpdate"
      @select="updateImage"
      @closeModal="closeModal"
    ></modalSelectImage>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
//const imgPreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))
//const uploadImages = defineAsyncComponent(() => import('@/components/prime-vue/UploadImages.vue'))
const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

import Dropdown from 'primevue/dropdown'
//import Image from 'primevue/image'

import { useReceiptProductionApiStore } from '@/stores/modules/api/receipt/receipt-production-api.js'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
//import uploadImages from '@/components/prime-vue/UploadImages.vue'

import api from '@/axios/axios-helper.js'
import swAlert from '@/services/alert/sweetAlerts.js'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import headerView from './components/production-header-view.vue'
import modalSelectImage from './components/image-select-view.vue'
import barcodeDemo from './components/barcode-demo-view.vue'

const interfaceBarcode = {
  madeIn: 'MADE IN THAILAND',
  madeInText: 'XXXXXXXXXXX',
  mold: 'RFXXXXR',
  goldType: 'XXK'
}

export default {
  name: 'ProductionPlanList',

  components: {
    BaseDataTable,
    Dropdown,
    imagePreview,
    //Image,
    headerView,
    modalSelectImage,
    barcodeDemo
    //imgPreview,
    //Image
    //uploadImages
  },

  setup() {
    const receiptProductionStore = useReceiptProductionApiStore()
    const masterStore = useMasterApiStore()
    return { receiptProductionStore, masterStore }
  },

  computed: {
    masterGold() {
      return this.masterStore.gold
    },
    masterGem() {
      return this.masterStore.gem
    }
  },

  data() {
    return {
      isOnDraft: false,

      isShowSelectImage: false,
      stockUpdate: {},
      type: 'STOCK-PRODUCT',

      param: {},
      data: {},
      header: [],
      gems: [],
      form: [],
      scrollHeight: 'calc(100vh - 330px)',

      imgTest: {
        type: 'MOLD',
        imageName: 'JEWELRY-001'
      },

      selectedItems: [],
      itemsToDisable: [], // items ที่ต้องการ disable
      itemsToPreSelect: [], // items ที่ต้องการให้ติ๊กถูกไว้ตั้งแต่แรก
      masterMaterialType: [
        { value: 'Gold', description: 'ทอง' },
        { value: 'Diamond', description: 'เพชร' },
        { value: 'Gem', description: 'พลอย' }
      ],

      columns: [
        {
          field: 'no',
          header: 'ลำดับ',
          sortable: false,
          width: '50px'
        },

        //เลขที่ผลิต
        {
          field: 'stockReceiptNumber',
          header: 'เลขที่ตั้งรับ',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'stockNumber',
          header: 'เลขที่ผลิต',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productNameEn',
          header: 'ชื่อสินค้า EN',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productNameTh',
          header: 'ชื่อสินค้า TH',
          sortable: false,
          minWidth: '150px'
        }
      ],
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
          width: '150px'
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
          width: '150px'
        },
        {
          field: 'typeBarcode',
          header: 'Barcode',
          sortable: false,
          minWidth: '100px'
        },
        {
          field: 'action',
          header: '',
          sortable: false,
          width: '50px'
        }
      ],

      btnClearImg: null,
      images: [],

      formBarcode: { ...interfaceBarcode }
    }
  },

  methods: {
    setBtnClearRef(ref) {
      this.btnClearImg = ref
      //console.log('setBtnClearRef', this.btnClearImg)
    },

    getBgColor(isReceipt, data) {
      if (isReceipt) {
        return 'background-color: #e0e0e0'
      } else if (data) {
        return 'background-color: #b5dad4'
      } else {
        return 'background-color: #dad4b5'
      }
    },
    checkItemSelectedLength() {
      //console.log('item', item)
      if (this.selectedItems.length > 0) {
        return this.selectedItems.length
      }

      return 0
    },

    //validate
    isRequiredField(data) {
      return (
        !data.isReceipt &&
        this.selectedItems.some(
          (selected) => selected.stockReceiptNumber === data.stockReceiptNumber
        )
      )
    },
    validateForm(formValue) {
      let isValid = true

      // ตรวจสอบเฉพาะรายการที่ถูกเลือกเท่านั้น
      for (const item of formValue) {
        // หารายการที่เลือกในฟอร์ม
        const formItem = this.form.find((f) => f.stockReceiptNumber === item.stockReceiptNumber)

        if (formItem && !formItem.isReceipt) {
          if (!formItem.productNumber) {
            isValid = false
          }

          if (!formItem.productNameEN) {
            isValid = false
          }

          if (!formItem.productNameTH) {
            isValid = false
          }

          if (formItem.qty === null || formItem.qty === undefined || formItem.qty === '') {
            isValid = false
          }

          if (formItem.price === null || formItem.price === undefined || formItem.price === '') {
            isValid = false
          }
        }
      }

      if (!isValid) {
        swAlert.warning('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', '', () => {
          console.log('swAlert.warning')
        })
      }

      return isValid
    },

    validateMaterialItems() {
      //return this.materialItems.every((item) => item.type && item.weight)
    },

    //update data
    updateSelection(newSelection) {
      this.selectedItems = newSelection
    },
    addMaterialItem(data) {
      data.push({
        type: '',
        weight: null,
        description: ''
      })
    },
    removeMaterialItem(data, index) {
      // if (data.length > 1) {
      //   data.splice(index, 1)
      // }
      data.splice(index, 1)
    },
    updateFile(files) {
      this.images = files
    },

    //handle modal
    closeModal() {
      this.isShowSelectImage = false
    },
    onSelectImage(e) {
      //console.log('onSelectImage', e)
      this.stockUpdate = { ...e }
      this.isShowSelectImage = true
    },
    updateImage(image, stock) {
      this.isShowSelectImage = false
      //console.log('updateImage', image, stock)

      //create array update form stock
      const stockArray = [{ ...stock }]

      this.updateStock(null, image, stockArray)
    },
    updateStock(data, image, stock) {
      //console.log('updateStock', data, image, stock)

      //update form by array stock
      stock.forEach((item) => {
        //update this.form
        const indexForm = this.form.findIndex(
          (x) => x.stockReceiptNumber === item.stockReceiptNumber
        )
        if (indexForm > -1) {
          //this.form[indexForm] = { ...item }

          if (image) {
            this.form[indexForm].imageName = image.name
            this.form[indexForm].imageYear = image.year
            this.form[indexForm].imagePath = image.path
          }

          console.log('updateStock form index update', this.form[indexForm])
        }

        //update this.selectedItems if any()
        if (this.selectedItems.length > 0) {
          const indexSelect = this.selectedItems.findIndex(
            (x) => x.stockReceiptNumber === item.stockReceiptNumber
          )
          if (indexSelect > -1) {
            //this.selectedItems[indexSelect] = { ...item }

            if (image) {
              this.selectedItems[indexForm].imageName = image.name
              this.selectedItems[indexForm].imageYear = image.year
              this.selectedItems[indexForm].imagePath = image.path
            }
            console.log('updateStock selectedItems index update', this.selectedItems[indexSelect])
          }
        }
      })
    },
    updateTypeBarcode(item, index) {
      console.log(item)

      if (item.type === 'Diamond') {
        item.typeBarcode = this.getBarcode(item)
      }

      if (item.type === 'Gold') {
        item.typeBarcode = this.getBarcode(item)
      }

      if (item.type === 'Gem') {
        item.typeBarcode = this.getBarcode(item)
      }

      this.updateFormBarcodeIndex(index)
    },
    updateFormBarcodeAll() {
      //create barcode
      this.form.forEach((item) => {
        item.barcodeGems = []
        if (item.materials.length > 0) {
          item.materials.forEach((mat) => {
            //console.log(' mat.type', mat.type)

            if (mat.type === 'Gold') {
              item.barcodeGold = this.getBarcode(mat)
            }

            if (mat.type === 'Diamond') {
              let display = this.getBarcode(mat)
              item.barcodeGems.push(display)
            }

            if (mat.type === 'Gem') {
              let display = this.getBarcode(mat)
              item.barcodeGems.push(display)
            }
          })
        }
      })
    },
    updateFormBarcodeIndex(index) {
      //create barcode
      const item = this.form.find((x) => x.stockReceiptNumber === index)

      //console.log('updateFormBarcodeIndex', item, index)
      if (item.materials.length > 0) {
        item.barcodeGems = []
        item.materials.forEach((mat) => {
          //console.log(' mat.type', mat.type)

          if (mat.type === 'Gold') {
            item.barcodeGold = this.getBarcode(mat)
          }

          if (mat.type === 'Diamond') {
            let display = this.getBarcode(mat)
            item.barcodeGems.push(display)
          }

          if (mat.type === 'Gem') {
            let display = this.getBarcode(mat)
            item.barcodeGems.push(display)
          }
        })
      }
    },
    getBarcode(item) {
      let display = ''

      if (item.type === 'Diamond') {
        display = `${item.qty ?? ''}${item.type ?? ''}${item.weight ?? ''}${
          item.weightUnit ? ` ${item.weightUnit}` : ''
        }${item.typeCode ? `, ${item.typeCode}` : ''}`
      }

      if (item.type === 'Gold') {
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

    onSubmit(event) {
      var confirm = this.selectedItems.filter((item) => !item.isReceipt)
      if (!this.validateForm(confirm)) {
        event.preventDefault() // ป้องกันการส่งฟอร์ม
        return false
      }

      const formValue = {
        wo: this.data.wo,
        woNumber: this.data.woNumber,
        receiptNumber: this.data.receiptNumber,
        Stocks: [...confirm]
      }

      console.log('onSubmit', formValue)
      this.fetchConfirm(formValue)
    },

    onFetch() {
      this.fetchData(true)
    },
    async fetchData(skipLoading = false) {
      this.header = []
      this.gems = []
      this.form = []
      this.itemsToDisable = []
      this.itemsToPreSelect = []

      this.data = await this.receiptProductionStore.fetchDataGetPlan({
        formValue: this.param,
        skipLoading: skipLoading
      })

      //init header
      this.header.push(this.data)
      if (this.data.gems.length > 0) {
        this.gems.push(this.data.gems)
      }
      this.form = this.data.stocks.map((item) => ({
        ...item, // copy ทุก property จาก receiptStocks
        barcodeGold: '',
        barcodeGems: []
      }))

      this.itemsToDisable = this.form.filter((item) => item.isReceipt)
      this.itemsToPreSelect = this.form.filter((item) => item.isReceipt)

      //set barcode
      this.formBarcode.goldType = this.data.goldSize
      this.formBarcode.mold = this.data.mold
      //this.formBarcode.goldType = this.data.gems

      //create barcode
      this.updateFormBarcodeAll()

      //console.log('this.form', this.form)
    },
    async fetchDraft() {
      try {
        this.isOnDraft = true

        const formValue = {
          receiptNumber: this.data.receiptNumber,
          stocks: [...this.form]
        }
        console.log('fetchDraft', formValue)

        const res = await this.receiptProductionStore.fetchCreateDraft({
          formValue: formValue
        })

        if (res) {
          this.isOnDraft = false
        }
      } catch (error) {
        console.log(error)
        this.isOnDraft = false
      }
    },
    async fetchImageData() {
      try {
        switch (this.imgTest.type) {
          case 'MOLD':
            {
              const param = {
                imageName: `${this.imgTest.imageName}-Mold.png`
              }
              const res = await api.jewelry.get('FileExtension/GetMoldImage', param, {
                skipLoading: true
              })

              if (res) {
                this.urlImage = `data:image/png;base64,${res}`
              }
            }
            break
        }
      } catch (error) {
        console.log(error)
      }
    },
    async fetchConfirm(formValue) {
      const res = await this.receiptProductionStore.fetchConfirm({
        formValue: formValue
      })

      if (res) {
        await this.fetchData(true)
        console.log('fetchConfirm', res)
      }
    }
  },

  created() {
    this.$nextTick(async () => {
      this.param = {
        running: this.$route.params.id
      }
      //console.log('this.param', this.param)
      this.fetchData()

      //test
      this.fetchImageData()

      //console.log('this.masterStore.planStatus')

      // เข้าถึง state โดยตรง
      await this.masterStore.fetchGold()
      await this.masterStore.fetchGem()
      //console.log(this.masterStore.gold)
      //console.log(this.masterStore.gem)
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form';

.form-control {
  font-size: 50px;
}
.form-col-fix-col-container {
  display: grid;
  gap: 10px;
  padding: 0px;
  grid-template-columns: 1fr 2fr 1fr 1fr 1fr 1fr 2fr 1fr; /* แก้จาก repeat(auto-fit) เป็นการกำหนด 2 คอลัมน์แบบตายตัว */
}
.form-col-fix-group-col-container {
  display: grid;
  gap: 10px;
  padding: 0px;
  grid-template-columns: 2fr 1fr; /* แก้จาก repeat(auto-fit) เป็นการกำหนด 2 คอลัมน์แบบตายตัว */
}

.form-col-fix-2-container {
  display: grid;
  //gap: 10px;
  padding: 0px;
  grid-template-columns: 4fr 2fr; /* แก้จาก repeat(auto-fit) เป็นการกำหนด 2 คอลัมน์แบบตายตัว */
}

.form-col-repeat-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  //gap: 5px;
  //padding: 20px;
}

.filter-container-img {
  display: flex;
  flex-direction: column;
  align-items: center;
  //gap: 1rem;
  padding: 1.5rem;
  border: 2px dashed #dddddd;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;

  &:hover {
    border-color: #adb5bd;
  }

  .image-preview {
    //width: 200px;
    //height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
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

.custom-form-table {
  :deep(.p-datatable) {
    .p-datatable-tbody {
      > tr {
        // row ที่ถูก preselect
        &[data-p-selectable='false'] {
          background-color: #ffe2a3 !important;

          > td {
            background-color: #ffe2a3 !important;
          }
        }

        // row ที่ถูกเลือกปกติ
        &[data-p-highlight='true']:not([data-p-selectable='false']) {
          background-color: var(--base-warning) !important;

          > td {
            //background-color: #e0e0e0 !important;
            background-color: #e0e0e0 !important;
            color: var(--base-font-color);
          }
        }

        // expansion row ของ row ที่ถูกเลือกปกติ
        &[data-p-highlight='true']:not([data-p-selectable='false']) + .p-datatable-row-expansion {
          > td {
            background-color: #e0e0e0 !important;
          }
        }
      }
    }
  }
}
.field-error {
  border-color: red !important;
  background-color: #ffeeee !important;
}
</style>
