<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="500px" :isShowActionPart="true">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.master.goldSize.createTitle') }}</span>
      </template>

      <template #content>
        <form @submit.prevent="onSubmit" id="form-gold-size-create">
          <div class="p-3">
            <div class="form-row">
              <FormFieldGeneric :label="$t('common.field.code')" :required="true">
                <InputTextGeneric
                  v-model="form.code"
                  :placeholder="$t('view.master.goldSize.placeholder.code')"
                  :required="true"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row">
              <FormFieldGeneric :label="$t('view.master.goldSize.field.nameTh')" :required="true">
                <InputTextGeneric
                  v-model="form.nameTh"
                  :placeholder="$t('view.master.goldSize.placeholder.nameTh')"
                  :required="true"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row">
              <FormFieldGeneric :label="$t('view.master.goldSize.field.nameEn')" :required="true">
                <InputTextGeneric
                  v-model="form.nameEn"
                  :placeholder="$t('view.master.goldSize.placeholder.nameEn')"
                  :required="true"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row">
              <FormFieldGeneric :label="$t('view.master.goldSize.field.goldPercent')" :required="true">
                <InputTextGeneric
                  v-model.number="form.goldPercent"
                  type="number"
                  :placeholder="$t('view.master.goldSize.placeholder.goldPercent')"
                  :required="true"
                  :step="0.01"
                  :min="0"
                  :max="100"
                />
              </FormFieldGeneric>
            </div>
          </div>
        </form>
      </template>

      <template #action>
        <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" type="submit" form="form-gold-size-create" />
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
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const interfaceForm = {
  code: null,
  nameTh: null,
  nameEn: null,
  prefix: null,
  goldPercent: null
}

export default {
  components: { modal, InputTextGeneric, FormFieldGeneric, ButtonGeneric },

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
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
        this.$t('view.master.goldSize.confirm.create'),
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
        type: 'GOLD-SIZE',
        ...this.form
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
</style>
