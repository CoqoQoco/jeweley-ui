<template>
  <div class="app-container-modal">
    <modal :showModal="isShowModal" @closeModal="closeModal" width="450px">
      <template v-slot:title>
        <div class="title-text-lg p-2">
          <span class="mr-2"><i class="bi bi-journal-text"></i></span>
          <span>เพิ่มข้อมูลซิล</span>
        </div>
      </template>
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="form-col-container">
            <div>
              <span class="title-text">
                <span>ประเภททอง</span>
                <span class="txt-required"> *</span>
              </span>
              <Dropdown
                v-model="form.gold"
                :options="masterGold"
                optionLabel="description"
                class="w-full md:w-14rem"
                :class="val.isValGold === true ? `p-invalid` : ``"
                :showClear="form.gold?.code ? true : false"
              />
            </div>
          </div>
          <div class="form-col-container">
            <div>
              <span class="title-text">
                <span>เปอร์เซ็นทอง</span>
                <span class="txt-required"> *</span>
              </span>
              <Dropdown
                v-model="form.goldSize"
                :options="masterGoldSize"
                optionLabel="description"
                class="w-full md:w-14rem"
                :class="val.isValGoldSize === true ? `p-invalid` : ``"
                :showClear="form.goldSize?.code ? true : false"
              />
            </div>
          </div>
          <div class="form-col-container">
            <div>
              <span class="title-text">
                <span>รหัส</span>
                <span class="txt-required"> *</span>
              </span>
              <input type="text" class="form-control" v-model="form.code" required />
            </div>
          </div>
          <div class="form-col-container">
            <span class="title-text">คำอธิบาย</span>
            <textarea type="text" class="form-control" v-model="form.remark" />
          </div>
          <div class="submit-container">
            <button class="btn btn-sm btn-main" style="width: 120px" type="submit">
              <span><i class="bi bi-gem mr-2"></i></span>
              <span>สร้างข้อมูลซิล</span>
            </button>
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

export default {
  components: {
    modal,
    Dropdown
  },
  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    modelForm: {
      type: Object,
      default: () => ({})
    },
    modelVal: {
      type: Object,
      default: () => ({})
    },
    modelMasterGold: {
      type: Array,
      default: () => []
    },
    modelMasterGoldSize: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    masterGold() {
      return this.modelMasterGold
    },
    masterGoldSize() {
      return this.modelMasterGoldSize
    }
  },
  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    },
    modelVal: {
      handler(val) {
        this.val = { ...val }
      },
      deep: true
    }
  },
  data() {
    return {
      isLoading: false,
      form: { ...this.modelForm },
      val: { ...this.modelVal }
    }
  },
  methods: {
    closeModal() {
      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.validateForm()) {
        this.$emit('submit', this.form)
      }
    },
    validateForm() {
      if (!this.form.gold) {
        this.val = {
          isValGold: true
        }
        return false
      }
      if (!this.form.goldSize) {
        this.val = {
          isValGoldSize: true
        }
        return false
      }

      return true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
