<template>
  <div>
    <form @submit.prevent="onSearchQuotation">
      <pageTitle
        :title="$t('view.sale.quotation.title')"
        :description="$t('view.sale.quotation.pageDescription')"
        :isShowBtnClose="false"
        :isShowRightSlot="true"
      >
        <template #rightSlot>
          <div class="d-flex align-items-center">
            <div class="input-group input-group-inner">
              <input
                ref="inputText"
                id="inputText"
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="formQuotation.number"
                placeholder="Search Quotation"
              />
              <div class="input-group-append" @click="onSearchQuotation">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
              </div>
            </div>
          </div>
        </template>
      </pageTitle>
    </form>
  </div>
</template>

<script>
import pageTitle from '@/components/custom/page-title-main.vue'

export default {
  name: 'SearchBar',

  components: {
    pageTitle
  },

  props: {
    quotation: {
      type: Object,
      default: () => ({})
    }
  },

  watch: {
    quotation: {
      handler(val) {
        this.formQuotation = { ...val }
      },
      deep: true
    }
  },

  data() {
    return {
      formQuotation: { ...this.quotation }
    }
  },
  methods: {
    onSearchQuotation() {
      this.$emit('searchQuotation', this.formQuotation)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
