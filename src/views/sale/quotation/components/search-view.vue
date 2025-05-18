<template>
  <div>
    <form @submit.prevent="onSearch">
      <pageTitle
        title="เสนอราคา"
        description="ค้นหาเเละเลือกสินค้า ออกใบเสนอราคา"
        :isShowBtnClose="false"
      >
      </pageTitle>

      <div class="filter-container mt-2">
        <div class="form-col-container">
          <div class="form-col-container">
            <!-- stock number -->
            <div>
              <span class="title-text">เลขที่ผลิต</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.stockNumber"
                placeholder="EX: DK-2502-00X"
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.btn-submit-container-custom {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
}
</style>
