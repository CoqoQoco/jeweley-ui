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
            <!-- stock number -->
            <div>
              <span class="title-text">เลขที่ผลิต (ใหม่)</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.stockNumber"
                placeholder="EX: DK-2502-00X"
              />
            </div>

             <div>
              <span class="title-text">เลขที่ผลิต (เก่า)</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.stockNumberOrigin"
                placeholder="EX: AD054XX"
              />
            </div>

            <!-- product number -->
            <div>
              <span class="title-text">รหัสสินค้า</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.productNumber"
                placeholder="EX: R08X50XXXL"
              />
            </div>
          </div>

          <div class="btn-submit-container-custom">
            <button class="btn btn-sm btn-main mr-2" type="submit" title="ค้นหา">
              <span><i class="bi bi-search"></i></span>
              <!-- <span>ค้นหา</span> -->
            </button>
            <button
              class="btn btn-sm btn-secondary mr-2"
              type="button"
              title="ค้นหาเพิ่มเติม"
              disabled
            >
              <span><i class="bi bi-zoom-in"></i></span>
            </button>
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" title="ล้าง">
              <span><i class="bi bi-x-circle"></i></span>
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import pageTitle from '@/components/custom/PageTitleMain.vue'

export default {
  name: 'SearchBar',

  components: {
    pageTitle
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
