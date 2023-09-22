<template>
  <div class="app-container-modal">
    <modal :showModal="isShowModal" @closeModal="closeModal" width="450px">
      <template v-slot:title>
        <h5>เพิ่มส่วนประกอบ</h5>
      </template>
      <template v-slot:content>
        <div class="input-container">
          <label>รายการ</label>
          <input
            type="text"
            class="form-control"
            v-model="form.material"
            placeholder="WG1-5, YG1-10 ..."
          />
          <label>ประเภท</label>
          <input
            type="text"
            class="form-control"
            v-model="form.materialType"
            placeholder="แหวน จี้ ต่างหู ..."
          />
          <label>รูปร่าง</label>
          <input
            type="text"
            class="form-control"
            v-model="form.materialShape"
            placeholder="OV ..."
          />
          <label>ขนาด</label>
          <input
            type="text"
            class="form-control"
            v-model="form.materialSize"
            placeholder="W-DIA, Y-DIA ..."
          />
          <label>จำนวน</label>
          <input type="text" class="form-control" v-model="form.materialQty" />
          <label>หมายเหตุ</label>
          <input
            type="text"
            class="form-control"
            v-model="form.materialRemark"
            placeholder="อื่นๆ ..."
          />
        </div>
      </template>
      <template v-slot:action>
        <div><button class="btn btn-sm btn-main" @click="onSubmit">ตกลง</button></div>
      </template>
    </modal>
  </div>
</template>

<script>
import modal from '@/components/modal/ModalView.vue'
export default {
  components: { modal },
  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      form: {
        material: null,
        materialType: null,
        materialSize: null,
        materialQty: null,
        materialRemark: null
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('closeModal')
    },
    onSubmit() {
      this.$emit('onAdd', this.form)
      this.onclearForm()
      this.closeModal()
    },
    onclearForm() {
      this.form = {
        material: null,
        materialType: null,
        materialSize: null,
        materialQty: null,
        materialRemark: null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
h5 {
  padding: 15px;
  color: var(--base-font-color);
}
input {
  font-size: 12px;
  margin-top: 5px;
}
label {
  font-size: 13px;
  font-weight: 300;
  margin: 5px 0px 0px 0px;
}
.input-container {
  display: grid;
  //gap: 15px;
}
</style>
