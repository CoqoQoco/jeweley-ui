<template>
  <div class="app-container-modal">
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="550px">
      <template v-slot:title>
        <h5>บันทึกสถานะงาน</h5>
      </template>
      <template v-slot:content>
        <div><label class="title">สถานะงาน</label></div>
        <div class="row form-group">
          <div class="col-md-6">
            <label></label>
            <Dropdown
              v-model="form.status"
              :options="modelMasterStatus"
              optionLabel="nameTh"
              optionValue="id"
              placeholder="เลือกสถานะงาน"
              class="w-full md:w-14rem"
              :class="val.isValStatus === true ? `p-invalid` : ``"
              @change="onResetValDate('isValStatus')"
            />
            <small v-if="val.isValStatus" class="p-error">Status is required.</small>
          </div>
        </div>
        <div class="line"></div>
        <form v-if="showType === 1" @submit.prevent="onSubmitTypeOne">
          <div class="add-update-container">
            <!-- normal -->
            <div><label class="title">ข้อมูลจ่ายงาน</label></div>
            <div class="row form-group">
              <div class="col-md-6">
                <label>วันที่จ่ายงาน</label>
                <Calendar
                  class="w-100"
                  :class="val.isValAssignDate === true ? `p-invalid` : ``"
                  v-model="form.assignDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                  @date-select="onResetValDate('isValAssignDate')"
                />
                <small v-if="val.isValAssignDate" class="p-error">Date is required.</small>
              </div>
              <div class="col-md-6">
                <label>ผู้จ่ายงาน</label>
                <input type="text" class="form-control" v-model="form.assignBy" required />
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-12">
                <label>รายละเอียด</label>
                <textarea
                  class="form-control"
                  v-model="form.assignDetail"
                  style="height: 50px"
                  required
                >
                </textarea>
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-12">
                <label>ช่างรับงาน</label>
                <input type="text" class="form-control" v-model="form.assignTo" required />
              </div>
            </div>
            <div class="line"></div>
            <div><label class="title">ข้อมูลรับงาน</label></div>
            <div class="row form-group">
              <div class="col-md-6">
                <label>วันที่รับงาน</label>
                <Calendar
                  class="w-100"
                  :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                  v-model="form.receiveDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                  @date-select="onResetValDate('isValReceiveDate')"
                />
                <small v-if="val.isValReceiveDate" class="p-error">Date is required.</small>
              </div>
              <div class="col-md-6">
                <label>ผู้รับงาน</label>
                <input type="text" class="form-control" v-model="form.receiveBy" required />
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-12">
                <label>รายละเอียด</label>
                <textarea
                  class="form-control"
                  v-model="form.receiveDetail"
                  style="height: 50px"
                  required
                >
                </textarea>
              </div>
            </div>

            <div class="line"></div>
            <div class="row form-group">
              <div class="col-md-12">
                <label>ข้อมูลเพิ่มเติมอื่นๆ</label>
                <textarea class="form-control" v-model="form.remark" style="height: 50px">
                </textarea>
              </div>
            </div>
            <div class="line"></div>
            <div class="row form-group">
              <div class="col-md-12">
                <div class="btn-container">
                  <button class="btn btn-sm btn-main" type="submit">
                    <span class="mr-2"><i class="bi bi-gem"></i></span><span>บันทึกสถานะงาน</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        <form v-if="showType === 2" @submit.prevent="onSubmitTypeTwo">
          <div><label class="title">ข้อมูลคัดพลอย</label></div>
          <div class="row form-group">
            <div class="col-md-6">
              <label>วันที่คัดพลอย</label>
              <Calendar
                class="w-100"
                :class="val.isValGemAssignDate === true ? `p-invalid` : ``"
                v-model="form.gemAssignDate"
                dateFormat="dd/mm/yy"
                showIcon
                showButtonBar
                @date-select="onResetValDate('isValGemAssignDate')"
              />
              <small v-if="val.isValGemAssignDate" class="p-error">Date is required.</small>
            </div>
            <div class="col-md-6">
              <label>ผู้คัดพลอย</label>
              <input type="text" class="form-control" v-model="form.gemAssignBy" required />
            </div>
          </div>
          <div class="row form-group">
            <div class="col-md-12">
              <label>รายละเอียด</label>
              <textarea
                class="form-control"
                v-model="form.gemAssignDetail"
                style="height: 50px"
                required
              >
              </textarea>
            </div>
          </div>
          <div class="line"></div>
          <div class="row form-group">
            <div class="col-md-12">
              <label>ข้อมูลเพิ่มเติมอื่นๆ</label>
              <textarea class="form-control" v-model="form.gemRemark" style="height: 50px">
              </textarea>
            </div>
          </div>
          <div class="line"></div>
          <div class="row form-group">
            <div class="col-md-12">
              <div class="btn-container">
                <button class="btn btn-sm btn-main" type="submit">
                  <span class="mr-2"><i class="bi bi-gem"></i></span><span>บันทึกสถานะงาน</span>
                </button>
              </div>
            </div>
          </div>
        </form>
        <form v-if="showType === 3" @submit.prevent="onSubmitTypeTree">
          <div><label class="title">ข้อมูลตรวจ CVD</label></div>
          <div class="row form-group">
            <div class="col-md-6">
              <label>วันที่ตรวจ CVD</label>
              <Calendar
                class="w-100"
                :class="val.isValCVDAssignDate === true ? `p-invalid` : ``"
                v-model="form.cvdAssignDate"
                dateFormat="dd/mm/yy"
                showIcon
                showButtonBar
                @date-select="onResetValDate('isValCVDAssignDate')"
              />
              <small v-if="val.isValCVDAssignDate" class="p-error">Date is required.</small>
            </div>
            <div class="col-md-6">
              <label>ผู้ตวจ CVD</label>
              <input type="text" class="form-control" v-model="form.cvdAssignBy" required />
            </div>
          </div>
          <div class="line"></div>
          <div class="row form-group">
            <div class="col-md-12">
              <label>ข้อมูลเพิ่มเติมอื่นๆ</label>
              <textarea class="form-control" v-model="form.cvdRemark" style="height: 50px">
              </textarea>
            </div>
          </div>
          <div class="line"></div>
          <div class="row form-group">
            <div class="col-md-12">
              <div class="btn-container">
                <button class="btn btn-sm btn-main" type="submit">
                  <span class="mr-2"><i class="bi bi-gem"></i></span><span>บันทึกสถานะงาน</span>
                </button>
              </div>
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
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import swAlert from '@/js/alert/sweetAlerts.js'
import api from '@/axios/axios-config.js'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import { formatISOString } from '@/utils/moment'
export default {
  components: {
    modal,
    loading,
    Dropdown,
    Calendar
  },
  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    masterStatus: {
      type: Array,
      required: true,
      default: () => []
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  computed: {
    modelMasterStatus() {
      return this.masterStatus.filter((x) => x.id !== 10)
    },
    model() {
      return this.modelValue
    }
  },
  data() {
    return {
      isLoading: false,
      showType: 0,
      val: {
        isValStatus: false,
        isValAssignDate: false,
        isValReceiveDate: false,
        isValGemAssignDate: false,
        isValCVDAssignDate: false
      },
      form: {
        status: null,
        assignDate: null,
        assignBy: null,
        assignDetail: null,
        assignTo: null,
        receiveDate: null,
        receiveBy: null,
        receiveDetail: null,
        remark: null,
        gemAssignDate: null,
        gemAssignBy: null,
        gemAssignDetail: null,
        gemRemark: null,
        cvdAssignDate: null,
        cvdAssignBy: null,
        cvdRemark: null
      }
    }
  },
  methods: {
    closeModal() {
      this.onClearVal()
      this.onclearForm()
      this.showType = 0
      this.$emit('closeModal')
    },
    onclearForm() {
      this.form = {
        status: null,
        assignDate: null,
        assignBy: null,
        assignDetail: null,
        assignTo: null,
        receiveDate: null,
        receiveBy: null,
        receiveDetail: null,
        remark: null,
        gemAssignDate: null,
        gemAssignBy: null,
        gemAssignDetail: null,
        gemRemark: null,
        cvdAssignDate: null,
        cvdAssignBy: null,
        cvdRemark: null
      }
    },
    onSelectType() {
      if (this.form.status) {
        //console.log(this.form.status)
        if (this.form.status === 70) {
          this.showType = 2
        } else if (this.form.status === 85) {
          this.showType = 3
        } else {
          this.showType = 1
        }
      } else {
        this.showType = 0
      }
    },

    // ------ val ------- //
    VaidateForm() {
      if (!this.form.status) {
        this.val = {
          isValStatus: true
        }
        return false
      }

      if (this.showType === 1) {
        if (!this.form.assignDate) {
          this.val = {
            isValAssignDate: true
          }
          return false
        }
        if (!this.form.receiveDate) {
          this.val = {
            isValReceiveDate: true
          }
          return false
        }
      }

      if (this.showType === 2) {
        if (!this.form.gemAssignDate) {
          this.val = {
            isValGemAssignDate: true
          }
          return false
        }
      }

      if (this.showType === 3) {
        if (!this.form.cvdAssignDate) {
          this.val = {
            isValCVDAssignDate: true
          }
          return false
        }
      }

      return true // pass
    },
    onClearVal() {
      this.val = {
        isValStatus: false,
        isValAssignDate: false,
        isValReceiveDate: false,
        isValCVDAssignDate: false
      }
    },
    onResetValDate(index) {
      //console.log(index)
      if (index === 'isValStatus') {
        if (this.form.status) {
          this.val.isValStatus = false
        }
        this.onSelectType()
      }
      if (index === 'isValAssignDate') {
        if (this.form.assignDate) {
          this.val.isValAssignDate = false
        }
      }
      if (index === 'isValReceiveDate') {
        if (this.form.receiveDate) {
          this.val.isValReceiveDate = false
        }
      }
      if (index === 'isValGemAssignDate') {
        if (this.form.gemAssignDate) {
          this.val.isValGemAssignDate = false
        }
      }
      if (index === 'isValCVDAssignDate') {
        if (this.form.cvdAssignDate) {
          this.val.isValCVDAssignDate = false
        }
      }
    },

    // ------ api --------//
    onSubmitTypeOne() {
      if (this.VaidateForm()) {
        //console.log('pass')
        if (this.showType === 1) {
          this.submitTypeOne()
        }
      }
    },
    async submitTypeOne() {
      try {
        this.isLoading = true

        const params = {
          productionPlanId: this.model.id,
          wo: this.model.wo,
          woNumber: this.model.woNumber,

          status: this.form.status,
          assignDate: formatISOString(this.form.assignDate),
          assignBy: this.form.assignBy,
          assignDetail: this.form.assignDetail,
          assignTo: this.form.assignTo,
          receiveDate: formatISOString(this.form.receiveDate),
          receiveBy: this.form.receiveBy,
          remark: this.form.remark
        }
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanAddStatusDetail', params)
        if (res) {
          swAlert.success(
            ``,
            '',
            async () => {
              this.closeModal()
            },
            null,
            null
          )
        }

        this.isLoading = false
      } catch (error) {
        this.isLoading = false
      }
    },
    onSubmitTypeTwo() {
      if (this.VaidateForm()) {
        //console.log('pass')
        if (this.showType === 2) {
          this.submitTypeTwo()
        }
      }
    },
    async submitTypeTwo() {
      try {
        this.isLoading = true

        const params = {
          productionPlanId: this.model.id,
          wo: this.model.wo,
          woNumber: this.model.woNumber,

          status: this.form.status,
          assignDate: formatISOString(this.form.gemAssignDate),
          assignBy: this.form.gemAssignBy,
          assignDetail: this.form.gemAssignDetail,
          //assignTo: this.form.assignTo,
          //receiveDate: formatISOString(this.form.receiveDate),
          //receiveBy: this.form.receiveBy,
          remark: this.form.gemRemark
        }
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanAddStatusDetail', params)
        if (res) {
          swAlert.success(
            ``,
            '',
            async () => {
              this.closeModal()
            },
            null,
            null
          )
        }

        this.isLoading = false
      } catch (error) {
        this.isLoading = false
      }
    },
    onSubmitTypeTree() {
      if (this.VaidateForm()) {
        console.log('pass')
        if (this.showType === 3) {
          this.submitTypeTree()
        }
      }
    },
    async submitTypeTree() {
      try {
        this.isLoading = true

        const params = {
          productionPlanId: this.model.id,
          wo: this.model.wo,
          woNumber: this.model.woNumber,

          status: this.form.status,
          assignDate: formatISOString(this.form.cvdAssignDate),
          assignBy: this.form.cvdAssignBy,
          //assignDetail: this.form.gemAssignDetail,
          //assignTo: this.form.assignTo,
          //receiveDate: formatISOString(this.form.receiveDate),
          //receiveBy: this.form.receiveBy,
          remark: this.form.gemRemark
        }
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanAddStatusDetail', params)
        if (res) {
          swAlert.success(
            ``,
            '',
            async () => {
              this.closeModal()
            },
            null,
            null
          )
        }

        this.isLoading = false
      } catch (error) {
        this.isLoading = false
      }
    }
  },
  created() {
    //this.clearVal()
  }
}
</script>

<style lang="scss" scoped>
h5 {
  padding: 10px 0px 0px 10px;
  font-size: 21px;
  font-weight: 600;
  color: var(--base-font-color);
}
input {
  //font-size: 12px;
  //margin-top: 5px;
}
label {
  color: var(--base-font-color);
  //font-size: 13px;
  font-weight: 300;
  margin: 5px 0px 0px 0px;
}
.title {
  font-size: 21px;
  //padding: 0px 10px 0px 10px;
  font-weight: 600;
  width: 100%;
  //background-color: var(--base-color);
}
.line {
  border-bottom: 1px solid var(--base-font-color);
  margin: 10px 20px;
}
.form-group {
  margin-bottom: 5px;
}
.btn-container {
  margin-top: 10px;
  display: grid;
  place-items: end;
}
</style>
