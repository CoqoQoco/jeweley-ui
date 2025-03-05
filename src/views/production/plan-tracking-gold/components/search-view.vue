<template>
  <div class="filter-container-searchBar">
    <pageTitle
      title="ค้นหาใบเบิกผสมทอง"
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
          <span class="title-text">วันที่ออกใบเบิกผสมทอง</span>
          <div class="flex-group">
            <Calendar
              class="w-100"
              v-model="form.createStart"
              :max-date="form.createEnd"
              :manualInput="false"
              showIcon
              placeholder="เริ่มต้น"
            />
            <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
            <Calendar
              class="w-100"
              v-model="form.createEnd"
              :min-date="form.createStart"
              :manualInput="false"
              showIcon
              placeholder="สิ้นสุด"
            />
          </div>
        </div>
        <div class="form-col-container">
          <div>
            <span class="title-text">เล่มที่</span>
            <div class="input-group input-group-inner">
              <input :class="['form-control bg-input']" type="text" v-model.trim="form.bookNo" />
            </div>
          </div>
          <div>
            <span class="title-text">เลขที่</span>
            <div class="input-group input-group-inner">
              <input :class="['form-control bg-input']" type="text" v-model.trim="form.no" />
            </div>
          </div>
        </div>
      </div>

      <dialogView
        :isShow="isShow.dialog"
        @closeDialog="closeDialog"
        @search="dialogSearch"
        txtHeader="ค้นหาเพิ่มเติม"
      >
        <template #content>
          <div class="form-col-container">
            <div>
              <span class="title-text">ค้นหาใบผสมทอง</span>
              <div class="input-group input-group-inner">
                <input
                  id="inputStockID"
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.text"
                  placeholder="พิมพ์บางอย่างเพื่อค้นหา"
                />
                <div class="input-group-append">
                  <span class="input-group-text">
                    <i class="bi bi-upc-scan text-main-color"></i>
                  </span>
                </div>
              </div>
            </div>
            <div>
              <span class="title-text">ค้นหาด้วยหมายเลขลำดับ</span>
              <div class="input-group input-group-inner">
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.runningNumber"
                />
              </div>
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
          title="เพิ่มเติม"
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

const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import Calendar from 'primevue/calendar'

const interfaceIsShow = {
  dialog: false
}

export default {
  components: {
    pageTitle,
    Calendar,
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
      //this.$router.push({ name: 'plan-gold-order' })
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
