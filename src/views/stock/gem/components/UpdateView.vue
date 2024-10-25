<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShow" @closeModal="closeModal">
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="title-text-lg">
            <span class="mr-2"><i class="bi bi-journal-text"></i></span>
            <span>
              {{ `เเก้ไขข้อมูลวัถุดิบ: ${model.name}` }}
            </span>
          </div>
          <div class="form-col-container p-2">
            <!-- code -->
            <div>
              <div>
                <span class="title-text">รหัส</span>
                <span class="txt-required"> *</span>
              </div>
              <input
                type="text"
                class="form-control"
                :class="form.code ? `` : `bg-warning`"
                v-model="form.code"
                disabled
                required
              />
            </div>

            <!-- group name -->
            <div>
              <div>
                <span class="title-text">หมวดหมู่</span>
                <span class="txt-required"> *</span>
              </div>
              <!-- <input
                type="text"
                class="form-control"
                :class="form.groupName ? `` : `bg-warning`"
                v-model="form.groupName"
                disabled
                required
              /> -->
              <AutoComplete
                v-model="form.groupName"
                :suggestions="suggestionsGroupName"
                optionLabel="value"
                optionValue="value"
                @complete="searchGroupName"
                :invalid="val.isGroupName"
              />
            </div>

            <div></div>
          </div>
          <div class="form-col-container p-2">
            <!-- size -->
            <div>
              <div>
                <span class="title-text">ขนาด</span>
                <span class="txt-required"> *</span>
              </div>
              <input type="text" class="form-control" v-model="form.size" required />
            </div>

            <!-- shape -->
            <div>
              <div>
                <span class="title-text">รูปร่าง</span>
                <span class="txt-required"> *</span>
              </div>
              <Dropdown
                v-model="form.shape"
                :options="gemShape"
                optionLabel="description"
                class="w-full md:w-14rem"
                :showClear="form.shape ? true : false"
                :class="val.isShape === true ? `p-invalid` : ``"
              >
              </Dropdown>
            </div>

            <!-- grade -->
            <div>
              <div>
                <span class="title-text">เกรด</span>
                <span class="txt-required"> *</span>
              </div>
              <Dropdown
                v-model="form.grade"
                :options="grade"
                optionLabel="description"
                class="w-full md:w-14rem"
                :showClear="form.grade ? true : false"
                :class="val.isGrade === true ? `p-invalid` : ``"
              >
              </Dropdown>
            </div>
          </div>
          <div class="form-col-container p-2">
            <!-- reamrk -->
            <div>
              <div>
                <span class="title-text">คำอธิบาย</span>
                <!-- <span class="txt-required"> *</span> -->
              </div>
              <textarea class="form-control" v-model="form.remark" rows="3" required></textarea>
            </div>
          </div>
          <!-- btn -->
          <div class="d-flex justify-content-end mt-2">
            <!-- <button class="btn btn-sm btn-main mr-2" type="button" @click="onTest">TEST</button> -->
            <button class="btn btn-sm btn-main" type="submit">
              <span class="mr-2">
                <i class="bi bi-gem"></i>
              </span>
              <span>เเก้ไขข้อมูลวัถุดิบ</span>
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
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import AutoComplete from 'primevue/autocomplete'
import Dropdown from 'primevue/dropdown'

import swAlert from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-config.js'

const interfaceForm = {
  code: null,
  groupName: null,
  size: null,
  shape: null
}
const interfaceIsVal = {
  isGroupName: false,
  isShape: false,
  isGrade: false
}

export default {
  components: {
    modal,
    loading,
    AutoComplete,
    Dropdown
  },
  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    },
    modelGroupName: {
      type: Array,
      //required: true,
      default: () => []
    },
    masterGemShape: {
      type: Array,
      //required: true,
      default: () => []
    },
    masterGrade: {
      type: Array,
      required: true,
      default: () => []
    },
    modelGem: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  computed: {
    groupName() {
      return this.modelGroupName
    },
    gemShape() {
      return this.masterGemShape
    },
    grade() {
      console.log('masterGrade', this.masterGrade)
      return this.masterGrade
    },
    model() {
      return this.modelGem
    }
  },
  watch: {
    'form.groupName'() {
      if (this.form.groupName) {
        this.val.isGroupName = false
      }
    },
    'form.shape'() {
      if (this.form.shape) {
        this.val.isShape = false
      }
    },
    'form.grade'() {
      if (this.form.grade) {
        this.val.isGrade = false
      }
    },
    modelGem: {
      handler(val) {
        console.log('modelGem', val)
        this.form = {
          ...val,
          remark: val.remark1 ?? '',
          grade: this.grade.find((el) => el.nameTh === val.grade),
          shape: this.gemShape.find((el) => el.code === val.shape)
        }
        console.log('modelvalue', this.form)
      },
      immediate: true,
      deep: true
    }
  },
  data() {
    return {
      isLoading: false,
      form: { ...interfaceForm },
      val: { ...interfaceIsVal },

      suggestionsGroupName: []
    }
  },
  methods: {
    // ---------------- event
    closeModal() {
      this.onClear()
      this.$emit('closeModal', 'fetch')
    },
    onClear() {
      this.form = { ...interfaceForm }
    },
    validateForm() {
      let isValid = true
      if (!this.form.groupName) {
        this.val.isGroupName = true
        isValid = false
      }
      if (!this.form.shape) {
        this.val.isShape = true
        isValid = false
      }
      if (!this.form.grade) {
        this.val.isGrade = true
        isValid = false
      }
      return isValid
    },
    onSubmit() {
      console.log('onSubmit')
      if (this.validateForm()) {
        swAlert.confirmSubmit(
          `${this.form.code}`,
          `ยืนยันเเก้ไขวัถุดิบ`,
          async () => {
            //console.log('call submitPlan')
            await this.submit()
          },
          null,
          null
        )
      }
    },
    searchGroupName(event) {
      const query = event.query
      this.suggestionsGroupName = this.groupName.filter((el) =>
        el.value.toLowerCase().includes(query.toLowerCase())
      )
      console.log('searchGroupName', query, this.suggestionsGroupN)
    },

    // ---------------- APIs
    async submit() {
      try {
        this.isLoading = true

        console.log('this.form', this.form)
        const params = {
          code: this.form.code,
          groupName: this.form.groupName.value,
          size: this.form.size,
          shape: this.form.shape.code,
          grade: this.form.grade.description,
          gradeCode: this.form.grade.code,
          remark: this.form.remark
        }
        console.log('params', params)
        const res = await api.jewelry.post('ReceiptAndIssueStockGem/UpdateGem', params)
        if (res) {
          swAlert.success(
            ``,
            '',
            () => {
              //this.closeModal()
              this.$emit('closeModal', 'fetch')
            },
            null,
            null
          )
        }

        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
