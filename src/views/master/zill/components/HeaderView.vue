<template>
  <div class="filter-container">
    <pageTitle
      title="เเก้ไข-ปรับปรุง ข้อมูลซิล"
      description=""
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <button class="btn btn-sm btn-warning" @click="onCreate">
          <span class="bi bi-plus mr-2"></span>
          <span>เพิ่มข้อมูลซิล</span>
        </button>
      </template>
    </pageTitle>
    <form @submit.prevent="onSubmit">
      <div class="form-col-container">
        <div>
          <span class="title-text">ค้นหา</span>
          <input type="text" class="form-control" v-model="form.moldColde" />
        </div>
        <div></div>
        <div></div>
        <div class="submit-container">
          <button class="btn btn-sm btn-main mr-2" style="width: 100px" type="submit">
            <span><i class="bi bi-search mr-2"></i></span>
            <span>ค้นหา</span>
          </button>
          <button class="btn btn-sm btn-secondary" style="width: 100px" type="button">
            <span><i class="bi bi-x mr-2"></i></span>
            <span>ล้าง</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

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
    onSubmit() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    onCreate(){
        this.$emit('create')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
