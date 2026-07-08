<template>
  <SearchBarGeneric
    :title="$t('view.sale.billingNote.searchTitle')"
    :description="$t('view.sale.billingNote.pageDescription')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #header-actions>
      <ButtonGeneric
        variant="green"
        icon="bi-plus-circle"
        :label="$t('view.sale.billingNote.createBtn')"
        @click="onCreate"
      />
    </template>

    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.sale.billingNote.running') }}</span>
        <InputTextGeneric
          v-model.trim="form.running"
          :placeholder="$t('view.sale.billingNote.placeholder.running')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.billingNote.customerName') }}</span>
        <InputTextGeneric
          v-model.trim="form.customerName"
          :placeholder="$t('view.sale.billingNote.placeholder.customerName')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.billingNote.documentDate') }}</span>
        <div class="flex-group">
          <CalendarGeneric
            class="w-100"
            v-model="form.documentDateFrom"
            :max-date="form.documentDateTo"
            :showIcon="true"
            :manualInput="false"
            :placeholder="$t('common.label.startDate')"
            dateFormat="dd/mm/yy"
          />
          <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
          <CalendarGeneric
            class="w-100"
            v-model="form.documentDateTo"
            :min-date="form.documentDateFrom"
            :showIcon="true"
            :manualInput="false"
            :placeholder="$t('common.label.endDate')"
            dateFormat="dd/mm/yy"
          />
        </div>
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
    </template>
  </SearchBarGeneric>
</template>

<script>
import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'

export default {
  name: 'BillingNoteListSearchView',

  components: {
    SearchBarGeneric,
    InputTextGeneric,
    ButtonGeneric,
    CalendarGeneric
  },

  emits: ['search', 'clear', 'create', 'update:modelForm'],

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },

  data() {
    return {
      form: { ...this.modelForm }
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },

    onClear() {
      this.$emit('clear')
    },

    onCreate() {
      this.$emit('create')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
