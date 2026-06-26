<template>
  <div class="filter-container-searchBar">
    <pageTitle
      :title="$t('view.production.planTrackingGold.searchTitle')"
      description=""
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <button class="btn btn-sm btn-main" @click="onCreate">
          <span class="bi bi-pencil"></span>
        </button>
      </template>
    </pageTitle>
    <form @submit.prevent="onSubmit">
      <div class="form-col-container">
        <div>
          <span class="title-text">{{ $t('view.production.planTrackingGold.createDate') }}</span>
          <div class="flex-group">
            <CalendarGeneric
              class="w-100"
              v-model="form.createStart"
              :max-date="form.createEnd"
              :manualInput="false"
              showIcon
              :placeholder="$t('common.label.start')"
            />
            <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
            <CalendarGeneric
              class="w-100"
              v-model="form.createEnd"
              :min-date="form.createStart"
              :manualInput="false"
              showIcon
              :placeholder="$t('common.label.end')"
            />
          </div>
        </div>
        <div class="form-col-container">
          <div>
            <span class="title-text">{{ $t('view.production.planTrackingGold.bookNo') }}</span>
            <InputTextGeneric v-model="form.bookNo" />
          </div>
          <div>
            <span class="title-text">{{ $t('view.production.planTrackingGold.no') }}</span>
            <InputTextGeneric v-model="form.no" />
          </div>
        </div>
      </div>

      <dialogView
        :isShow="isShow.dialog"
        @closeDialog="closeDialog"
        @search="dialogSearch"
        :txtHeader="$t('view.production.planTrackingGold.moreSearch')"
      >
        <template #content>
          <div class="form-col-container">
            <div>
              <span class="title-text">{{ $t('view.production.planTrackingGold.searchText') }}</span>
              <InputTextGeneric
                id="inputStockID"
                v-model="form.text"
                :placeholder="$t('view.production.planTrackingGold.searchText')"
                icon="bi-upc-scan"
              />
            </div>
            <div>
              <span class="title-text">{{ $t('view.production.planTrackingGold.runningNumber') }}</span>
              <InputTextGeneric v-model="form.runningNumber" />
            </div>
          </div>
        </template>
      </dialogView>

      <div class="btn-submit-container">
        <button class="btn btn-sm btn-main mr-2" type="submit">
          <span><i class="bi bi-search"></i></span>
        </button>
        <button
          class="btn btn-sm btn-sub-main mr-2"
          type="button"
          :title="$t('view.production.planTrackingGold.more')"
          @click="onShowDialog"
        >
          <span><i class="bi bi-zoom-in"></i></span>
        </button>
        <button class="btn btn-sm btn-dark" type="button" @click="onClear">
          <span><i class="bi bi-x-circle"></i></span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

// Local
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))
const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

const interfaceIsShow = {
  dialog: false
}

export default {
  components: {
    pageTitle,
    CalendarGeneric,
    InputTextGeneric,
    dialogView
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
      isShow: { ...interfaceIsShow },
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
      this.$router.push('/plan-gold-order')
    },
    dialogSearch() {
      this.isShow.dialog = false
      this.$emit('search', this.form)
    },
    onShowDialog() {
      this.isShow.dialog = true
    },
    closeDialog() {
      this.isShow.dialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
