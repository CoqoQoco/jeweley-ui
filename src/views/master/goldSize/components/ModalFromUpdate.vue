<template>
  <div class="app-container-modal">
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="450px">
      <template v-slot:title>
        <h5>เเก้ไขขนาดทอง</h5>
      </template>
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="form-container">
            <div><label class="title">ระบุข้อมูลทอง</label></div>
            <div class="row form-group">
              <div class="col-md-12">
                <label>รหัส</label>
                <input type="text" class="form-control" v-model="model.code" required disabled />
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-12">
                <label>ชื่อไทย</label>
                <div class="flex-group">
                  <div class="w-50">{{ model.nameTh }}</div>
                  <div class="mr-2 ml-1"><i class="bi bi-arrow-right"></i></div>
                  <input type="text" class="form-control" v-model="form.nameTh" required />
                </div>
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-12">
                <label>ชื่ออังกฤษ</label>
                <div class="flex-group">
                  <div class="w-50">{{ model.nameEn }}</div>
                  <div class="mr-2 ml-1"><i class="bi bi-arrow-right"></i></div>
                  <input type="text" class="form-control" v-model="form.nameEn" required />
                </div>
              </div>
            </div>
            <div class="line"></div>
            <div class="row form-group">
              <div class="col-md-12">
                <div class="btn-container">
                  <button class="btn btn-sm btn-main" type="submit">
                    <span class="mr-2"><i class="bi bi-gem"></i></span><span>แก้ไขพลอย</span>
                  </button>
                </div>
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

import swAlert from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-helper.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
//import modal from '@/components/modal/ModalView.vue'
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

export default {
  components: { modal, loading },
  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    modelMaster: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  computed: {
    model() {
      return this.modelMaster
    }
  },
  data() {
    return {
      isLoading: false,
      form: {
        //code: null,
        nameTh: null,
        nameEn: null
      }
    }
  },
  methods: {
    closeModal() {
      this.onclear()
      this.$emit('closeModal')
    },
    onSubmit() {
      swAlert.confirmSubmit(
        `${this.model.code} : ${this.form.nameTh}`,
        `ยืนยันเเก้ไขขนาดทอง`,
        async () => {
          //console.log('call submitPlan')
          await this.submit()
        },
        null,
        null
      )
    },
    async submit() {
      try {
        this.isLoading = true

        const param = {
          type: 'GOLD-SIZE',
          id: this.model.id,
          code: this.model.code,
          nameTh: this.form.nameTh,
          nameEn: this.form.nameEn
        }

        const res = await api.jewelry.post('Master/UpdateMasterModel', param)
        if (res) {
          //console.log(res)
          swAlert.success(
            ``,
            ``,
            async () => {
              this.onclear()
              this.$emit('fetch')
            },
            null,
            null
          )
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    onclear() {
      this.form = {
        //code: null,
        nameTh: null,
        nameEn: null
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
label {
  color: var(--base-font-color);
  //font-size: 13px;
  font-weight: 300;
  margin: 5px 0px 0px 0px;
}
.form-group {
  margin-bottom: 5px;
}
.title {
  font-size: 21px;
  font-weight: 600;
  width: 100%;
}
.btn-container {
  margin-top: 10px;
  display: grid;
  place-items: end;
}
.line {
  border-bottom: 1px solid var(--base-font-color);
  margin: 10px 20px;
}
.flex-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
