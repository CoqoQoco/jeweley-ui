<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="1000px">
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="title-text-lg-bg">
            <span class="title-text-white">เพิ่มส่วนประกอบการผลิต</span>
          </div>
          <div class="p-2">
            <div class="mb-2 title-text-lg">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลทอง - เงิน</span>
            </div>
            <div class="form-col-container">
              <div>
                <span class="title-text">สีของทอง/เงิน</span>
                <Dropdown
                  v-model="form.gold"
                  :options="masterGold"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  :class="val.isValGold === true ? `p-invalid` : ``"
                  :showClear="form.gold?.code ? true : false"
                />
              </div>
              <div class="form-content-row-sub-container">
                <div>
                  <span class="title-text">เปอร์เซ็นทอง</span>
                  <Dropdown
                    v-model="form.goldSize"
                    :options="masterGoldSize"
                    optionLabel="description"
                    class="w-full md:w-14rem"
                    :class="val.isValGoldSize === true ? `p-invalid` : ``"
                    :showClear="form.goldSize?.code ? true : false"
                  />
                </div>
                <div>
                  <span class="title-text">จำนวนทอง/เงิน</span>
                  <input type="number" min="1" class="form-control" v-model="form.goldQty" />
                </div>
              </div>
            </div>
            <div class="mb-2 mt-3 title-text-lg">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลพลอย</span>
            </div>
            <div class="form-col-container">
              <div>
                <span class="title-text">ประเภทพลอย</span>
                <Dropdown
                  v-model="form.gem"
                  :options="masterGem"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  :class="val.isValGem === true ? `p-invalid` : ``"
                  :showClear="form.gem?.code ? true : false"
                />
              </div>
              <div>
                <span class="title-text">รูปร่างพลอย</span>
                <Dropdown
                  v-model="form.gemShape"
                  :options="masterGemShape"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  :class="val.isValGemShape === true ? `p-invalid` : ``"
                  :showClear="form.gemShape?.code ? true : false"
                />
              </div>
            </div>
            <div class="form-col-container">
              <div>
                <span class="title-text">ขนาด</span>
                <input type="text" class="form-control" v-model="form.gemSize" />
              </div>
              <div class="form-content-row-sub-container">
                <div>
                  <span class="title-text">จำนวน</span>
                  <input type="number" min="1" class="form-control" v-model="form.gemQty" />
                </div>
                <div>
                  <span class="title-text">หน่วย</span>
                  <input type="text" class="form-control" v-model="form.gemUnit" />
                </div>
              </div>
            </div>
            <div class="mb-2 mt-3 title-text-lg">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลเพชร</span>
            </div>
            <div class="form-col-container">
              <div>
                <span class="title-text">ขนาด</span>
                <input type="text" class="form-control" v-model="form.diamondSize" />
              </div>
              <div class="form-content-row-sub-container">
                <div>
                  <span class="title-text">น้ำหนัก</span>
                  <input type="text" class="form-control" v-model="form.diamondWeight" />
                </div>
                <div>
                  <span class="title-text">หน่วย</span>
                  <input type="text" class="form-control" v-model="form.diamondWeightUnit" />
                </div>
              </div>
            </div>
            <div class="form-col-container">
              <div>
                <span class="title-text">คุณภาพ</span>
                <input type="text" class="form-control" v-model="form.diamondQuality" />
              </div>
              <div class="form-content-row-sub-container">
                <div>
                  <span class="title-text">จำนวน</span>
                  <input type="number" min="1" class="form-control" v-model="form.diamondQty" />
                </div>
                <div>
                  <span class="title-text">หน่วย</span>
                  <input type="text" class="form-control" v-model="form.diamondUnit" />
                </div>
              </div>
            </div>
            <div class="submit-container">
              <button class="btn btn-sm btn-green" type="submit">
                <span class="bi bi-calendar-check"></span>
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

import Dropdown from 'primevue/dropdown'

import swAlert from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-helper.js'

const interfaceForm = {
  gold: {
    id: null,
    code: null,
    nameTh: null,
    nameEn: null,
    description: null
  },
  goldSize: {
    id: null,
    code: null,
    nameTh: null,
    nameEn: null,
    description: null
  },
  goldQty: null,
  gem: null,
  gemShape: null,
  gemQty: null,
  gemUnit: 'pcs',
  gemWeight: null,
  gemWeightUnit: 'ct.',
  gemSize: null,
  diamondQty: null,
  diamondUnit: 'pcs',
  diamondQuality: null,
  diamondWeight: null,
  diamondWeightUnit: 'ct.',
  diamondSize: null
}
const interfaceIsValid = {
  isValGold: false,
  isValGoldSize: false,
  isValGem: false,
  isValGemShape: false
}
export default {
  components: {
    modal,

    Dropdown
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    masterGold: {
      type: Array,
      required: true,
      default: () => []
    },
    masterGoldSize: {
      type: Array,
      required: true,
      default: () => []
    },
    masterGem: {
      type: Array,
      required: true,
      default: () => []
    },
    masterGemShape: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      // --- flag --- //
      isLoading: false,

      // --- form --- //
      form: {
        ...interfaceForm
      },
      val: {
        ...interfaceIsValid
      }
    }
  },
  methods: {
    // --- controller --- //
    closeModal() {
      this.form = {
        ...interfaceForm
      }
      this.val = {
        ...interfaceIsValid
      }
      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.validateForm()) {
        swAlert.confirmSubmit(
          ``,
          'ยืนยันเพิ่มส่วนประกอบการผลิต',
          async () => {
            //console.log('call submitPlan')
            await this.submit()
          },
          null,
          null
        )
      }
    },
    validateForm() {
      if (!this.form.gold.id) {
        this.val = {
          isValGold: true
        }
        return false
      }
      if (!this.form.goldSize.id) {
        this.val = {
          isValGoldSize: true
        }
        return false
      }
      return true
    },

    // ------ api --------//
    async submit() {
      try {
        this.isLoading = true

        const params = {
          id: this.modelValue.id,
          wo: this.modelValue.wo,
          woNumber: this.modelValue.woNumber,
          material: { ...this.form }
        }
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanUpdateMaterial', params)
        if (res) {
          swAlert.success(
            ``,
            '',
            async () => {
              this.form = {
                ...interfaceForm
              }
              this.val = {
                ...interfaceIsValid
              }
              this.$emit('fetch')
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
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

:deep(input) {
  margin-top: 0px !important;
}
:deep(.p-dropdown) {
  height: 35px !important;
  padding-left: 5px;
  width: 100% !important;
  margin-top: 0px !important;
}
.form-content-container {
  //   border: 1px solid #dddddd;
  //   border-radius: 5px;
  //   box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  //   background-color: #f7f7f7;
  padding: 20px 20px;
  overflow: auto;
  height: 570px;
}

.form-content-row-sub-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0px 0px;
}
.title-text-modal {
  padding: 30px;
  font-size: 20px;
  color: var(--base-font-color);
}

.title-text {
  font-size: 12px;
}
</style>
