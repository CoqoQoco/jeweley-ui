<template>
  <div class="app-container">
    <headerView
      :model="data"
      :modelHeader="header"
      :modelGem="gems"
      @onFetch="onFetch"
    ></headerView>
    <!-- <div class="line mt-4 mb-4"></div> -->
    <!-- <div class="mb-2">
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
    </div> -->

    <div class="form-col-container mt-2">
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

          <template #moldDesignTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.moldDesign)"
                type="text"
                v-model="data.moldDesign"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.moldDesign }}</span>
            </div>
          </template>

          <template #productNameEnTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <!-- <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.productNameEN)"
                type="text"
                v-model="data.productNameEN"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              /> -->

              <div v-if="!data.isReceipt" class="input-group input-group-sm">
                <div class="input-group input-group-inner">
                  <input
                    class="form-control"
                    :style="getBgColor(data.isReceipt, data.productNameEN)"
                    type="text"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    v-model="data.productNameEN"
                    :required="isRequiredField(data)"
                    :disabled="data.isReceipt"
                  />
                  <div class="input-group-append mr-1">
                    <button
                      type="button"
                      class="btn btn-green btn-sm btn-input-group"
                      style="height: 35px !important; margin-top: 5px"
                      @click="onSearchProductName(data, 'EN')"
                    >
                      <span class="bi bi-search"></span>
                    </button>
                  </div>
                </div>
              </div>
              <span v-else>{{ data.productNameEN }}</span>
            </div>
          </template>

          <template #productNameThTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <!-- <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.productNameTH)"
                type="text"
                v-model="data.productNameTH"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              /> -->
              <div v-if="!data.isReceipt" class="input-group input-group-sm">
                <div class="input-group input-group-inner">
                  <input
                    class="form-control"
                    :style="getBgColor(data.isReceipt, data.productNameTH)"
                    type="text"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    v-model="data.productNameTH"
                    :required="isRequiredField(data)"
                    :disabled="data.isReceipt"
                  />
                  <div class="input-group-append mr-1">
                    <button
                      type="button"
                      class="btn btn-green btn-sm btn-input-group"
                      style="height: 35px !important; margin-top: 5px"
                      @click="onSearchProductName(data, 'TH')"
                    >
                      <span class="bi bi-search"></span>
                    </button>
                  </div>
                </div>
              </div>
              <span v-else>{{ data.productNameTH }}</span>
            </div>
          </template>

          <template #expansion="slotProps">
            <div class="p-2">
              <!-- stock already receipt -->
              <div v-if="slotProps.data.isReceipt">
                <div class="form-col-fix-2-container">
                  <div class="form-col-container">
                    <div class="filter-container-bg-focus">
                      <barcodeDemo
                        :madeIn="formBarcode.madeIn"
                        :madeInText="formBarcode.madeInText"
                        :stockNumber="slotProps.stockNumber"
                        :mold="slotProps.data.moldDesign ?? formBarcode.mold"
                        :gold="slotProps.data.barcodeGold"
                        :gems="slotProps.data.barcodeGems"
                        :size="slotProps.data.size"
                        :goldType="formBarcode.goldType"
                        :type="formBarcode.type"
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

              <!-- stock on receipt -->
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
                    <div class="form-col-container mt-2">
                      <!-- size -->
                      <div class="form-col-sm-container">
                        <div>
                          <div>
                            <span class="title-text">ขนาด</span>
                            <!-- <span class="title-text"> *</span> -->
                          </div>
                          <input
                            type="text"
                            class="form-control form-control-sm"
                            v-model="slotProps.data.size"
                            :required="isRequiredField(slotProps.data, true)"
                            autocomplete="off"
                            autocorrect="off"
                            autocapitalize="off"
                            spellcheck="false"
                          />
                        </div>

                        <div>
                          <div>
                            <span class="title-text">แป้นต่างหู</span>
                            <!-- <span class="title-text"> *</span> -->
                          </div>
                          <Dropdown
                            v-model="slotProps.data.studEarring"
                            :options="masterStud"
                            optionLabel="description"
                            optionValue="value"
                            class="w-full md:w-14rem"
                            placeholder="เลือกแป้นต่างหู"
                            :showClear="slotProps.data.studEarring ? true : false"
                            style="height: 31px !important"
                            :disabled="!requiredStud"
                          >
                          </Dropdown>
                        </div>
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
                    <div class="form-col-container mt-2">
                      <div>
                        <div>
                          <span class="title-text">หมายเหตุ</span>
                          <!-- <span class="txt-required"> *</span> -->
                        </div>
                        <textarea
                          type="text"
                          class="form-control form-control-sm mt-1"
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
                      <div class="group-title pl-2">
                        <div>
                          <span class="title-text-lg bi bi-hammer"></span>
                          <span class="title-text-lg ml-2">ส่วนประกอบสินค้า</span>
                        </div>
                        <small class="pl-4">รายละเอียดการผลิตสินค้า ส่วนประกอบ เเละวัสดุต่างๆ</small>
                      </div>
                      <!-- Add button -->
                      <div class="d-flex justify-content-start mt-2">
                        <div
                          type="button"
                          class="p-2 text-dark"
                          @click="addMaterialItem(slotProps.data.materials)"
                        >
                          <span class="bi bi-plus-lg"></span>
                          <span></span>
                        </div>
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
                          <div v-if="data.type === 'Gold' || data.type === 'Silver'">
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
                              placeholder="เลือกเกรดเพชร"
                              :showClear="data.typeCode ? true : false"
                              @change="updateTypeBarcode(data, slotProps.data.stockReceiptNumber)"
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
                              @change="updateTypeBarcode(data, slotProps.data.stockReceiptNumber)"
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
                            :style="getBgColor(false, data.size)"
                            @input="updateTypeBarcode(data, slotProps.data.stockReceiptNumber)"
                          />
                        </div>
                      </template>

                      <template #regionTemplate="{ data }">
                        <div class="d-flex justify-content-center">
                          <input
                            type="text"
                            v-model="data.region"
                            class="form-control"
                            :style="getBgColor(false, data.region)"
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
                            placeholder="ข้อความที่จะเเสดงบน Barcode"
                            disabled
                          />
                        </div>
                      </template>

                      <template #actionTemplate="{ index, data }">
                        <div class="d-flex align-items-center mt-1">
                          <button
                            type="button"
                            class="btn btn-red btn-sm"
                            @click="removeMaterialItem(data, slotProps.data, index)"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </template>
                    </BaseDataTable>
                  </div>
                </div>

                <!-- barcode -->
                <div class="form-col-container mt-2">
                  <div class="filter-container-bg-focus">
                    <barcodeDemo
                      :madeIn="formBarcode.madeIn"
                      :madeInText="formBarcode.madeInText"
                      :stockNumber="slotProps.stockNumber"
                      :mold="slotProps.data.moldDesign ?? formBarcode.mold"
                      :gold="slotProps.data.barcodeGold"
                      :gems="slotProps.data.barcodeGems"
                      :size="slotProps.data.size"
                      :goldType="formBarcode.goldType"
                      :type="formBarcode.type"
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
              <div class="vertical-center-container">
                <span class="title-text">จำนวนรายการที่เลือก: {{ checkItemSelectedLength() }}</span>
                <!-- <span class="ml-2 mr-2 title-text">|</span> -->
                <!-- <button class="btn btn-sm btn-outline-main" type="button">
                  <span class="bi bi-gear mr-2"></span>
                  <span>ปรับเเต่งสินค้า</span>
                </button>
                <button class="btn btn-sm btn-secondary ml-2" disabled type="button">
                  <span class="bi bi-image mr-2"></span>
                  <span>อัพโหลดรูป</span>
                </button>
                <button class="btn btn-sm btn-secondary ml-2" disabled type="button">
                  <span class="bi bi-upc-scan mr-2"></span>
                  <span>Barcode</span>
                </button> -->
              </div>
              <div>
                <button class="btn btn-sm btn-green" type="button" @click="fetchDraft">
                  <span v-if="isOnDraft" class="spinner-border spinner-border-sm"></span>
                  <span v-else class="bi bi-clipboard2-pulse-fill"></span>
                  <span class="ml-2">บันทึกฉบับร่าง</span>
                </button>
                <button
                  :class="[
                    'btn btn-sm  ml-2',
                    checkItemSelectedLength() === 0 ? 'btn-secondary' : 'btn-main'
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
      :isShow="isShow.imageSelect"
      :modelStock="stockUpdate"
      @select="updateImage"
      @closeModal="closeModal"
    ></modalSelectImage>

    <modalBarcodePrint
      :isShow="isShow.barcodePrint"
      :modelStock="res"
      @closeModal="closeModal"
    ></modalBarcodePrint>

    <modalSearchProductName
      :isShow="isShow.searchProductName"
      :modelStock="stockUpdate"
      :mode="searchProductNameType"
      @select="updateProductName"
      @closeModal="closeModal"
    ></modalSearchProductName>
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
import { getAzureBlobUrl } from '@/config/azure-storage-config.js'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import headerView from './components/production-header-view.vue'
import barcodeDemo from '@/components/custom/barcode-demo/barcode-demo-view.vue'

import modalSelectImage from './modal/image-select-view.vue'
import modalBarcodePrint from './modal/barcode-print-view.vue'
import modalSearchProductName from './modal/search-product-name-view.vue'

const interfaceBarcode = {
  madeIn: 'MADE IN THAILAND',
  madeInText: 'XXXXXXXXXXX',
  mold: 'RFXXXXR',
  goldType: 'XXK',
  type: 'gem'
}
const interfaceIsShow = {
  imageSelect: false,
  barcodePrint: false,
  searchProductName: false
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
    barcodeDemo,
    modalBarcodePrint,
    modalSearchProductName
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
    },
    masterDiamondGrade() {
      return this.masterStore.diamondGrade
    },
    requiredStud() {
      const res = this.data.productType === 'ES'
      console.log('requiredStud', res)
      return res
    }
  },

  data() {
    return {
      isOnDraft: false,

      isShow: { ...interfaceIsShow },
      stockUpdate: {},
      type: 'STOCK-PRODUCT',

      param: {},
      data: {},
      res: [],
      searchProductNameType: 'EN',

      // res: [
      //   {
      //     stockNumber: 'DK-2503-005',
      //     receiptNumber: 'STR250227008',
      //     receiptType: 'production',
      //     receiptDate: '2025-03-10T16:10:13.8603059Z',
      //     productNumber: '2025TER--POI-6',
      //     productNameEn: '2025TER-GREEN-4',
      //     productNameTh: '2025TER-GREEN-4',
      //     productTypeName: 'กระดุม',
      //     productType: 'V',
      //     productPrice: 3432.7,
      //     wo: '20250221',
      //     woNumber: 1,
      //     woText: null,
      //     productionType: 'Yellow Gold',
      //     productionTypeSize: '18K',
      //     productionDate: '2025-03-10T16:10:13.8603188Z',
      //     mold: 'BOSI-564-PPS',
      //     imageName: '',
      //     imagePath: '',
      //     status: 'Available',
      //     qty: 1.0,
      //     location: '',
      //     size: '#77',
      //     remark: '',
      //     createDate: '2025-03-10T16:10:13.8603188Z',
      //     createBy: 'CoqoAdmin2',
      //     updateDate: null,
      //     updateBy: null,
      //     materials: [
      //       {
      //         type: 'Gold',
      //         typeName: null,
      //         typeCode: null,
      //         typeBarcode: '0.5 G Gold',
      //         qty: 1.0,
      //         qtyUnit: null,
      //         weight: 0.5,
      //         weightUnit: 'G',
      //         size: '1',
      //         price: 100.0
      //       }
      //     ]
      //   }
      // ],

      header: [],
      gems: [],
      form: [],
      scrollHeight: '',

      imgTest: {
        type: 'MOLD',
        imageName: 'JEWELRY-001'
      },

      selectedItems: [],
      itemsToDisable: [], // items ที่ต้องการ disable
      itemsToPreSelect: [], // items ที่ต้องการให้ติ๊กถูกไว้ตั้งแต่แรก
      masterMaterialType: [
        { value: 'Gold', description: 'Gold' },
        { value: 'Silver', description: 'Silver' },
        { value: 'Diamond', description: 'Diamond' },
        { value: 'Gem', description: 'Gem ' }
      ],
      masterStud: [
        { value: 'lg', description: 'แป้นใหญ่' },
        { value: 'md', description: 'แป้นกลาง' },
        { value: 'sm', description: 'แป้นเล็ก' }
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
          minWidth: '140px'
        },
        {
          field: 'stockNumber',
          header: 'เลขที่ผลิต',
          sortable: false,
          minWidth: '140px'
        },
        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          sortable: false,
          minWidth: '140px'
        },
        {
          field: 'moldDesign',
          header: 'เเม่พิมพ์',
          sortable: false,
          minWidth: '120px'
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
    isRequiredField(data, size = false) {
      if (size) {
        return (
          !data.isReceipt &&
          this.selectedItems.some(
            (selected) => selected.stockReceiptNumber === data.stockReceiptNumber
          ) &&
          ['G', 'B', 'R', 'N'].includes(this.data.productType)
        )
      } else {
        return (
          !data.isReceipt &&
          this.selectedItems.some(
            (selected) => selected.stockReceiptNumber === data.stockReceiptNumber
          )
        )
      }
    },
    isRequiredSizeField(data) {
      return (
        !data.isReceipt &&
        this.selectedItems.some(
          (selected) => selected.stockReceiptNumber === data.stockReceiptNumber
        )
      )
    },
    validateForm(formValue) {
      let isValid = true
      const productNumbers = new Set() // ใช้ Set เพื่อเก็บค่า productNumber ที่ผ่านการตรวจสอบแล้ว
      let duplicateProductNumbers = [] // เก็บรายการ productNumber ที่ซ้ำกัน

      // ตรวจสอบเฉพาะรายการที่ถูกเลือกเท่านั้น
      for (const item of formValue) {
        // หารายการที่เลือกในฟอร์ม
        const formItem = this.form.find((f) => f.stockReceiptNumber === item.stockReceiptNumber)

        if (formItem && !formItem.isReceipt) {
          // ตรวจสอบข้อมูลพื้นฐาน
          if (!formItem.productNumber) {
            isValid = false
          } else {
            // ตรวจสอบความซ้ำซ้อนของ productNumber
            if (productNumbers.has(formItem.productNumber)) {
              duplicateProductNumbers.push(formItem.productNumber)
              isValid = false
            } else {
              productNumbers.add(formItem.productNumber)
            }
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
        if (duplicateProductNumbers.length > 0) {
          // แสดงข้อความเตือนเฉพาะกรณีมีรหัสสินค้าซ้ำกัน
          swAlert.warning(
            'พบรหัสสินค้าซ้ำกัน',
            `กรุณาตรวจสอบรหัสสินค้าต่อไปนี้: ${duplicateProductNumbers.join(', ')}`,
            () => {
              console.log('swAlert.warning - duplicate productNumber')
            }
          )
        } else {
          // แสดงข้อความเตือนทั่วไปเมื่อข้อมูลไม่ครบถ้วน
          swAlert.warning('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', '', () => {
            console.log('swAlert.warning')
          })
        }
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
        qty: 1,
        qtyUnit: 'pc',
        weight: null,
        weightUnit: 'ct.',
        description: ''
      })
    },
    removeMaterialItem(data, item, index) {
      item.materials.splice(index, 1)
      this.updateTypeBarcode(data, item.stockReceiptNumber)
    },
    updateFile(files) {
      this.images = files
    },

    //handle modal
    closeModal() {
      this.searchProductNameType = 'EN'
      this.isShow = { ...interfaceIsShow }
    },
    onSelectImage(e) {
      //console.log('onSelectImage', e)
      this.stockUpdate = { ...e }
      this.isShow.imageSelect = true
    },
    onSearchProductName(e, type) {
      this.stockUpdate = { ...e }
      this.searchProductNameType = type
      //console.log('onSearchProductName', type)
      this.isShow.searchProductName = true
    },

    updateImage(image, stock) {
      this.isShow.imageSelect = false
      //console.log('updateImage', image, stock)

      //create array update form stock
      const stockArray = [{ ...stock }]
      this.updateStock(null, image, stockArray)
    },
    updateProductName(name, stock, mode, all) {
      this.searchProductNameType = 'EN'
      this.isShow.searchProductName = false
      //console.log('updateProductName', name)

      name = {
        ...name,
        mode: mode
      }

      const stockArray = [{ ...stock }]
      this.updateStock(name, null, stockArray, all)
    },
    updateStock(data, image, stock, all = false) {
      if (all) {
        console.log('updateProductName all')
        this.form.forEach((item) => {
          //update all
          if (item.isReceipt) return

          if (image) {
            item.imageName = image.name
            item.imageYear = image.year
            item.imagePath = image.path
          }

          if (data) {
            if (data.text) {
              if (data.mode === 'EN') {
                item.productNameEN = data.text
              }
              if (data.mode === 'TH') {
                item.productNameTH = data.text
              }
            }
          }
        })
      } else {
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

            if (data) {
              console.log('updateStock data', data)
              if (data.text) {
                if (data.mode === 'EN') {
                  this.form[indexForm].productNameEN = data.text
                }
                if (data.mode === 'TH') {
                  this.form[indexForm].productNameTH = data.text
                }
              }
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

              if (data) {
                if (data.text) {
                  if (data.mode === 'EN') {
                    this.selectedItems[indexForm].productNameEN = data.text
                  }
                  if (data.mode === 'TH') {
                    this.selectedItems[indexForm].productNameTH = data.text
                  }
                }
              }

              console.log('updateStock selectedItems index update', this.selectedItems[indexSelect])
            }
          }
        })
      }
    },

    updateTypeBarcode(item, index) {
      //console.log(item)

      if (item.type === 'Diamond') {
        item.typeBarcode = this.getBarcode(item)
      }

      if (item.type === 'Gold' || item.type === 'Silver') {
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

            if (mat.type === 'Gold' || mat.type === 'Silver') {
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
        //console.log('item.barcodeGems', item.barcodeGems)
        item.materials.forEach((mat) => {
          //console.log(' mat.type', mat.type)

          if (mat.type === 'Gold' || mat.type === 'Silver') {
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
      } else {
        item.barcodeGold = ''
        item.barcodeGems = []
      }
    },
    getBarcode(item) {
      let display = ''

      if (item.type === 'Diamond') {
        display = `${item.qty ?? ''}${item.type ?? ''}${item.weight ?? ''}${
          item.weightUnit ? ` ${item.weightUnit}` : ''
        }${item.typeCode ? `, ${item.typeCode}` : ''}${item.size ? `, ${item.size}` : ''} ${
          item.region ? `, (${item.region})` : ''
        }`
      }

      if (item.type === 'Gold' || item.type === 'Silver') {
        display = `${item.weight ?? ``}${item.weightUnit ? ` ${item.weightUnit}` : ``}${
          item.type ? ` ${item.type}` : ``
        }`
      }

      if (item.type === 'Gem') {
        display = `${item.qty ?? ''}${item.typeCode ?? ''}${item.weight ?? ''}${
          item.weightUnit ? ` ${item.weightUnit}` : ``
        }${item.size ? `, ${item.size}` : ''}${item.region ? `, (${item.region})` : ''}`
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

      //console.log('onSubmit', formValue)
      swAlert.confirmSubmit('', 'ยืนยันการบันทึกข้อมูล?', async () => {
        this.fetchConfirm(formValue)
      })
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

      //console.log('fetchData', this.data)
      if (this.data?.gems?.length > 0) {
        this.gems.push(this.data.gems)
      }
      this.form = this.data.stocks.map((item) => ({
        ...item, // copy ทุก property จาก receiptStocks

        productNameTH: item.productNameTH?.trim() || this.data.productName || '',
        productNameEN: item.productNameEN?.trim() || this.data.productName || '',

        moldDesign: item.moldDesign?.trim() || this.data.mold || '',
        price: 0,

        barcodeGold: '',
        barcodeGems: []
      }))

      this.itemsToDisable = this.form.filter((item) => item.isReceipt)
      this.itemsToPreSelect = this.form.filter((item) => item.isReceipt)

      //set barcode
      this.formBarcode.goldType = this.data.goldSize
      this.formBarcode.mold = this.data.mold

      console.log(this.data.type)
      this.formBarcode.type = this.data.type === 'Silver' ? 'silver' : 'gem'
      console.log(this.formBarcode.type)
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
              // Build Azure Blob URL for mold image
              const blobPath = `Mold/${this.imgTest.imageName}-Mold.png`
              this.urlImage = getAzureBlobUrl(blobPath)
            }
            break
        }
      } catch (error) {
        console.log(error)
      }
    },
    async fetchConfirm(formValue) {
      this.res = []
      this.selectedItems = []
      const response = await this.receiptProductionStore.fetchConfirm({
        formValue: formValue
      })

      if (response) {
        this.res = [...response.stocks]
        await this.fetchData(true)

        console.log('fetchConfirm', response)
        this.isShow.barcodePrint = true
      }
    },

    onResPrint() {
      //console.log('onResPrint')
      this.isShow.barcodePrint = true
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
      await this.masterStore.fetchDiamondGrade()
      //console.log(this.masterStore.gold)
      //console.log(this.masterStore.gem)
    })
  }
}
</script>

<style lang="scss" scoped>
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

.input-group-prepend .btn,
.input-group-append .btn {
  position: relative;
  z-index: 0 !important;
}

.group-title {
  display: flex;
  flex-direction: column;
}
</style>
