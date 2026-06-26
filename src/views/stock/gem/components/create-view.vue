<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" :isShowActionPart="true" headerVariant="main">
      <template #title>
        <span class="title-text-lg d-block">{{ $t('view.stock.gem.createTitle') }}</span>
      </template>
      <template #content>
        <form @submit.prevent="onSubmit" id="gem-create-form">
          <div class="p-3">
            <SectionCardGeneric class="modal-section">
              <div class="form-row two-col">
                <FormFieldGeneric :label="$t('view.stock.gem.code')" :required="true">
                  <InputTextGeneric v-model="form.code" :required="true" />
                </FormFieldGeneric>
                <FormFieldGeneric :label="$t('view.stock.gem.groupName')" :required="true">
                  <AutoCompleteGeneric
                    v-model="form.groupName"
                    :suggestions="suggestionsGroupName"
                    optionLabel="value"
                    optionValue="value"
                    @complete="searchGroupName"
                    :invalid="val.isGroupName"
                  />
                </FormFieldGeneric>
              </div>
              <div class="form-row two-col">
                <FormFieldGeneric :label="$t('view.stock.gem.origin')">
                  <InputTextGeneric v-model="form.region" />
                </FormFieldGeneric>
                <FormFieldGeneric :label="$t('view.stock.gem.size')" :required="true">
                  <InputTextGeneric v-model="form.size" :required="true" />
                </FormFieldGeneric>
              </div>
              <div class="form-row two-col">
                <FormFieldGeneric :label="$t('view.stock.gem.shape')" :required="true">
                  <DropdownGeneric
                    v-model="form.shape"
                    :options="gemShape"
                    optionLabel="description"
                    class="w-full md:w-14rem"
                    :showClear="form.shape ? true : false"
                    :class="val.isShape === true ? `p-invalid` : ``"
                  />
                </FormFieldGeneric>
                <FormFieldGeneric :label="$t('view.stock.gem.grade')" :required="true">
                  <DropdownGeneric
                    v-model="form.grade"
                    :options="grade"
                    optionLabel="description"
                    class="w-full md:w-14rem"
                    :showClear="form.grade ? true : false"
                    :class="val.isGrade === true ? `p-invalid` : ``"
                  />
                </FormFieldGeneric>
              </div>
              <div class="form-row">
                <FormFieldGeneric :label="$t('view.stock.gem.description')" :required="true">
                  <TextareaGeneric v-model="form.remark" :rows="3" :required="true" />
                </FormFieldGeneric>
              </div>
            </SectionCardGeneric>
          </div>
        </form>
      </template>
      <template #action>
        <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" type="submit" form="gem-create-form" />
        <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="closeModal" />
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-helper.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceForm = {
  code: null,
  groupName: null,
  size: null,
  shape: null,
  region: null
}
const interfaceIsVal = {
  isGroupName: false,
  isShape: false,
  isGrade: false
}

export default {
  components: {
    modal,
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    ButtonGeneric,
    SectionCardGeneric,
    AutoCompleteGeneric,
    DropdownGeneric
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
    // ---------------- event
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
        confirmThenSubmit(
          `${this.form.code}`,
          this.$t('view.stock.gem.confirmCreate'),
          async () => {
            await this.submit()
          }
        )
      }
    },
    searchGroupName(event) {
      const query = event.query
      this.suggestionsGroupName = this.groupName.filter((el) =>
        el.value.toLowerCase().includes(query.toLowerCase())
      )
    },

    // ---------------- APIs
    async submit() {
      const params = {
        code: this.form.code,
        groupName: this.form.groupName.value ? this.form.groupName.value : this.form.groupName,
        size: this.form.size,
        shape: this.form.shape.code,
        grade: this.form.grade.description,
        gradeCode: this.form.grade.code,
        remark: this.form.remark,
        region: this.form.region
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
@import '@/assets/scss/responsive-style/web';

.form-row {
  margin-bottom: var(--sp-lg);

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--sp-lg);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
}

.modal-section {
  margin-bottom: var(--sp-lg);

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
