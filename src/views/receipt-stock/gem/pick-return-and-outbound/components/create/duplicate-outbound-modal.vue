<template>
  <modal :showModal="isShow" width="720px" headerVariant="main" :isShowActionPart="true" @closeModal="$emit('back')">
    <template #title>
      <span class="title-text-lg d-block">
        {{ $t('view.receiptStock.gem.pickReturnAndOutbound.dup.confirmTitle') }}
      </span>
    </template>

    <template #content>
      <p>{{ $t('view.receiptStock.gem.pickReturnAndOutbound.dup.confirmDesc') }}</p>
      <BaseDataTable :items="rows" :columns="columns" dataKey="key" :paginator="false" scrollHeight="40vh">
        <template #planTemplate="{ data }">{{ data.plan }}</template>
        <template #previousTemplate="{ data }">
          <div v-for="p in data.previous" :key="p.running">
            {{ p.running }} · {{ fmt3(p.qty) }} / {{ fmt3(p.weight) }}
          </div>
        </template>
        <template #nowTemplate="{ data }">{{ fmt3(data.nowQty) }} / {{ fmt3(data.nowWeight) }}</template>
      </BaseDataTable>
      <div class="mt-3">
        <CheckboxGeneric
          v-model="intentional"
          :label="$t('view.receiptStock.gem.pickReturnAndOutbound.dup.intentional')"
        />
      </div>
    </template>

    <template #action>
      <ButtonGeneric
        variant="main"
        :label="$t('view.receiptStock.gem.pickReturnAndOutbound.dup.confirm')"
        :disabled="!intentional"
        @click="$emit('confirm')"
      />
      <ButtonGeneric
        variant="outline"
        class="ml-2"
        :label="$t('view.receiptStock.gem.pickReturnAndOutbound.dup.back')"
        @click="$emit('back')"
      />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'DuplicateOutboundModal',

  components: { modal, ButtonGeneric, CheckboxGeneric, BaseDataTable },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    rows: {
      type: Array,
      default: () => []
    }
  },

  emits: ['confirm', 'back'],

  data() {
    return { intentional: false }
  },

  computed: {
    columns() {
      const t = (k) => this.$t(`view.receiptStock.gem.pickReturnAndOutbound.dup.${k}`)
      return [
        { field: 'plan', header: t('colPlan'), width: '140px', sortable: false },
        { field: 'code', header: t('colGem'), minWidth: '140px', sortable: false },
        { field: 'previous', header: t('colPrev'), minWidth: '220px', sortable: false },
        { field: 'now', header: t('colNow'), width: '140px', sortable: false }
      ]
    }
  },

  watch: {
    isShow(val) {
      if (val) this.intentional = false
    }
  },

  methods: {
    fmt3(val) {
      return Number(val || 0).toFixed(3)
    }
  }
}
</script>
