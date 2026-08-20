<template>
  <div>
    <div class="filter-container mt-2">
      <div class="form-col-container">
        <div class="form-col-sm-container">
          <div>
            <span class="title-text">{{ $t('view.sale.quotation.newProductionNumber') }}</span>
            <InputTextGeneric
              v-model="form.stockNumber"
              :trim="true"
              placeholder="EX: DK-2502-00X"
              @keyup.enter="onSearchStock"
            />
          </div>

          <div>
            <span class="title-text">{{ $t('view.sale.quotation.oldProductionNumber') }}</span>
            <InputTextGeneric
              v-model="form.stockNumberOrigin"
              :trim="true"
              placeholder="EX: AD054XX"
              @keyup.enter="onSearchStock"
            />
          </div>

          <div>
            <span class="title-text">{{ $t('view.sale.quotation.productCode') }}</span>
            <InputTextGeneric
              v-model="form.productNumber"
              :trim="true"
              placeholder="EX: R08X50XXXL"
              @keyup.enter="onSearchStock"
            />
          </div>
        </div>

        <div class="btn-submit-container-custom">
          <button class="btn btn-sm btn-main mr-2" type="button" @click="onSearchStock" :title="$t('common.btn.search')">
            <span><i class="bi bi-search"></i></span>
          </button>
          <button
            class="btn btn-sm btn-dark mr-2"
            type="button"
            :title="$t('common.btn.advancedSearch')"
            disabled
          >
            <span><i class="bi bi-zoom-in"></i></span>
          </button>
          <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" :title="$t('common.btn.clear')">
            <span><i class="bi bi-x-circle"></i></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

export default {
  name: 'ProductSearchBar',

  components: {
    InputTextGeneric
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
    onSearchStock() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';

.btn-submit-container-custom {
  display: flex;
  justify-content: flex-end;
  align-items: center ;
  margin-top: 20px;
}
</style>
