<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal">
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="title-text-lg">
            <span class="mr-2"><i class="bi bi-journal-text"></i></span>
            <span>{{ $t('view.receiptStock.gem.create.title') }}</span>
          </div>
          <div class="form-col-container p-2">
            <!-- code -->
            <div>
              <div>
                <span class="title-text">{{ $t('common.field.code') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <InputTextGeneric
                v-model="form.code"
                :required="true"
                :bgInput="!!form.code"
              />
            </div>

            <!-- group name -->
            <div>
              <div>
                <span class="title-text">{{ $t('view.receiptStock.gem.create.groupName') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <AutoCompleteGeneric
                :modelValue="form.groupName"
                :suggestions="suggestionsGroupName"
                optionLabel="value"
                @complete="searchGroupName"
                :forceSelection="false"
                :class="val.isGroupName ? 'p-invalid' : ''"
                @update:modelValue="form.groupName = $event"
              />
            </div>

            <div></div>
          </div>
          <div class="form-col-container p-2">
            <!-- size -->
            <div>
              <div>
                <span class="title-text">{{ $t('view.receiptStock.gem.create.size') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <InputTextGeneric v-model="form.size" :required="true" />
            </div>

            <!-- shape -->
            <div>
              <div>
                <span class="title-text">{{ $t('view.receiptStock.gem.create.shape') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <DropdownGeneric
                :modelValue="form.shape"
                :options="gemShape"
                optionLabel="description"
                :showClear="form.shape ? true : false"
                :class="val.isShape === true ? `p-invalid` : ``"
                @update:modelValue="form.shape = $event"
              />
            </div>

            <!-- grade -->
            <div>
              <div>
                <span class="title-text">{{ $t('view.receiptStock.gem.create.grade') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <DropdownGeneric
                :modelValue="form.grade"
                :options="grade"
                optionLabel="description"
                :showClear="form.grade ? true : false"
                :class="val.isGrade === true ? `p-invalid` : ``"
                @update:modelValue="form.grade = $event"
              />
            </div>
          </div>
          <div class="form-col-container p-2">
            <!-- remark -->
            <div>
              <div>
                <span class="title-text">{{ $t('view.receiptStock.gem.create.description') }}</span>
              </div>
              <TextareaGeneric v-model="form.remark" :rows="3" />
            </div>
          </div>
          <!-- btn -->
          <div class="d-flex justify-content-end mt-2">
            <button class="btn btn-sm btn-main" type="submit">
              <span class="mr-2"><i class="bi bi-gem"></i></span>
              <span>{{ $t('view.receiptStock.gem.create.btnCreate') }}</span>
            </button>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { success, confirmSubmit } from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-helper.js'

import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceForm = {
  code: null,
  groupName: null,
  size: null,
  shape: null,
  grade: null,
  remark: null
}
const interfaceIsVal = {
  isGroupName: false,
  isShape: false,
  isGrade: false
}

export default {
  components: {
    modal,
    AutoCompleteGeneric,
    DropdownGeneric,
    InputTextGeneric,
    TextareaGeneric
  },
  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    },
    modelGroupName: {
      type: Array,
      required: true,
      default: () => []
    },
    masterGemShape: {
      type: Array,
      required: true,
      default: () => []
    },
    masterGrade: {
      type: Array,
      required: true,
      default: () => []
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
      return this.masterGrade
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
    }
  },
  data() {
    return {
      form: { ...interfaceForm },
      val: { ...interfaceIsVal },
      suggestionsGroupName: []
    }
  },
  methods: {
    closeModal() {
      this.onClear()
      this.$emit('closeModal', 'create')
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
      if (this.validateForm()) {
        confirmSubmit(
          `${this.form.code}`,
          this.$t('view.receiptStock.gem.create.confirmTitle'),
          async () => {
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
    },

    async submit() {
      const params = {
        code: this.form.code,
        groupName: this.form.groupName?.value ?? this.form.groupName,
        size: this.form.size,
        shape: this.form.shape.code,
        grade: this.form.grade.description,
        gradeCode: this.form.grade.code,
        remark: this.form.remark
      }
      const res = await api.jewelry.post('ReceiptAndIssueStockGem/CreateGem', params)
      if (res) {
        success('', '', () => {
          this.closeModal()
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
