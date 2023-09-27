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
            <div class="row form-group">
              <div class="col-md-6">
                <label>ประเภททอง</label>
                <Dropdown
                  v-model="form.gold"
                  :options="masterGold"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  required
                  :showClear="form.gold ? true : false"
                />
              </div>
              <div class="col-md-6">
                <label>ขนาดทอง</label>
                <Dropdown
                  v-model="form.goldSize"
                  :options="masterGoldSize"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  required
                  :showClear="form.goldSize ? true : false"
                />
              </div>
            </div>
            <div class="line"></div>
            <div class="row form-group">
              <div class="col-md-6">
                <label>ประเภทพลอย</label>
                <Dropdown
                  v-model="form.gem"
                  :options="masterGem"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  required
                  :showClear="form.gem ? true : false"
                />
              </div>
              <div class="col-md-6">
                <label>รูปร่างพลอย</label>
                <Dropdown
                  v-model="form.gemShape"
                  :options="masterGemShape"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  required
                  :showClear="form.gemShape ? true : false"
                />
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-3">
                <label>จำนวน</label>
                <input
                  type="number"
                  class="form-control box-input"
                  v-model="form.gemQty"
                  min="1"
                  required
                />
              </div>
              <div class="col-md-3">
                <label>หน่วย</label>
                <input type="text" class="form-control box-input" v-model="form.gemUnit" required />
              </div>
              <div class="col-md-6">
                <label>ขนาด</label>
                <input type="text" class="form-control box-input" v-model="form.gemSize" required />
              </div>
            </div>
            <div class="line"></div>
            <div class="row form-group">
              <div class="col-md-12">
                <div class="btn-container">
                  <button class="btn btn-sm btn-main" @click="onSubmit">ตกลง</button>
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
import modal from '@/components/modal/ModalView.vue'
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
        gold: null,
        goldSize: null,
        gem: null,
        gemShape: null,
        gemQty: 1,
        gemUnit: null,
        gemSize: null
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
        gem: null,
        gemShape: null,
        gemQty: 1,
        gemUnit: null,
        gemSize: null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
h5 {
  padding: 10px 0px 0px 10px;
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
</style>
