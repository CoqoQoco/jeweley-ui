<template>
  <modal :showModal="isShowModal" @closeModal="closeModal" width="450px">
    <template v-slot:content>
      <div class="title-text-lg-header mb-3">
        <i class="bi bi-tag mr-2"></i>
        <span>{{ $t('view.sale.document.editTag') }}</span>
      </div>

      <form @submit.prevent="onSubmit" class="p-2">
        <!-- ชื่อไฟล์ (read-only) -->
        <div class="mb-3">
          <span class="title-text">{{ $t('view.sale.document.fileName') }}</span>
          <div class="form-control bg-input" style="background-color: #f5f5f5; cursor: default">
            {{ data.fileName || '-' }}
          </div>
        </div>

        <!-- Tags -->
        <div class="mb-3">
          <span class="title-text">{{ $t('view.sale.document.tags') }}</span>
          <InputTextGeneric
            v-model="form.tags"
            :trim="true"
            :placeholder="$t('view.sale.document.placeholder.tagsExample')"
          />
        </div>

        <!-- หมายเหตุ -->
        <div class="mb-3">
          <span class="title-text">{{ $t('view.sale.document.remark') }}</span>
          <TextareaGeneric
            v-model="form.remark"
            :rows="2"
            :placeholder="$t('view.sale.document.placeholder.remarkOptional')"
          />
        </div>

        <div class="btn-submit-container">
          <ButtonGeneric variant="main" type="submit" icon="bi-save" :label="$t('common.btn.save')" />
          <ButtonGeneric variant="outline" type="button" :label="$t('common.btn.cancel')" class="ml-2" @click="closeModal" />
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { useSaleDocumentStore } from '@/stores/modules/api/sale/sale-document-store.js'
import { success } from '@/services/alert/sweetAlerts.js'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'SaleDocumentTagModal',

  components: { modal, InputTextGeneric, TextareaGeneric, ButtonGeneric },

  emits: ['close', 'saved'],

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },

  setup() {
    const store = useSaleDocumentStore()
    return { store }
  },

  data() {
    return {
      form: {
        tags: null,
        remark: null
      }
    }
  },

  watch: {
    data: {
      handler(val) {
        this.form.tags = val.tags || null
        this.form.remark = val.remark || null
      },
      immediate: true
    }
  },

  methods: {
    async onSubmit() {
      await this.store.updateTag({
        Id: this.data.id,
        Tags: this.form.tags,
        Remark: this.form.remark
      })
      success(this.$t('view.sale.document.success.saveTag'))
      this.$emit('saved')
      this.closeModal()
    },

    closeModal() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
