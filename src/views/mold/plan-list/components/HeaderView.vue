<template>
  <div class="filter-container-search">
    <pageTitle
      :title="$t('view.mold.planList.searchTitle')"
      description=""
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <button class="btn btn-sm btn-main" @click="onCreate">
          {{ $t('view.mold.planList.btnCreate') }}
        </button>
      </template>
    </pageTitle>
    <form @submit.prevent="onSubmit">
      <div class="form-col-container">
        <div>
          <span class="title-text">{{ $t('view.mold.planList.fieldMoldCode') }}</span>
          <input type="text" class="form-control" v-model="form.moldCode" />
        </div>
        <div>
          <span class="title-text">{{ $t('view.mold.planList.fieldCreateDate') }}</span>
          <div class="flex-group">
            <CalendarGeneric
              class="w-100"
              v-model="form.startCreate"
              :max-date="form.endCreate"
              :showIcon="true"
              :placeholder="$t('common.label.start')"
            />
            <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
            <CalendarGeneric
              class="w-100"
              v-model="form.endCreate"
              :min-date="form.startCreate"
              :showIcon="true"
              :placeholder="$t('common.label.end')"
            />
          </div>
        </div>
        <div>
          <span class="title-text">{{ $t('view.mold.planList.fieldLastUpdate') }}</span>
          <div class="flex-group">
            <CalendarGeneric
              class="w-100"
              v-model="form.startUpdate"
              :max-date="form.endUpdate"
              :showIcon="true"
              :placeholder="$t('common.label.start')"
            />
            <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
            <CalendarGeneric
              class="w-100"
              v-model="form.endUpdate"
              :min-date="form.startUpdate"
              :showIcon="true"
              :placeholder="$t('common.label.end')"
            />
          </div>
        </div>
        <div></div>
      </div>
      <div class="btn-submit-container-between">
        <div></div>
        <div>
          <button class="btn btn-sm btn-main mr-2" type="submit">
            <span><i class="bi bi-search mr-2"></i></span>
            <span>{{ $t('common.btn.search') }}</span>
          </button>
          <button class="btn btn-sm btn-dark" type="button" @click="onClear">
            <span><i class="bi bi-x-circle mr-2"></i></span>
            <span>{{ $t('common.btn.clear') }}</span>
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
    onSubmit() {
      this.$emit('search', this.form)
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
