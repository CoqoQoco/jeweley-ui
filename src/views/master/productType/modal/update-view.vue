<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="500px" :isShowActionPart="true" headerVariant="main">
      <template #title>
        <span class="title-text-lg d-block">{{ `${$t('view.master.productType.updateTitle')}: ${model.code}-${model.nameTh}` }}</span>
      </template>

      <template #content>
        <form @submit.prevent="onSubmit" id="form-product-type-update">
          <div class="p-3">
            <SectionCardGeneric class="modal-section">
              <div class="form-row">
                <FormFieldGeneric :label="$t('common.field.code')">
                  <InputTextGeneric
                    v-model="form.code"
                    :placeholder="$t('view.master.productType.placeholder.code')"
                    :disabled="true"
                  />
                </FormFieldGeneric>
              </div>

              <div class="form-row">
                <FormFieldGeneric :label="$t('view.master.productType.field.nameTh')" :required="true">
                  <InputTextGeneric
                    v-model="form.nameTh"
                    :placeholder="$t('view.master.productType.placeholder.nameTh')"
                    :required="true"
                  />
                </FormFieldGeneric>
              </div>

              <div class="form-row">
                <FormFieldGeneric :label="$t('view.master.productType.field.nameEn')" :required="true">
                  <InputTextGeneric
                    v-model="form.nameEn"
                    :placeholder="$t('view.master.productType.placeholder.nameEn')"
                    :required="true"
                  />
                </FormFieldGeneric>
              </div>

              <div class="form-row">
                <FormFieldGeneric :label="$t('view.master.productType.field.prefix')" :required="true">
                  <InputTextGeneric
                    v-model="form.prefix"
                    :placeholder="$t('view.master.productType.placeholder.prefix')"
                    :required="true"
                  />
                </FormFieldGeneric>
              </div>

              <div class="form-row">
                <FormFieldGeneric :label="$t('view.master.productType.field.prefix2')" :required="true">
                  <InputTextGeneric
                    v-model="form.prefix2"
                    :placeholder="$t('view.master.productType.placeholder.prefix2')"
                    :required="true"
                  />
                </FormFieldGeneric>
              </div>
            </SectionCardGeneric>
          </div>
        </form>
      </template>

      <template #action>
        <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" type="submit" form="form-product-type-update" />
        <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="closeModal" />
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const interfaceForm = {
  code: null,
  nameTh: null,
  nameEn: null,
  prefix: null,
  prefix2: null
}

export default {
  components: { modal, InputTextGeneric, FormFieldGeneric, ButtonGeneric, SectionCardGeneric },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    modelUpdate: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  computed: {
    model() {
      return this.modelUpdate
    }
  },

  watch: {
    modelUpdate: {
      handler(newVal) {
        if (newVal) {
          this.form = { ...newVal }
        } else {
          this.form = {}
        }
      },
      deep: true,
      immediate: true
    }
  },

  data() {
    return {
      form: { ...interfaceForm }
    }
  },

  methods: {
    closeModal() {
      this.onClear()
      this.$emit('closeModal')
    },
    onSubmit() {
      confirmThenSubmit(
        `${this.form.code} : ${this.form.nameTh}`,
        this.$t('view.master.productType.confirm.update'),
        async () => {
          await this.submit()
        }
      )
    },
    onClear() {
      this.form = { ...interfaceForm }
    },
    async submit() {
      const param = {
        type: 'PRODUCT-TYPE',
        ...this.form
      }
      const res = await this.masterStore.updateMaster({
        formValue: param,
        skipLoading: false
      })

      if (res) {
        this.onClear()
        this.$emit('fetch')
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

.modal-section {
  margin-bottom: var(--sp-lg);

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
