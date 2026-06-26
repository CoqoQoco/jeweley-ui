<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="500px" :isShowActionPart="true" headerVariant="main">
      <template #title>
        <span class="title-text-lg d-block">{{ `${$t('view.master.gemShape.updateTitle')}: ${model.code}-${model.nameTh}` }}</span>
      </template>

      <template #content>
        <form @submit.prevent="onSubmit" id="form-gem-shape-update">
          <div class="p-3">
            <SectionCardGeneric class="modal-section">
              <div class="form-row">
                <FormFieldGeneric :label="$t('common.field.code')">
                  <InputTextGeneric
                    v-model="form.code"
                    :placeholder="$t('view.master.gemShape.placeholder.code')"
                    :disabled="true"
                  />
                </FormFieldGeneric>
              </div>

              <div class="form-row">
                <FormFieldGeneric :label="$t('view.master.gemShape.field.nameTh')" :required="true">
                  <InputTextGeneric
                    v-model="form.nameTh"
                    :placeholder="$t('view.master.gemShape.placeholder.nameTh')"
                    :required="true"
                  />
                </FormFieldGeneric>
              </div>

              <div class="form-row">
                <FormFieldGeneric :label="$t('view.master.gemShape.field.nameEn')" :required="true">
                  <InputTextGeneric
                    v-model="form.nameEn"
                    :placeholder="$t('view.master.gemShape.placeholder.nameEn')"
                    :required="true"
                  />
                </FormFieldGeneric>
              </div>
            </SectionCardGeneric>
          </div>
        </form>
      </template>

      <template #action>
        <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" type="submit" form="form-gem-shape-update" />
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
  prefix: null
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
        this.$t('view.master.gemShape.confirm.update'),
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
        type: 'GEM-SHAPE',
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
