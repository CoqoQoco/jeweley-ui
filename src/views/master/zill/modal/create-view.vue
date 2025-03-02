<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="500px">
      <template v-slot:title>
        <div>
          <div class="title-text-lg-header">
            <span class="bi bi-database-fill-add mr-2"></span>
            <span>เพิ่มซิล</span>
          </div>
        </div>
      </template>

      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="p-2">
            <!-- code -->
            <div class="form-col-sm-container">
              <div>
                <div class="title-text">
                  <span>รหัส</span>
                  <span> *</span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  :style="getBgColor(form.code)"
                  v-model="form.code"
                  placeholder="EX: AAC-C1-XX"
                  required
                />
              </div>
            </div>

            <!-- gold-->
            <div class="mt-2">
              <div>
                <div class="title-text">
                  <span>ประเภททอง</span>
                  <span> *</span>
                </div>
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

            <!-- goldSize -->
            <div class="mt-2">
              <div>
                <div class="title-text">
                  <span>ชื่อ EN</span>
                  <span> *</span>
                </div>
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

            <!-- remark -->
            <div class="form-col-sm-container">
              <div>
                <div class="title-text">
                  <span>คำอธิบาย</span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  :style="getBgColor(form.remark)"
                  v-model="form.remark"
                  placeholder=""
                />
              </div>
            </div>

            <div class="submit-container">
              <button class="btn btn-sm btn-main" type="submit">
                <span><i class="bi bi-calendar-check"></i></span>
                <!-- <span>เพิ่มพลอย</span> -->
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
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const interfaceFrom = {
  code: null,
  gold: null,
  goldSize: null,
  remark: null
}
const interfaceValFormCreate = {
  isValGold: false,
  isValGoldSize: false
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
    modelMasterGold: {
      type: Array,
      default: () => []
    },
    modelMasterGoldSize: {
      type: Array,
      default: () => []
    }
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  computed: {
    masterGold() {
      return this.modelMasterGold
    },
    masterGoldSize() {
      return this.modelMasterGoldSize
    }
  },

  data() {
    return {
      form: {
        ...interfaceFrom
      },
      val: {
        ...interfaceValFormCreate
      },

      //wording
      txtConfirmSubmit: 'ยืนยันซิล'
    }
  },

  methods: {
    getBgColor(data) {
      return data ? 'background-color: #b5dad4' : 'background-color: #dad4b5'
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
    },

    closeModal() {
      this.onClear()
      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.validateForm()) {
        swAlert.confirmSubmit(
          `${this.form.code}`,
          this.txtConfirmSubmit,
          async () => {
            await this.submit()
          },
          null,
          null
        )
      }
    },
    onClear() {
      this.form = {
        ...interfaceFrom
      }
    },
    async submit() {
      const param = {
        type: 'ZILL',
        code: this.form.code,
        nameTh: this.form.code,
        nameEn: this.form.code,
        description: this.form.remark,

        goldCode: this.form.gold.code,
        goldSizeCode: this.form.goldSize.code
      }
      const res = await this.masterStore.createMaster({
        formValue: param,
        skipLoading: false
      })

      if (res) {
        this.onClear()
        this.$emit('fetch', this.form)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
