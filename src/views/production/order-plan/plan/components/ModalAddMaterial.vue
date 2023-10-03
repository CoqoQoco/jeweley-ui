<template>
  <div class="app-container-modal">
    <modal :showModal="isShowModal" @closeModal="closeModal" width="550px">
      <template v-slot:title>
        <h5>เพิ่มส่วนประกอบสินค้า</h5>
      </template>
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="material-container">
            <!-- <div class="row form-group">
              <div class="col-md-12">
                <h6>เพิ่มส่วนประกอบ</h6>
              </div>
            </div> -->
            <div><label class="title">ระบุข้อมูลทอง</label></div>
            <div class="row form-group">
              <div class="col-md-6">
                <label>ประเภททอง</label>
                <Dropdown
                  v-model="form.gold"
                  :options="masterGold"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  :showClear="form.gold?.code ? true : false"
                />
              </div>
              <div class="col-md-3">
                <label>เปอร์เซ็นทอง</label>
                <Dropdown
                  v-model="form.goldSize"
                  :options="masterGoldSize"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  :showClear="form.goldSize?.code ? true : false"
                />
              </div>
              <div class="col-md-3">
                <label>จำนวนทอง</label>
                <input
                  type="number"
                  min="1"
                  class="form-control box-input"
                  v-model="form.goldQty"
                />
              </div>
            </div>
            <div class="line"></div>
            <div><label class="title">ระบุข้อมูลพลอย</label></div>
            <div class="row form-group">
              <div class="col-md-6">
                <label>ประเภทพลอย</label>
                <Dropdown
                  v-model="form.gem"
                  :options="masterGem"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  :showClear="form.gem?.code ? true : false"
                />
              </div>
              <div class="col-md-6">
                <label>รูปร่างพลอย</label>
                <Dropdown
                  v-model="form.gemShape"
                  :options="masterGemShape"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  :showClear="form.gemShape?.code ? true : false"
                />
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-3">
                <label>จำนวน</label>
                <input type="number" class="form-control box-input" v-model="form.gemQty" min="1" />
              </div>
              <div class="col-md-3">
                <label>หน่วย</label>
                <input type="text" class="form-control box-input" v-model="form.gemUnit" />
              </div>
              <div class="col-md-6">
                <label>ขนาด</label>
                <input type="text" class="form-control box-input" v-model="form.gemSize" />
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-3">
                <label>น้ำหนัก</label>
                <input type="text" class="form-control box-input" v-model="form.gemWeight" />
              </div>
              <div class="col-md-3">
                <label>หน่วย</label>
                <input
                  type="text"
                  class="form-control box-input"
                  v-model="form.gemWeightUnit"
                  disabled
                />
              </div>
              <!-- <div class="col-md-6">
                <label>ขนาด</label>
                <input type="text" class="form-control box-input" v-model="form.gemSize" />
              </div> -->
            </div>
            <div class="line"></div>
            <div><label class="title">ระบุข้อมูลเพชร</label></div>
            <div class="row form-group">
              <div class="col-md-3">
                <label>จำนวน</label>
                <input
                  type="number"
                  class="form-control box-input"
                  v-model="form.diamondQty"
                  min="1"
                />
              </div>
              <div class="col-md-3">
                <label>หน่วย</label>
                <input type="text" class="form-control box-input" v-model="form.diamondUnit" />
              </div>
              <div class="col-md-6">
                <label>ขนาด</label>
                <input type="text" class="form-control box-input" v-model="form.diamondSize" />
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-3">
                <label>น้ำหนัก</label>
                <input type="text" class="form-control box-input" v-model="form.diamondWeight" />
              </div>
              <div class="col-md-3">
                <label>หน่วย</label>
                <input
                  type="text"
                  class="form-control box-input"
                  v-model="form.diamondWeightUnit"
                  disabled
                />
              </div>
              <div class="col-md-6">
                <label>คุณภาพ</label>
                <input type="text" class="form-control box-input" v-model="form.diamondQuality" />
              </div>
            </div>
            <div class="line"></div>
            <div class="row form-group">
              <div class="col-md-12">
                <div class="btn-container">
                  <button class="btn btn-sm btn-main" type="submit">
                    <span class="mr-2"><i class="bi bi-gem"></i></span><span>เพิ่มส่วนประกอบ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </template>
      <!-- <template v-slot:action>
        <div><button class="btn btn-sm btn-main" type="submit">ตกลง</button></div>
      </template> -->
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
//import modal from '@/components/modal/ModalView.vue'

import Dropdown from 'primevue/dropdown'
export default {
  components: { modal, Dropdown },
  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Object,
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
      form: {
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
        gem: {
          id: null,
          code: null,
          nameTh: null,
          nameEn: null,
          description: null
        },
        gemShape: {
          id: null,
          code: null,
          nameTh: null,
          nameEn: null,
          description: null
        },
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
    }
  },
  watch: {},
  methods: {
    closeModal() {
      this.$emit('closeModal')
    },
    onSubmit() {
      //console.log(this.form)
      this.$emit('onAdd', this.form)
      this.onclearForm()
      this.closeModal()
    },
    onclearForm() {
      this.form = {
        gold: null,
        goldSize: null,
        goldQty: null,
        gem: null,
        gemShape: null,
        gemQty: null,
        gemUnit: 'pcs',
        gemSize: null,
        gemWeight: null,
        gemWeightUnit: 'ct.',
        diamondQty: null,
        diamondUnit: 'pcs',
        diamondQuality: null,
        diamondWeight: null,
        diamondWeightUnit: 'ct.',
        diamondSize: null
      }
    }
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
.line {
  border-bottom: 1px solid var(--base-font-color);
  margin: 10px 20px;
}
.btn-container {
  margin-top: 10px;
  display: grid;
  place-items: end;
}
.title {
  font-size: 21px;
  //padding: 0px 10px 0px 10px;
  font-weight: 600;
  width: 100%;
  //background-color: var(--base-color);
}
.form-group {
  margin-bottom: 5px;
}
</style>
