<template>
  <div class="app-container-modal">
    <modal :showModal="isShow" @closeModal="closeModal" width="500px" :isShowActionPart="true">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.master.gem.createTitle') }}</span>
      </template>

      <template #content>
        <form @submit.prevent="onSubmit" id="form-gem-create">
          <div class="p-3">
            <div class="form-row">
              <FormFieldGeneric :label="$t('common.field.code')" :required="true">
                <InputTextGeneric
                  v-model="form.code"
                  :placeholder="$t('view.master.gem.placeholder.code')"
                  :required="true"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row">
              <FormFieldGeneric :label="$t('view.master.gem.field.nameTh')" :required="true">
                <InputTextGeneric
                  v-model="form.nameTh"
                  :placeholder="$t('view.master.gem.placeholder.nameTh')"
                  :required="true"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row">
              <FormFieldGeneric :label="$t('view.master.gem.field.nameEn')" :required="true">
                <InputTextGeneric
                  v-model="form.nameEn"
                  :placeholder="$t('view.master.gem.placeholder.nameEn')"
                  :required="true"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row">
              <FormFieldGeneric :label="$t('view.master.gem.field.color')">
                <InputTextGeneric
                  v-model="form.color"
                  :placeholder="$t('view.master.gem.placeholder.color')"
                />
              </FormFieldGeneric>
            </div>
          </div>
        </form>
      </template>

      <template #action>
        <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" type="submit" form="form-gem-create" />
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
import { success } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const interfaceForm = {
  code: null,
  nameTh: null,
  nameEn: null,
  color: null,
  prefix: null
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
        this.$t('view.master.gem.confirm.create'),
        async () => {
          await this.submit()
        }
      )
    },
    async submit() {
      const param = {
        type: 'GEM',
        code: this.form.code,
        nameTh: this.form.nameTh,
        nameEn: this.form.nameEn,
        color: this.form.color
      }

      const res = await this.masterStore.createListMaster({
        form: param
      })

      if (res) {
        success(``, ``, async () => {
          this.onClear()
          this.$emit('closeModal', 'fetch')
        })
      }
    },
    onClear() {
      this.form = { ...interfaceForm }
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
