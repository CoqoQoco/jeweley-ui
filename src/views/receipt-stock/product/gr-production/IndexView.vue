<template>
  <div class="app-container">
    <headerView :model="data" :modelHeader="header"></headerView>
    <!-- <div class="line mt-4 mb-4"></div> -->
    <div class="mt-2 mb-2">
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
      <form>
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
              <div class="">
                <!-- data & img -->
                <div class="form-col-fix-2-container">
                  <!-- detail -->
                  <div class="p-2 filter-container-bg">
                    <!-- qty -->
                    <div class="form-col-container">
                      <div>
                        <div>
                          <span class="title-text-white">จำนวน</span>
                          <span class="title-text-white"> *</span>
                        </div>
                        <input
                          v-if="!data.isReceipt"
                          class="form-control form-control-sm"
                          :style="getBgColor(slotProps.data.isReceipt, slotProps.data.productQty)"
                          type="number"
                          step="any"
                          min="0"
                          v-model="slotProps.data.productQty"
                          required
                        />
                      </div>

                      <div>
                        <div>
                          <span class="title-text-white">ราคาขาย</span>
                          <span class="title-text-white"> *</span>
                        </div>
                        <input
                          v-if="!data.isReceipt"
                          class="form-control form-control-sm"
                          :style="getBgColor(slotProps.data.isReceipt, slotProps.data.price)"
                          type="number"
                          step="any"
                          min="0"
                          v-model="slotProps.data.price"
                          required
                        />
                      </div>
                    </div>

                    <!-- size -->
                    <div class="form-col-container mt-1">
                      <!-- size -->
                      <div>
                        <div>
                          <span class="title-text-white">ขนาด</span>
                          <!-- <span class="title-text-white"> *</span> -->
                        </div>
                        <input
                          type="text"
                          v-if="!data.isReceipt"
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
                          <span class="title-text-white">คลังจัดเก็บ</span>
                          <!-- <span class="txt-required"> *</span> -->
                        </div>
                        <input
                          type="text"
                          v-if="!data.isReceipt"
                          class="form-control form-control-sm"
                          v-model="slotProps.data.location"
                          autocomplete="off"
                          autocorrect="off"
                          autocapitalize="off"
                          spellcheck="false"
                        />
                      </div>
                    </div>

                    <!-- remark -->
                    <div class="form-col-container mt-1">
                      <div>
                        <div>
                          <span class="title-text-white">หมายเหตุ</span>
                          <!-- <span class="txt-required"> *</span> -->
                        </div>
                        <textarea
                          type="text"
                          v-if="!data.isReceipt"
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
                    <!-- header data -->
                    <div class="form-col-container mt-2">
                      <!-- header -->
                      <div class="filter-container-highlight-green">
                        <!-- <div class="form-col-container">
                            <div class="d-flex justify-content-between">
                              <span class="desc-text-white">ข้อมูลน้ำหนัก ทอง เพชรเเละพลอย</span>
                            </div>
                          </div> -->

                        <div class="form-col-fix-col-container">
                          <!-- Type -->
                          <div>
                            <div>
                              <span class="title-text-white">ประเภท</span>
                              <span class="title-text-white"> *</span>
                            </div>
                          </div>

                          <!-- type -->
                          <div>
                            <div>
                              <!-- <span class="title-text-white">รายละเอียด</span> -->
                            </div>
                          </div>

                          <!-- Description -->
                          <div>
                            <div>
                              <span class="title-text-white">รายละเอียด</span>
                            </div>
                          </div>

                          <!-- size -->
                          <div>
                            <div>
                              <span class="title-text-white">ขนาด</span>
                              <span class="title-text-white"> *</span>
                            </div>
                          </div>

                          <!-- qty -->
                          <div>
                            <div>
                              <span class="title-text-white">จำนวน</span>
                              <span class="title-text-white"> *</span>
                            </div>
                          </div>

                          <!-- Weight -->
                          <div>
                            <div>
                              <span class="title-text-white">น้ำหนัก</span>
                              <span class="title-text-white"> *</span>
                            </div>
                          </div>

                          <div>
                            <div>
                              <span class="title-text-white">ราคาทุน</span>
                              <span class="title-text-white"> *</span>
                            </div>
                          </div>

                          <!-- Delete button -->
                          <div></div>
                        </div>
                      </div>
                    </div>

                    <!-- item data -->
                    <div
                      v-for="(item, index) in slotProps.data.materials"
                      :key="index"
                      class="mb-1"
                    >
                      <div class="form-col-fix-col-container">
                        <!-- Type -->
                        <div>
                          <Dropdown
                            v-model="item.type"
                            :options="masterMaterialType"
                            optionLabel="description"
                            optionValue="value"
                            class="w-full md:w-14rem"
                            :class="item.type === true ? `p-invalid` : ``"
                          />
                          <!-- :showClear="item.type ? true : false" -->
                          <!-- @change="onResetValDate('isValCategory')" -->
                        </div>

                        <!-- subType -->
                        <div class="">
                          <div v-if="item.type === '1'">
                            <Dropdown
                              v-model="item.subType"
                              :options="masterGold"
                              optionLabel="description"
                              optionValue="code"
                              class="w-full md:w-14rem"
                              placeholder="เลือกทอง"
                              :showClear="item.subType ? true : false"
                            >
                            </Dropdown>
                          </div>
                          <div v-else-if="item.type === '2'">
                            <input
                              type="text"
                              v-model="item.subType"
                              class="form-control"
                              placeholder="ระบุเพชร"
                              required
                            />
                          </div>
                          <div v-else-if="item.type === '3'">
                            <Dropdown
                              v-model="item.subType"
                              :options="masterGem"
                              optionLabel="description"
                              optionValue="code"
                              class="w-full md:w-14rem"
                              placeholder="เลือกพลอย"
                              :showClear="item.subType ? true : false"
                            >
                            </Dropdown>
                          </div>
                          <div v-else class="mt-3">
                            <span>--- โปรดระบุประเภท ---</span>
                          </div>
                        </div>

                        <!-- Description -->
                        <div>
                          <input
                            type="text"
                            v-model="item.description"
                            class="form-control"
                            :style="getBgColor(false, item.description)"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <!-- size -->
                        <div>
                          <input
                            type="text"
                            v-model="item.size"
                            class="form-control"
                            :style="getBgColor(false, item.size)"
                            required
                          />
                        </div>

                        <!-- qty -->
                        <div>
                          <input
                            type="number"
                            v-model="item.qty"
                            class="form-control"
                            :style="getBgColor(false, item.qty)"
                            min="0"
                            required
                          />
                        </div>

                        <!-- Weight -->
                        <div>
                          <input
                            type="number"
                            v-model="item.weight"
                            class="form-control"
                            :style="getBgColor(false, item.weight)"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <!-- price -->
                        <div>
                          <input
                            type="number"
                            v-model="item.price"
                            class="form-control"
                            :style="getBgColor(false, item.price)"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <!-- Delete button -->
                        <div class="d-flex align-items-center mt-1">
                          <button
                            type="button"
                            class="btn btn-red btn-sm"
                            @click="removeMaterialItem(slotProps.data.materials, index)"
                            :disabled="slotProps.data.materials.length === 1"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="line"></div>

            <div class="d-flex justify-content-between items-center">
              <span>จำนวนรายการที่เลือก: {{ checkItemSelectedLength(form) }}</span>
              <div>
                <button class="btn btn-sm btn-green" type="button">
                  <span class="bi bi-file-arrow-up"></span>
                  <span class="ml-2">ร่างข้อมูลสินค้า</span>
                </button>
                <button class="btn btn-sm btn-main ml-2" type="submit">
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

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import headerView from './components/production-header-view.vue'
import modalSelectImage from './components/image-select-view.vue'

// const interfaceForm = {
//   operator: ''
// }

export default {
  name: 'ProductionPlanList',

  components: {
    BaseDataTable,
    Dropdown,
    imagePreview,
    //Image,
    headerView,
    modalSelectImage
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
      isShowSelectImage: false,
      stockUpdate: {},
      type: 'STOCK-PRODUCT',

      param: {},
      data: {},
      header: [],
      form: [],
      scrollHeight: 'calc(100vh - 270px)',

      imgTest: {
        type: 'MOLD',
        imageName: 'JEWELRY-001'
      },

      selectedItems: [],
      itemsToDisable: [], // items ที่ต้องการ disable
      itemsToPreSelect: [], // items ที่ต้องการให้ติ๊กถูกไว้ตั้งแต่แรก
      masterMaterialType: [
        { value: '1', description: 'ทอง' },
        { value: '2', description: 'เพชร' },
        { value: '3', description: 'พลอย' }
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

      btnClearImg: null,
      images: []
    }
  },

  methods: {
    async fetchData() {
      this.data = await this.receiptProductionStore.fetchDataGetPlan({
        formValue: this.param
      })

      //init header
      this.header.push(this.data)
      this.form = this.data.stocks.map((item) => ({
        ...item // copy ทุก property จาก receiptStocks
      }))

      this.itemsToDisable = this.form.filter((item) => item.isReceipt)
      this.itemsToPreSelect = this.form.filter((item) => item.isReceipt)
    },

    setBtnClearRef(ref) {
      this.btnClearImg = ref
      //console.log('setBtnClearRef', this.btnClearImg)
    },
    updateFile(files) {
      this.images = files
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
    checkItemSelectedLength(item) {
      //console.log('item', item)
      return item.filter(
        (item) =>
          !item.isReceipt &&
          this.selectedItems.some(
            (selected) => selected.stockNumber === item.stockNumber // หรือใช้ field อื่นที่เป็น unique identifier
          )
      ).length
    },
    isRequiredField(data) {
      return (
        !data.isReceipt &&
        this.selectedItems.some((selected) => selected.stockNumber === data.stockNumber)
      )
    },

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
      if (data.length > 1) {
        data.splice(index, 1)
      }
    },

    validateMaterialItems() {
      //return this.materialItems.every((item) => item.type && item.weight)
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
        const index = this.form.findIndex((x) => x.stockReceiptNumber === item.stockReceiptNumber)
        if (index > -1) {
          this.form[index] = { ...item }

          if (image) {
            this.form[index].imageName = image.name
            this.form[index].imageYear = image.year
            this.form[index].imagePath = image.path
          }

          console.log('updateStock form index update', this.form[index])
        }
      })
    },

    //test image
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
  grid-template-columns: 1fr 2fr 2fr 1fr 1fr 1fr 1fr 1fr; /* แก้จาก repeat(auto-fit) เป็นการกำหนด 2 คอลัมน์แบบตายตัว */
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
</style>
