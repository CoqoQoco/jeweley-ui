<template>
  <modal
    :showModal="isShow"
    @closeModal="$emit('closeModal')"
    width="480px"
    :isShowActionPart="true"
    headerVariant="main"
  >
    <template #title>
      <span class="title-text-lg d-block">{{ $t('view.ticket.statusModal.title') }}</span>
    </template>

    <template #content>
      <div class="p-3">
        <div class="mb-3">
          <span class="title-text">{{ $t('view.ticket.field.ticketNo') }}</span>
          <div class="ticket-no-display">{{ ticket.ticketNo }} — {{ ticket.title }}</div>
        </div>

        <FormFieldGeneric :label="$t('view.ticket.field.status')">
          <DropdownGeneric
            :modelValue="selectedStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            @update:modelValue="selectedStatus = $event"
          />
        </FormFieldGeneric>
      </div>
    </template>

    <template #action>
      <ButtonGeneric
        variant="main"
        icon="bi-save"
        :label="$t('common.btn.save')"
        @click="onSave"
      />
      <ButtonGeneric
        variant="outline"
        :label="$t('common.btn.cancel')"
        class="ml-2"
        @click="$emit('closeModal')"
      />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { useTicketStore } from '@/stores/modules/api/ticket-store.js'
import { warning, success } from '@/services/alert/sweetAlerts.js'

import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'StatusChangeModal',

  components: {
    modal,
    FormFieldGeneric,
    ButtonGeneric,
    DropdownGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    ticket: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['closeModal', 'saved'],

  setup() {
    const ticketStore = useTicketStore()
    return { ticketStore }
  },

  data() {
    return {
      selectedStatus: null
    }
  },

  computed: {
    statusOptions() {
      return [
        { value: 1, label: this.$t('view.ticket.status.open') },
        { value: 2, label: this.$t('view.ticket.status.inProgress') },
        { value: 3, label: this.$t('view.ticket.status.resolved') },
        { value: 4, label: this.$t('view.ticket.status.closed') },
        { value: 5, label: this.$t('view.ticket.status.cancelled') }
      ]
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.selectedStatus = this.ticket.statusId || null
      }
    }
  },

  methods: {
    async onSave() {
      if (!this.selectedStatus) {
        warning(this.$t('view.ticket.statusModal.required'))
        return
      }
      if (this.selectedStatus === this.ticket.statusId) {
        this.$emit('closeModal')
        return
      }
      const res = await this.ticketStore.updateStatus(this.ticket.id, this.selectedStatus)
      if (res) {
        success(null)
        this.$emit('saved')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.ticket-no-display {
  font-weight: 600;
  color: var(--base-font-color);
  margin-top: var(--sp-xs);
}
</style>
