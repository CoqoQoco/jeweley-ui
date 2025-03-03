<template>
  <div class="dialog-container">
    <dialogView
      :visible="dialogShow"
      @update:visible="closeDialog"
      modal
      :style="{ width: dialogWidth }"
      header=""
      @keyup.enter="search"
    >
      <template #header>
        <slot name="header">
          <div class="title-text-lg">
            <span><i class="bi bi-zoom-in mr-2"></i></span>
            <span>{{ txt.header }}</span>
          </div>
        </slot>
      </template>
      <div class="content-container">
        <slot name="content"></slot>
        <div class="btn-submit-container">
          <button class="btn btn-sm btn-main mr-2" type="button" title="ค้นหา" @click="search">
            <span><i class="bi bi-search"></i></span>
          </button>
        </div>
      </div>
    </dialogView>
  </div>
</template>

<script>
import Dialog from 'primevue/dialog'

export default {
  components: {
    dialogView: Dialog
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    txtHeader: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '1200px'
    }
  },
  computed: {
    dialogShow() {
      return this.isShow
    },
    dialogWidth() {
      return this.width
    },
    txt() {
      return {
        header: this.txtHeader
      }
    }
  },
  methods: {
    closeDialog() {
      //console.log('closeDialog')
      this.$emit('closeDialog', false)
    },
    search() {
      //console.log('search')
      this.$emit('search')
    },
    handleKeyup(event) {
      if (this.dialogShow && event.key === 'Enter') {
        this.search()
      }
    }
  },
  mounted() {
    window.addEventListener('keyup', this.handleKeyup)
  },
  beforeUnmount() {
    window.removeEventListener('keyup', this.handleKeyup)
  }
}
</script>

<style lang="scss">
@import '@/assets/scss/custom-style/standard-form.scss';
.line-header {
  border-top: 1px solid #921313;
  width: 100%;
}
.btn-submit-container {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  padding-top: 8px;
  margin-top: 10px;
  border-top: 1px solid var(--base-font-color);
}
</style>
