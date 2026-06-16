<template>
  <div class="filter-container-searchBar">
    <pageTitle :title="$t('view.mold.moldList.searchTitle')" description="" :isShowBtnClose="false" :isShowRightSlot="false">
      <template #rightSlot>
        <button class="btn btn-sm btn-main" @click="onCreate">{{ $t('view.mold.moldList.btnCreate') }}</button>
      </template>
    </pageTitle>
    <form @submit.prevent="onSubmit">
      <div class="form-col-container">
        <div>
          <span class="title-text">{{ $t('common.btn.search') }}</span>
          <input
            type="text"
            class="form-control"
            v-model="form.text"
            :placeholder="$t('view.mold.moldList.searchPlaceholder')"
          />
        </div>
        <div>
          <span class="title-text">{{ $t('view.mold.moldList.fieldLastUpdate') }}</span>
          <div class="flex-group">
            <CalendarGeneric
              class="w-100"
              v-model="form.updateStart"
              :max-date="form.updateEnd"
              :showIcon="true"
              :placeholder="$t('common.label.start')"
            />
            <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
            <CalendarGeneric
              class="w-100"
              v-model="form.updateEnd"
              :min-date="form.updateStart"
              :showIcon="true"
              :placeholder="$t('common.label.end')"
            />
          </div>
        </div>
        <div></div>
        <div></div>
      </div>
      <div class="btn-submit-container-between">
        <div></div>
        <div>
          <button class="btn btn-sm btn-main mr-2" type="submit">
            <span><i class="bi bi-search"></i></span>
          </button>
          <button class="btn btn-sm btn-dark" @click="onClear" type="button">
            <span><i class="bi bi-x-circle"></i></span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

export default {
  components: {
    pageTitle,
    CalendarGeneric
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    form() {
      return this.modelForm
    }
  },
  methods: {
    onSubmit() {
      this.$emit('search')
    },
    onClear() {
      this.$emit('clear')
    },
    onCreate() {
      this.$router.push({ name: 'design-create' })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
