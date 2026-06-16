<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="500px" :isShowActionPart="true">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">เพิ่มซิล</span>
      </template>

      <template #content>
        <form @submit.prevent="onSubmit" id="form-zill-create">
          <div class="p-3">
            <div class="form-row">
              <div class="form-field">
                <span class="title-text">รหัส <span class="text-danger">*</span></span>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.code"
                  placeholder="EX: AAC-C1-XX"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <span class="title-text">ประเภททอง <span class="text-danger">*</span></span>
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

            <div class="form-row">
              <div class="form-field">
                <span class="title-text">ขนาดทอง <span class="text-danger">*</span></span>
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

            <div class="form-row">
              <div class="form-field">
                <span class="title-text">คำอธิบาย</span>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.remark"
                  placeholder=""
                />
              </div>
            </div>
          </div>
        </form>
      </template>

      <template #action>
        <button class="btn btn-sm btn-main" type="submit" form="form-zill-create">
          <i class="bi bi-save"></i> บันทึก
        </button>
        <button class="btn btn-sm btn-outline-main ml-2" type="button" @click="closeModal">
          ยกเลิก
        </button>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

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
@import '@/assets/scss/responsive-style/web';

.form-row {
  margin-bottom: 12px;
}

.form-field {
  width: 100%;

  .title-text {
    display: block;
    margin-bottom: 6px;
  }
}

input.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.4;

  &:focus {
    border-color: var(--base-font-color);
    box-shadow: none;
    outline: none;
  }
}
</style>
