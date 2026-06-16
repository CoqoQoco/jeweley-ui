<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle
            title="จัดการเเละเเก้ไขบัญชีผู้ใช้งาน"
            description="ค้นหาข้อมูลผู้ใช้งาน ปรับปรุงหรืออนุมัติการใช้งาน"
            :isShowBtnClose="false"
          >
          </pageTitle>
        </div>

        <div class="form-col-container">
          <div>
            <span class="title-text">บัญชี</span>
            <input
              ref="inputAccountName"
              id="inputAccountName"
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="form.username"
            />
          </div>
        </div>

        <!-- <dialogView
          :isShow="isShow.dialog"
          @closeDialog="closeDialog"
          @search="dialogSearch"
          txtHeader="ค้นหาเพิ่มเติม"
        >
          <template #content>
            <div class="form-col-container"></div>
          </template>
        </dialogView> -->

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <button class="btn btn-sm btn-main mr-2" type="submit" :title="$t('common.btn.search')">
              <span><i class="bi bi-search"></i></span>
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
import { defineAsyncComponent } from 'vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

export default {
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
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
