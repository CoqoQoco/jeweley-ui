<template>
  <div class="app-container-modal">
    <modal :showModal="isShowModal" @closeModal="closeModal" width="250px">
      <template v-slot:title>
        <h5>เพิ่มส่วนประกอบ</h5>
      </template>
      <template v-slot:content>
        <div class="input-container">
          <label>รายการ</label>
          <input
            type="text"
            class="form-control"
            v-model="form.name"
            placeholder="WG1-5, YG1-10 ..."
          />
          <label>ขนาด</label>
          <input
            type="text"
            class="form-control"
            v-model="form.size"
            placeholder="W-DIA, Y-DIA ..."
          />
          <label>จำนวน</label>
          <input type="number" min="1" class="form-control" v-model="form.qty" />
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
        name: null,
        size: null,
        qty: 1
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
        name: null,
        size: null,
        qty: 1
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
}
label {
  font-size: 15px;
  font-weight: 300;
  margin: 5px 0px 0px 0px;
}
.input-container {
  display: grid;
  //gap: 15px;
}
</style>
