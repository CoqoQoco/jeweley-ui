<template>
  <div class="app-container">
    <PageHeaderGeneric :title="$t('view.ticket.createTitle')">
      <template #actions>
        <ButtonGeneric
          variant="outline"
          icon="bi-journal-text"
          :label="$t('view.ticket.manual.btnLabel')"
          @click="isShowManual = true"
        />
      </template>
    </PageHeaderGeneric>

    <!-- Segment switch tabs -->
    <div class="tab-switch">
      <ButtonGeneric
        :variant="activeTab === 'report' ? 'main' : 'outline'"
        icon="bi-pencil-square"
        :label="$t('view.ticket.tab.report')"
        @click="activeTab = 'report'"
      />
      <ButtonGeneric
        :variant="activeTab === 'my' ? 'main' : 'outline'"
        icon="bi-ticket-detailed"
        class="ml-2"
        @click="activeTab = 'my'"
      >
        {{ $t('view.ticket.tab.my') }}
        <span v-if="myUnreadCount > 0" class="tab-badge">{{ myUnreadCount }}</span>
      </ButtonGeneric>
    </div>

    <!-- Tab: แจ้งใหม่ (report) -->
    <div v-show="activeTab === 'report'">
      <!-- Box 1: รายละเอียดปัญหา -->
      <SectionCardGeneric :title="$t('view.ticket.section.detail')">
        <div class="form-row three-col">
          <FormFieldGeneric :label="$t('view.ticket.field.type')" :required="true">
            <DropdownGeneric
              :modelValue="form.type"
              :options="typeOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('view.ticket.placeholder.type')"
              @update:modelValue="form.type = $event"
            />
          </FormFieldGeneric>

          <FormFieldGeneric :label="$t('view.ticket.field.topic')" :required="true">
            <DropdownGeneric
              :modelValue="form.topicRoute"
              :options="topicOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('view.ticket.placeholder.topic')"
              :filter="true"
              @update:modelValue="onTopicChange($event)"
            />
          </FormFieldGeneric>

          <FormFieldGeneric :label="$t('view.ticket.field.title')" :required="true">
            <InputTextGeneric
              v-model="form.title"
              :placeholder="$t('view.ticket.placeholder.title')"
              :maxlength="500"
            />
          </FormFieldGeneric>
        </div>

        <FormFieldGeneric :label="$t('view.ticket.field.description')" :required="true" class="mt-field">
          <TextareaGeneric
            v-model="form.description"
            :rows="5"
            :placeholder="$t('view.ticket.placeholder.description')"
          />
        </FormFieldGeneric>
      </SectionCardGeneric>

      <!-- Box 2: รูปภาพ / Screenshot -->
      <SectionCardGeneric :title="$t('view.ticket.section.images')" class="box-gap">
        <p class="section-hint">{{ $t('view.ticket.label.maxImages', { max: 5 }) }}</p>
        <MultiImageUpload
          :modelValue="form.images"
          :max="5"
          accept="image/*"
          :maxSizeMB="5"
          @update:modelValue="form.images = $event"
        />
      </SectionCardGeneric>

      <!-- Footer: outside boxes, right-aligned -->
      <div class="form-footer">
        <ButtonGeneric
          variant="outline"
          :label="$t('common.btn.cancel')"
          @click="onCancel"
        />
        <ButtonGeneric
          variant="main"
          icon="bi-send"
          :label="$t('view.ticket.btn.submit')"
          class="ml-2"
          @click="onSubmit"
        />
      </div>
    </div>

    <!-- Tab: Ticket ของฉัน (my) -->
    <TicketMyView v-if="activeTab === 'my'" />
  </div>

  <manualView :isShow="isShowManual" @closeModal="isShowManual = false" />
</template>

<script>
import { useTicketStore } from '@/stores/modules/api/ticket-store.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import { useMenuTopics } from '@/composables/useMenuTopics.js'

import manualView from './modal/manual-view.vue'
import TicketMyView from '@/views/ticket/my-ticket-view.vue'
import MultiImageUpload from '@/components/prime-vue/MultiImageUpload.vue'
import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const initForm = () => ({
  type: null,
  topicRoute: null,
  topicName: null,
  title: '',
  description: '',
  images: []
})

export default {
  name: 'TicketCreateView',

  components: {
    manualView,
    TicketMyView,
    MultiImageUpload,
    PageHeaderGeneric,
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    ButtonGeneric,
    DropdownGeneric
  },

  setup() {
    const ticketStore = useTicketStore()
    const { getMenuTopics } = useMenuTopics()
    return { ticketStore, getMenuTopics }
  },

  data() {
    return {
      activeTab: 'report',
      form: initForm(),
      topicOptions: [],
      isShowManual: false
    }
  },

  computed: {
    myUnreadCount() {
      return this.ticketStore.myUnreadCount
    },

    typeOptions() {
      return [
        { value: 1, label: this.$t('view.ticket.type.bug') },
        { value: 2, label: this.$t('view.ticket.type.feature') }
      ]
    }
  },

  mounted() {
    this.topicOptions = this.getMenuTopics()
    this.ticketStore.fetchMyUnreadCount()
  },

  methods: {
    onTopicChange(routeName) {
      this.form.topicRoute = routeName
      const found = this.topicOptions.find((t) => t.value === routeName)
      this.form.topicName = found ? found.label : routeName
    },

    onCancel() {
      this.form = initForm()
    },

    validate() {
      if (!this.form.type) {
        warning(this.$t('view.ticket.warning.typeRequired'), this.$t('view.ticket.warning.requiredFields'))
        return false
      }
      if (!this.form.topicRoute) {
        warning(this.$t('view.ticket.warning.topicRequired'), this.$t('view.ticket.warning.requiredFields'))
        return false
      }
      if (!this.form.title?.trim()) {
        warning(this.$t('view.ticket.warning.titleRequired'), this.$t('view.ticket.warning.requiredFields'))
        return false
      }
      if (!this.form.description?.trim()) {
        warning(this.$t('view.ticket.warning.descriptionRequired'), this.$t('view.ticket.warning.requiredFields'))
        return false
      }
      return true
    },

    onSubmit() {
      if (!this.validate()) return

      confirmThenSubmit(
        this.form.title,
        this.$t('view.ticket.confirm.submit'),
        async () => {
          const formData = new FormData()
          formData.append('type', this.form.type)
          formData.append('topicRoute', this.form.topicRoute)
          formData.append('topicName', this.form.topicName || '')
          formData.append('title', this.form.title)
          formData.append('description', this.form.description)
          this.form.images.forEach((file) => {
            formData.append('images', file)
          })

          const res = await this.ticketStore.createTicket(formData)
          if (res) {
            success(this.$t('view.ticket.success.submit'))
            this.form = initForm()
          }
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.tab-switch {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: var(--sp-lg);
}

.form-row {
  &.three-col {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--sp-lg);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
}

.mt-field {
  margin-top: var(--sp-lg);
}

.box-gap {
  margin-top: var(--sp-lg);
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: var(--sp-lg);
}

.section-hint {
  font-size: var(--fs-sm);
  color: #666;
  margin-top: calc(var(--sp-xs) * -1);
  margin-bottom: var(--sp-md);
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 var(--sp-xs);
  border-radius: var(--radius-lg);
  background: var(--base-red);
  color: #fff;
  font-size: var(--fs-sm);
  font-weight: 700;
  line-height: 1;
}
</style>
