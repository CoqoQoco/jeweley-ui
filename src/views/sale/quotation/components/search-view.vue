<template>
  <div>
    <form @submit.prevent="onSearchQuotation">
      <pageTitle
        title="เสนอราคา"
        description="ค้นหาเเละเลือกสินค้า ออกใบเสนอราคา"
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

    <form @submit.prevent="onSearchStock">
      <div class="filter-container mt-2">
        <div class="form-col-container">
          <div class="form-col-sm-container">
            <div>
              <span class="title-text">{{ $t('view.sale.quotation.newProductionNumber') }}</span>
              <InputTextGeneric
                v-model="form.stockNumber"
                :trim="true"
                placeholder="EX: DK-2502-00X"
              />
            </div>

            <div>
              <span class="title-text">{{ $t('view.sale.quotation.oldProductionNumber') }}</span>
              <InputTextGeneric
                v-model="form.stockNumberOrigin"
                :trim="true"
                placeholder="EX: AD054XX"
              />
            </div>

            <div>
              <span class="title-text">{{ $t('view.sale.quotation.productCode') }}</span>
              <InputTextGeneric
                v-model="form.productNumber"
                :trim="true"
                placeholder="EX: R08X50XXXL"
              />
            </div>
          </div>

          <div class="btn-submit-container-custom">
            <button class="btn btn-sm btn-main mr-2" type="submit" :title="$t('common.btn.search')">
              <span><i class="bi bi-search"></i></span>
            </button>
            <button
              class="btn btn-sm btn-dark mr-2"
              type="button"
              title="ค้นหาเพิ่มเติม"
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
    </form>
  </div>
</template>

<script>
import pageTitle from '@/components/custom/page-title-main.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

export default {
  name: 'SearchBar',

  components: {
    pageTitle,
    InputTextGeneric
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    quotation: {
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
    },
    quotation: {
      handler(val) {
        this.formQuotation = { ...val }
      },
      deep: true
    }
  },

  data() {
    return {
      form: { ...this.modelForm },
      formQuotation: { ...this.quotation }
    }
  },
  methods: {
    onSearchStock() {
      this.$emit('search', this.form)
    },
    onSearchQuotation() {
      this.$emit('searchQuotation', this.formQuotation)
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
