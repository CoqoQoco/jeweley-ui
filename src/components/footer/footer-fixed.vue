<template>
  <div
    v-if="isShowFooter"
    id="fixed-footer"
    :class="[
      'fixed-footer-container',
      isRightColumnEnabled ? 'right-enabled' : '',
      getIsShowSidebar ? 'active' : 'inactive'
    ]"
  >
    <!-- Dynamic : More BTN -->
    <slot v-if="isLeftColumnEnabled" name="action">
      <!-- More BTN -->
    </slot>

    <!-- Static : Basic BTN -->
    <div class="right-column" v-if="isRightColumnEnabled">
      <button v-if="!isDisabledCancel" @click="cancelEmitFunc" class="ml-2 btn btn-sm btn-dark">
        <div class="btn-wrapper">
          <i class="k-icon k-i-close mr-1"></i>
          <span>{{ $t('global.btn.btnCancel') }}</span>
        </div>
      </button>

      <button
        :disabled="isDisabledConfirm"
        @click="submitEmitFunc"
        class="ml-2 btn btn-sm btn-angel-primary"
      >
        <div class="btn-wrapper">
          <i class="k-icon k-i-check mr-1"></i>
          <span>{{ $t('global.btn.btnSubmit') }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isShowFooter: {
      type: Boolean,
      default: false
    },
    isLeftColumnEnabled: {
      type: Boolean,
      default: false
    },
    isRightColumnEnabled: {
      type: Boolean,
      default: true
    },
    isDisabledCancel: {
      type: Boolean,
      default: false
    },
    isDisabledConfirm: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    getIsShowSidebar() {
      return this.$store.getters.getIsShowSidebar
    }
  },
  methods: {
    submitEmitFunc() {
      this.$emit('submit')
    },
    cancelEmitFunc() {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss" scoped>
.fixed-footer-container {
  position: fixed;
  left: 0;
  bottom: 0;
  background-color: #e9ecef;
  padding: 12px 20px;
  width: 100%;
  border-top: 1px solid #dddddd;

  display: flex;

  transition-duration: 0.5s;
  z-index: 300;
}

.active {
  margin-left: 230px;
  padding-right: 250px;
}

.inactive {
  margin-left: 0px;
  padding-right: 20px;
}

.btn-sm {
  font-size: 12px;
}

.right-enabled {
  display: flex;
  justify-content: flex-end;
}

.btn-wrapper {
  display: flex;
  align-items: center;
}
</style>
