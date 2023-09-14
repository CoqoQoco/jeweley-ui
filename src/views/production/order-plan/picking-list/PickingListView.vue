<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <pageTitle
      title="สร้างใบจ่าย-รับคืนงาน"
      description="หน้าสร้างใบจ่าย-รับคืนงาน เเละรายละเอียดต่างๆ"
      :isShowBtnClose="false"
    >
    </pageTitle>
    <div class="form-container">
      <form @submit.prevent="onSubmitPlan">
        <div class="data-container">
          <div class="header-btn-edit">
            <h6>1. {{ $t('view.pickinglist.dataTitle') }} <i class="bi bi-card-list"></i></h6>
            <button
              v-if="!isNew"
              :class="`${isEdit ? `btn-success` : `btn-main`}`"
              class="btn btn-sm btn-lock"
              type="button"
              @click="onUnlock"
            >
              <span><i :class="`${isEdit ? `bi bi-unlock` : `bi bi-lock`}`"></i></span>
            </button>
          </div>
          <div class="data-input-container">
            <div class="input-container">
              <div>
                <label>{{ $t('view.pickinglist.title.wo') }}</label>
                <input
                  type="text"
                  class="form-control box-input"
                  v-model="form.wo"
                  required
                  :disabled="isLock"
                />
              </div>
              <div>
                <label>{{ $t('view.pickinglist.title.nowo') }}</label>
                <input
                  type="number"
                  min="1"
                  class="form-control box-input"
                  v-model="form.nowo"
                  :disabled="isLock"
                  required
                />
              </div>
              <div>
                <label>{{ $t('view.pickinglist.title.requestDate') }}</label>
                <input
                  type="date"
                  class="form-control box-input"
                  v-model="form.requestDate"
                  :disabled="isLock"
                  required
                />
              </div>
            </div>
          </div>
          <div class="data-input-container">
            <div class="input-container">
              <div>
                <label>{{ $t('view.pickinglist.title.mold') }}</label>
                <input
                  type="text"
                  class="form-control box-input"
                  v-model="form.mold"
                  :disabled="isLock"
                  required
                />
              </div>
              <div>
                <label>{{ $t('view.pickinglist.title.productNumber') }}</label>
                <input
                  type="text"
                  class="form-control box-input"
                  v-model="form.productNumber"
                  :disabled="isLock"
                  required
                />
              </div>
              <div>
                <label>{{ $t('view.pickinglist.title.customerNumber') }}</label>
                <input
                  type="text"
                  class="form-control box-input"
                  v-model="form.customerNumber"
                  :disabled="isLock"
                  required
                />
              </div>
            </div>
          </div>
          <div class="data-input-remark-container">
            <div class="input-container">
              <label>{{ $t('view.pickinglist.title.remark') }}</label>
              <textarea
                class="form-control box-text-area"
                v-model="form.remark"
                :disabled="!isEdit"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="upload-container">
          <h6 style="padding-bottom: 20px">
            2. {{ $t('view.pickinglist.uploadImag') }} <i class="bi bi-image"></i>
          </h6>
          <div class="select-preview-container">
            <div class="preveiw-container" v-if="imageUrls.length">
              <div class="image-container" v-for="(imageUrl, index) in imageUrls" :key="index">
                <img :src="imageUrl" alt="Preview" class="preview-image" />
                <span @click="deleteImage(index)" class="delete-icon">&#10006;</span>
              </div>
            </div>
            <div v-if="isEdit" class="select-continer">
              <input
                type="file"
                multiple
                name="file"
                class="hidden-input"
                @change="previewImages"
                ref="file"
                accept=".jpg, .png"
              />
              <i class="bi bi-plus-circle" style="font-size: 30px"></i>
            </div>
          </div>
        </div>
        <div class="data-container">
          <h6>3. {{ $t('view.pickinglist.quantityProduct') }} <i class="bi bi-cart4"></i></h6>
          <div class="data-input-container">
            <div class="data-input-quantity-container">
              <div class="input-container">
                <div>
                  <label>{{ $t('view.pickinglist.title.pc') }}</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.qtyUnit"
                    :disabled="!isEdit"
                    required
                  />
                </div>
                <div>
                  <label>{{ $t('view.pickinglist.title.quantity') }}</label>
                  <input
                    type="number"
                    min="1"
                    class="form-control"
                    v-model="form.qry"
                    :disabled="!isEdit"
                    required
                  />
                </div>
                <div>
                  <label>{{ $t('view.pickinglist.title.readyMade') }}</label>
                  <input
                    type="number"
                    min="0"
                    class="form-control"
                    v-model="form.qtyFinish"
                    :disabled="!isEdit"
                    required
                  />
                </div>
                <div>
                  <label>{{ $t('view.pickinglist.title.semireadyMade') }}</label>
                  <input
                    type="number"
                    min="0"
                    class="form-control"
                    v-model="form.qtySemiFinish"
                    :disabled="!isEdit"
                    required
                  />
                </div>
                <div>
                  <label>{{ $t('view.pickinglist.title.cast') }}</label>
                  <input
                    type="number"
                    min="0"
                    class="form-control"
                    v-model="form.qtyCast"
                    :disabled="!isEdit"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="data-container">
          <div class="title">
            <h6>4. {{ $t('view.pickinglist.component') }} <i class="bi bi-gem"></i></h6>
            <button
              class="btn btn-sm btn-add-components"
              :class="`${isEdit ? `btn-warning` : `btn-secondary`}`"
              @click="onAddMat"
              type="button"
              :disabled="!isEdit"
            >
              <span class="mr-1"><i class="bi bi-plus"></i></span>
              <!-- <span class="mr-1"><i class="bi bi-gem"></i></span> -->
              <span>เพิ่มส่วนประกอบ</span>
            </button>
          </div>
          <div class="data-input-container">
            <div class="data-input-components-container">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>รายการ</th>
                    <th>ประเภท</th>
                    <th style="width: 100px">ขนาด/น้ำหนัก</th>
                    <th style="width: 100px">จำนวน</th>
                    <th>หมายเหตุ</th>
                    <th style="width: 60px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(data, index) in form.material" :key="index">
                    <td>{{ data.material }}</td>
                    <td>{{ data.materialType }}</td>
                    <td>{{ data.materialSize }}</td>
                    <td>{{ data.materialQty }}</td>
                    <td>{{ data.materialRemark }}</td>
                    <td style="text-align: center">
                      <button
                        class="btn btn-sm"
                        :class="`${isEdit ? `btn-danger` : `btn-secondary`}`"
                        type="button"
                        :disabled="!isEdit"
                        @click="deletMatItem(index)"
                      >
                        <i class="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="!form.material.length" class="nodata-container">
                <label>ไม่มีส่วนประกอบ</label>
              </div>
            </div>
          </div>
        </div>
        <div class="btn-container">
          <div v-if="isNew" class="float-right">
            <button v-if="isNew" class="btn btn-sm btn-main btn-custom-summit" type="submit">
              <span class="mr-1"><i class="bi bi-gem"></i></span> <span>สร้างใบจ่าย-รับคืนงาน</span>
            </button>
          </div>
          <div v-else class="float-right">
            <button class="btn btn-sm btn-info btn-custom-summit mr-2" type="button">
              <span class="mr-1"><i class="bi bi-printer"></i></span>
              <span>พิมพ์เอกสาร</span>
            </button>
            <button
              v-if="isEdit"
              :class="`${isEdit ? `btn-danger` : `btn-secondary`}`"
              class="btn btn-sm btn-custom-summit mr-2"
              type="button"
            >
              <span class="mr-1"><i class="bi bi-trash-fill"></i></span>
              <span>ลบใบจ่าย-รับคืนงาน</span>
            </button>
            <button
              v-if="isEdit"
              :class="`${isEdit ? `btn-warning` : `btn-secondary`}`"
              class="btn btn-sm btn-custom-summit"
              type="submit"
            >
              <span class="mr-1"><i class="bi bi-gem"></i></span>
              <span>เเก้ไขใบจ่าย-รับคืนงาน</span>
            </button>
          </div>
        </div>
      </form>
    </div>
    <ModalAddMat :isShowModal="isShowModal" @closeModal="closeModal" @onAdd="AddMat"></ModalAddMat>
  </div>
</template>

<script>
import { formatISOString } from '@/utils/date'
import pageTitle from '@/components/custom/PageTitle.vue'
import ModalAddMat from './components/ModalAddMat.vue'
import loading from '@/components/overlay/loading-overlay.vue'
import api from '@/axios/axios-config.js'
//import UploadImg from '@/components/btn-import/UploadImages.vue'
export default {
  components: {
    //UploadImg
    pageTitle,
    ModalAddMat,
    loading
  },
  data() {
    return {
      isLoading: false,
      id: null,
      isNew: true,
      isLock: false,
      isEdit: true,
      imageUrls: [],
      isShowModal: false,
      form: {
        wo: null,
        nowo: null,
        requestDate: new Date().toISOString().substr(0, 10),
        mold: null,
        productNumber: null,
        customerNumber: null,
        remark: null,
        qtyUnit: 'PC',
        qry: 1,
        qtyFinish: 0,
        qtySemiFinish: 0,
        qtyCast: 0,
        material: []
      }
    }
  },
  methods: {
    // ----- Internal Method -----//
    previewImages() {
      console.log(this.$refs.file)
      const temFiles = this.$refs.file
      const files = temFiles.files

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            this.imageUrls.push(event.target.result)
          }
          reader.readAsDataURL(file)
        }
      }
    },
    deleteImage(index) {
      this.imageUrls.splice(index, 1)
    },
    deletMatItem(index) {
      this.form.material.splice(index, 1)
    },

    // ---- Components Method ----//
    onAddMat() {
      //console.log('add mat')
      this.isShowModal = true
    },
    AddMat(item) {
      //console.log(item);
      this.form.material.push(item)

      // this.form.components = this.form.components.length
      //   ? [this.form.components, ...item]
      //   : this.form.components.push(item)

      console.log(item)
    },
    closeModal() {
      this.isShowModal = false
    },
    onUnlock() {
      this.isEdit = !this.isEdit
    },

    // ------ Api ------
    async onSubmitPlan() {
      try {
        //console.log('submit')
        this.isLoading = true
        const param = {
          wo: this.form.wo,
          woNumber: this.form.woNumber,
          requestDate: formatISOString(this.form.requestDate),

          mold: this.form.mold,
          productNumber: this.form.productNumber,
          customerNumber: this.form.customerNumber,

          remark: this.form.remark,

          qty: this.form.qty,
          qtyFinish: this.form.qtyFinish,
          qtySemiFinish: this.form.qtySemiFinish,
          qtyCast: this.form.qtyCast,
          qtyUnit: this.form.qtyUnit,

          material: [...this.form.material]
        }

        console.log(param)
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanCreate', param)
        if (res) {
          console.log(res)
        }

        this.isLoading = false
      } catch (error) {
        this.isLoading = false
      }
    }
  },
  created() {
    this.id = this.$route.params.id
    if (this.id) {
      //console.log(this.id)
      this.isNew = false
      this.isLock = true
      this.isEdit = false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  //padding: 20px 150px 20px 150px;
}
.form-container {
  padding: 0px 10px 0px 10px;
  //border: 1px solid white;
  //border-radius: 5px;
  //box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  //background-color: #f7f7f7;
  //padding: 20px;
  //height: 100px;
  h6 {
    padding: 5px 0px 5px 0px;
    color: var(--base-font-color);
  }
  input {
    font-size: 12px;
  }
  label {
    font-size: 12px;
  }
  table {
    font-size: 12px;
    margin-bottom: 5px;
    border: 1px solid var(--base-color);
    thead {
      background-color: var(--base-font-color);
      color: var(--base-color);
      //font-size: 12px;
      height: 42px;
      border-collapse: collapse; /* รวมเส้นกรอบของตาราง */
      //width: calc(100% - 15px);
    }
    tbody {
      //display: block;
      //overflow: auto;
    }
    tbody tr {
      //display: table;
      width: 100%;
      table-layout: fixed; /* even columns width , fix width of table too*/
    }
    th,
    td {
      padding: 2px 10px 2px 10px !important;
      vertical-align: middle !important;
      border: 1px solid var(--base-color); /* สร้างเส้นกรอบ 1 พิกเซล */
      word-wrap: break-word;
      //white-space: nowrap;
      //text-overflow: ellipsis;
    }
    button {
      height: 30px !important;
      i {
        font-size: 10px;
      }
    }
  }
  .header-btn-edit {
    display: flex;
    justify-content: space-between;
  }
  .btn-lock {
    height: 25px;
    i {
      font-size: 10px;
      vertical-align: top;
    }
  }
  .upload-container {
    border: 1px solid white;
    border-radius: 5px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    background-color: #f7f7f7;
    padding: 20px;
    margin-bottom: 10px;
    //display: grid;
    //justify-content: center;
    .select-preview-container {
      display: flex;
      flex-direction: row;
      margin-top: 5px;
      .preveiw-container {
        display: flex;
        //justify-content: center;
        width: auto;
        overflow-x: auto; /* เพิ่มการเลื่อนในแนวนอน */
        white-space: nowrap; /* ป้องกันข้อความขึ้นบรรทัดใหม่ */
        //width: 100%;
      }
      .select-continer {
        display: flex;
        justify-content: center;
        align-items: center;
        //background-color: var(--base-color);
        height: 130px;
        width: 130px;
        border: 1px solid var(--base-color);
        color: var(--base-color);
        //margin: 0px 0px 0px 0px;
        .hidden-input {
          opacity: 0;
          overflow: hidden;
          position: absolute;
          width: 130px;
          height: 130px;
        }
      }
      .select-continer:hover {
        border: 1px solid var(--base-font-color);
        color: var(--base-font-color);
        //margin: 0px 0px 0px 10px;
      }
      .image-container {
        display: inline-block;
        position: relative;
        .preview-image {
          height: 130px;
          width: 130px;
          margin-right: 5px;
          border: 0.1px solid var(--base-color);
        }
        .delete-icon {
          position: absolute;
          top: 0;
          right: 0;
          margin-right: 10px;
          cursor: pointer;
          padding: 5px;
          color: var(--base-color);
          &:hover {
            color: var(--base-font-color);
          }
        }
      }
    }
  }
  .data-container {
    border: 1px solid white;
    border-radius: 5px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    background-color: #f7f7f7;
    //padding: 20px;
    padding: 10px;
    margin-bottom: 10px;
    .title {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      .btn-add-components {
        height: 30px;
        //width: 60px;
      }
    }

    .data-input-container {
      .input-container {
        padding: 5px 20px 0px 20px;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr; /* แบ่งหน้าจอออกเป็นสองส่วนเท่าๆ กัน */
        gap: 50px; /* ระยะห่างระหว่างส่วน */
        //margin-bottom: 10px;
      }
      .box-input {
        width: calc(100% - 20px);
        min-width: 128px;
      }
      .nodata-container {
        text-align: center;
        color: var(--base-sub-color);
      }
    }
    .data-input-remark-container {
      .input-container {
        padding: 5px 20px 0px 20px;
        display: grid;
        //grid-template-columns: 1fr; /* แบ่งหน้าจอออกเป็นสองส่วนเท่าๆ กัน */
        //gap: 50px; /* ระยะห่างระหว่างส่วน */
        .box-text-area {
          width: calc(100% - 20px);
          min-width: 128px;
          border: 0.1px solid var(--base-color);
          overflow: auto;
          height: 40px;
        }
      }
    }
    .data-input-quantity-container {
      .input-container {
        padding: 5px 20px 0px 20px;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr; /* แบ่งหน้าจอออกเป็นสองส่วนเท่าๆ กัน */
        gap: 10px; /* ระยะห่างระหว่างส่วน */
      }
    }
  }
  .btn-container {
    padding-bottom: 40px;
    margin-top: 20px;
  }
  .btn-custom-summit {
    height: 40px;
    width: 180px;
  }
}
</style>
