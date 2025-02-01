<template>
  <div class="app-container">
    <div class="filter-container-highlight">
      <div class="form-col-container">
        <div class="d-flex justify-content-between">
          <span class="desc-text-white">
            {{
              `รับสินค้างานผลิต แผนผลิตเลขที่ [ W.O. ] : 
              ${data.wo ? `${data.wo}-${data.woNumber}` : 'loading...'}`
            }}
          </span>
        </div>
      </div>
    </div>

    <div class="form-col-container">
      <BaseDataTable :items="header" :columns="headerColumns" :paginator="false">
        <template #productQtyTemplate="{ data }">
          <div class="d-flex justify-content-end p-1">
            <span>{{ data.qtyRunning }}</span>
            <span>/</span>
            <span>{{ data.productQty }}</span>
          </div>
        </template>
      </BaseDataTable>
    </div>

    <!-- <div class="line mt-4 mb-4"></div> -->

    <div class="filter-container-highlight mt-4">
      <div class="form-col-container">
        <div class="desc-text-white d-flex justify-content-between">
          <div>
            <span class="bi bi-box-arrow-in-down mr-2"></span>
            <span>ปรับปรุงรายการสินค้ารับเข้าคลัง</span>
          </div>
          <div>
            <span>{{ `จำนวนรับเเล้ว ${data.qtyRunning}/${data.productQty}` }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="form-col-container">
      <uploadImages
        title="รูปสินค้า"
        @onUpdateFile="updateFile"
        @btnClearRef="setBtnClearRef"
      ></uploadImages>
    </div> -->

    <div class="form-col-container">
      <form>
        <BaseDataTable
          :items="form"
          dataKey="stockNumber"
          :columns="formColumns"
          :paginator="false"
          :selectionMode="true"
          :itemsSelection="selectedItems"
          @update:itemsSelection="updateSelection"
          :disabledItems="itemsToDisable"
          :preSelectedItems="itemsToPreSelect"
          :expandable="true"
          :scrollHeight="null"
          class="custom-form-table"
        >
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

          <template #productNameTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.productName)"
                type="text"
                v-model="data.productName"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
            </div>
          </template>

          <template #productQtyTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.productQty)"
                type="Number"
                step="any"
                min="0"
                v-model="data.productQty"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
            </div>
          </template>

          <template #sizeTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.size)"
                type="text"
                v-model="data.size"
                :disabled="data.isReceipt"
              />
            </div>
          </template>

          <!-- <template #goldTemplate="{ data }">
              <div class="d-flex justify-content-center">
                <input
                  v-if="!data.isReceipt"
                  class="form-control form-control-sm"
                  :style="getBgColor(data.isReceipt, data.gold)"
                  type="text"
                  v-model="data.gold"
                  :disabled="data.isReceipt"
                />
                <span v-else>{{ data.productNumber }}</span>
              </div>
            </template> -->

          <!-- <template #diamondTemplate="{ data }">
              <div class="d-flex justify-content-center">
                <input
                  v-if="!data.isReceipt"
                  class="form-control form-control-sm"
                  :style="getBgColor(data.isReceipt, data.diamond)"
                  type="text"
                  v-model="data.diamond"
                  :disabled="data.isReceipt"
                />
                <span v-else>{{ data.productNumber }}</span>
              </div>
            </template> -->

          <!-- <template #gemTemplate="{ data }">
              <div class="d-flex justify-content-center">
                <input
                  v-if="!data.isReceipt"
                  class="form-control form-control-sm"
                  :style="getBgColor(data.isReceipt, data.gem)"
                  type="text"
                  v-model="data.gem"
                  :disabled="data.isReceipt"
                />
                <span v-else>{{ data.productNumber }}</span>
              </div>
            </template> -->

          <template #locationTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.location)"
                type="text"
                v-model="data.location"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
            </div>
          </template>

          <template #priceTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.price)"
                type="Number"
                step="any"
                min="0"
                v-model="data.price"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
            </div>
          </template>

          <template #remarkTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.remark)"
                type="text"
                v-model="data.remark"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
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
                        <Image
                          v-if="urlImage"
                          class="image-body"
                          :src="urlImage"
                          alt="Image"
                          :width="150"
                          :height="150"
                          preview
                        />
                        <div v-else class="spinner-border" role="status">
                          <span class="sr-only">Loading...</span>
                        </div>
                      </div>

                      <!-- ส่วนปุ่มควบคุม -->
                      <div class="image-controls mt-1">
                        <button class="btn btn-red btn-sm ms-2" type="button">
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
                        <span class="title-text-lg ml-2">ข้อมูลน้ำหนัก ทอง เพชรเเละพลอย</span>
                      </div>
                      <!-- Add button -->
                      <div class="d-flex justify-content-start mt-2">
                        <button
                          type="button"
                          class="btn btn-green btn-sm"
                          @click="addMaterialItem(slotProps.data.material)"
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

                        <div class="form-col-fix-4-container">
                          <!-- Type -->
                          <div>
                            <div>
                              <span class="title-text-white">ประเภท</span>
                              <span class="title-text-white"> *</span>
                            </div>
                          </div>

                          <!-- Description -->
                          <div>
                            <div>
                              <span class="title-text-white">รายละเอียด</span>
                            </div>
                          </div>

                          <!-- Weight -->
                          <div>
                            <div>
                              <span class="title-text-white">น้ำหนัก (กรัม)</span>
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
                    <div v-for="(item, index) in slotProps.data.material" :key="index" class="mb-1">
                      <div class="form-col-fix-4-container">
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

                        <!-- Description -->
                        <div>
                          <input
                            type="text"
                            v-model="item.description"
                            class="form-control form-control-sm"
                            :style="getBgColor(false, item.description)"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <!-- Weight -->
                        <div>
                          <input
                            type="number"
                            v-model="item.weight"
                            class="form-control form-control-sm"
                            :style="getBgColor(false, item.weight)"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <!-- Weight -->
                        <div>
                          <input
                            type="number"
                            v-model="item.price"
                            class="form-control form-control-sm"
                            :style="getBgColor(false, item.price)"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <!-- Delete button -->
                        <div class="d-flex align-items-center">
                          <button
                            type="button"
                            class="btn btn-red btn-sm"
                            @click="removeMaterialItem(slotProps.data.material, index)"
                            :disabled="slotProps.data.material.length === 1"
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
            <div class="d-flex justify-content-between items-center">
              <span>จำนวนรายการที่เลือก: {{ checkItemSelectedLength(form) }}</span>
              <div>
                <button class="btn btn-sm btn-main">บันทึก</button>
              </div>
            </div>
          </template>
        </BaseDataTable>
      </form>
    </div>
  </div>
</template>

<script>
//import { defineAsyncComponent } from 'vue'
//const imgPreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))
//const uploadImages = defineAsyncComponent(() => import('@/components/prime-vue/UploadImages.vue'))

import Dropdown from 'primevue/dropdown'
import Image from 'primevue/image'

import { useReceiptProductionApiStore } from '@/stores/modules/api/receipt/receipt-production-api.js'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
//import uploadImages from '@/components/prime-vue/UploadImages.vue'

import api from '@/axios/axios-helper.js'

// const interfaceForm = {
//   operator: ''
// }

export default {
  name: 'ProductionPlanList',

  components: {
    BaseDataTable,
    Dropdown,
    Image
    //imgPreview,
    //Image
    //uploadImages
  },

  setup() {
    const receiptProductionStore = useReceiptProductionApiStore()
    return { receiptProductionStore }
  },

  data() {
    return {
      param: {},
      data: {},
      header: [],
      form: [],

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

      headerColumns: [
        {
          field: 'receiptNumber',
          header: 'เลขที่ตั้งรับสินค้า',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'receiptDate',
          header: 'วันที่ผลิตสำเร็จ',
          sortable: false,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'mold',
          header: 'เเม่พิมพ์',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productNumber',
          header: 'รหัสสินค้าผลิต',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productTypeName',
          header: 'ประเภทสินค้า',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'gold',
          header: 'สีของทอง/เงิน',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'goldSize',
          header: 'ประเภททอง/เงิน',
          sortable: false,
          minWidth: '150px'
        }
      ],
      formColumns: [
        {
          field: 'no',
          header: 'ลำดับ',
          sortable: false,
          width: '50px'
        },

        //เลขที่ผลิต
        {
          field: 'stockNumber',
          header: 'รหัสตั้งรับสินค้า',
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
          field: 'productName',
          header: 'ชื่อสินค้า',
          sortable: false,
          minWidth: '150px'
        }
        // {
        //   field: 'productQty',
        //   header: 'จำนวน',
        //   sortable: false,
        //   minWidth: '100px'
        // },
        // {
        //   field: 'size',
        //   header: 'ไซส์',
        //   sortable: false,
        //   minWidth: '100px'
        // },
        // {
        //   field: 'gold',
        //   header: 'น้้ำหนักทอง',
        //   sortable: false,
        //   minWidth: '150px'
        // },
        // {
        //   field: 'diamond',
        //   header: 'น้้ำหนักเพชร',
        //   sortable: false,
        //   minWidth: '150px'
        // },
        // {
        //   field: 'gem',
        //   header: 'น้้ำหนักพลอย',
        //   sortable: false,
        //   minWidth: '150px'
        // },
        // {
        //   field: 'location',
        //   header: 'คลังจัดเก็บ',
        //   sortable: false,
        //   minWidth: '150px'
        // },
        // {
        //   field: 'price',
        //   header: 'ราคาขาย',
        //   sortable: false,
        //   minWidth: '150px'
        // },
        // {
        //   field: 'remark',
        //   header: 'หมายเหตุ',
        //   sortable: false,
        //   minWidth: '150px'
        // }
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
      this.form = this.data.receiptStocks.map((item) => ({
        ...item, // copy ทุก property จาก receiptStocks
        material: [
          {
            // เพิ่ม material array พร้อม initial item
            type: '',
            weight: null,
            description: ''
          }
        ]
      }))

      this.itemsToDisable = this.form.filter((item) => item.isReceipt)
      this.itemsToPreSelect = this.form.filter((item) => item.isReceipt)
    },

    setBtnClearRef(ref) {
      this.btnClearImg = ref
      console.log('setBtnClearRef', this.btnClearImg)
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
      console.log('item', item)
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

            {
              const param = {
                imageName: `${this.imageName}`
              }
              const res = await api.jewelry.get('FileExtension/GetPlanMoldResinImage', param, {
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
    this.$nextTick(() => {
      this.param = {
        running: this.$route.params.id
      }
      console.log('this.param', this.param)
      this.fetchData()

      //test
      this.fetchImageData()
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
.form-col-fix-4-container {
  display: grid;
  gap: 10px;
  padding: 0px;
  grid-template-columns: 1fr 4fr 1fr 1fr 1fr 1fr; /* แก้จาก repeat(auto-fit) เป็นการกำหนด 2 คอลัมน์แบบตายตัว */
}

.form-col-fix-2-container {
  display: grid;
  //gap: 10px;
  padding: 0px;
  grid-template-columns: 4fr 2fr; /* แก้จาก repeat(auto-fit) เป็นการกำหนด 2 คอลัมน์แบบตายตัว */
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
            background-color: #e0e0e0 !important;
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
