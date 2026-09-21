<template>
  <modal :showModal="isShow" @closeModal="onCancel" width="600px" :isShowActionPart="true">
    <template #title>
      <span class="title-text-lg">
        <i class="bi bi-pencil-square mr-2"></i>{{ $t('view.sale.invoiceDetail.editSaleTeamTitle') }}
      </span>
    </template>
    <template #content>
      <div class="form-content">
        <div class="form-col-container">
          <div>
            <span class="title-text">{{ $t('view.sale.invoice.salePersonLabel') }}</span>
            <AutoCompleteGeneric
              :modelValue="form.salePerson"
              :useStaticList="true"
              :staticOptions="saleUserOptions"
              optionLabel="name"
              :dropdown="true"
              :forceSelection="false"
              :placeholder="$t('view.sale.invoice.salePersonLabel')"
              @update:modelValue="onSalePersonInput"
              @item-select="onSalePersonSelect"
            />
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.invoice.saleSupportLabel') }}</span>
            <AutoCompleteGeneric
              :modelValue="form.saleSupport"
              :useStaticList="true"
              :staticOptions="saleUserOptions"
              optionLabel="name"
              :dropdown="true"
              :forceSelection="false"
              :placeholder="$t('view.sale.invoice.saleSupportLabel')"
              @update:modelValue="onSaleSupportInput"
              @item-select="onSaleSupportSelect"
            />
          </div>
        </div>

        <div class="sync-note mt-3">
          <i class="bi bi-info-circle mr-1"></i>
          {{ $t('view.sale.invoiceDetail.saleTeamSyncNote', { soNumber }) }}
        </div>
      </div>
    </template>
    <template #action>
      <ButtonGeneric
        variant="main"
        icon="bi-check-circle"
        :label="$t('common.btn.save')"
        :loading="isSaving"
        :disabled="isSaving"
        class="mr-2"
        @click="onSubmit"
      />
      <ButtonGeneric
        variant="outline"
        icon="bi-x-circle"
        :label="$t('common.btn.cancel')"
        :disabled="isSaving"
        @click="onCancel"
      />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { fetchSaleUserOptions } from '@/services/helper/sale-team-options.js'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'SaleTeamEditModal',

  components: {
    modal,
    AutoCompleteGeneric,
    ButtonGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    soNumber: {
      type: String,
      default: ''
    },
    salePerson: {
      type: String,
      default: null
    },
    saleSupport: {
      type: String,
      default: null
    }
  },

  emits: ['close', 'saved'],

  data() {
    return {
      saleOrderStore: usrSaleOrderApiStore(),
      saleUserOptions: [],
      isSaving: false,
      form: {
        salePerson: this.salePerson || null,
        saleSupport: this.saleSupport || null
      }
    }
  },

  watch: {
    isShow: {
      handler(val) {
        if (val) this.populateForm()
      },
      immediate: true
    }
  },

  mounted() {
    this.loadSaleUserOptions()
  },

  methods: {
    populateForm() {
      this.form = {
        salePerson: this.salePerson || null,
        saleSupport: this.saleSupport || null
      }
    },

    async loadSaleUserOptions() {
      this.saleUserOptions = await fetchSaleUserOptions()
    },

    // AutoCompleteGeneric เขียน object ลง v-model ตอนเลือกจากรายการ — ปล่อยผ่านตรงนี้ (typeof object)
    // แล้วให้ @item-select ด้านล่างเป็นคนตั้งค่าจริง ส่วน string/null คือ user พิมพ์/ลบเอง
    onSalePersonInput(value) {
      if (value && typeof value === 'object') return
      this.form.salePerson = value || null
    },

    onSalePersonSelect(event) {
      const option = event?.value
      if (!option) return
      this.form.salePerson = option.name
    },

    onSaleSupportInput(value) {
      if (value && typeof value === 'object') return
      this.form.saleSupport = value || null
    },

    onSaleSupportSelect(event) {
      const option = event?.value
      if (!option) return
      this.form.saleSupport = option.name
    },

    async onSubmit() {
      if (this.isSaving) return
      this.isSaving = true

      try {
        const salePerson = (this.form.salePerson || '').toString().trim() || null
        const saleSupport = (this.form.saleSupport || '').toString().trim() || null

        const res = await this.saleOrderStore.fetchUpdateSaleTeam({
          soNumber: this.soNumber,
          salePerson,
          saleSupport
        })

        this.$emit('saved', res)
      } finally {
        this.isSaving = false
      }
    },

    onCancel() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.title-text-lg {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--base-font-color);
  display: flex;
  align-items: center;
}

.sync-note {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  background: var(--color-highlight-bg);
  padding: var(--sp-sm) var(--sp-md);
  border-radius: var(--radius-sm);
}
</style>
