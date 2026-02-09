<template>
  <Modal
    v-model="isShowModal"
    :click-out="clickToClose"
    :max-width="width"
    teleportTarget="#modal-container"
  >
    <!-- Loading -->
    <div class="slot-loading-for-call-api-modal">
      <slot name="loading"></slot>
    </div>
    <!-- Main Workspace -->
    <div class="modal-container" :style="`overflow-y:auto; height:${fitHeight ? genHeight : ''}`">
      <!-- Header -->
      <div class="base-modal__header">
        <div>
          <slot name="title"></slot>
        </div>
        <button class="btn float-close" @click="closeModal">
          <i class="bi-x-square-fill text-custom"></i>
        </button>
      </div>
      <!-- Content -->
      <div class="content-container">
        <slot name="content"></slot>
      </div>
      <!-- Footer (BTN Action) -->
      <div v-if="isShowActionPart" class="base-modal__operation">
        <slot name="action"></slot>
      </div>
    </div>
  </Modal>
</template>

<script>
import { Modal } from 'vue-neat-modal'
import 'vue-neat-modal/dist/vue-neat-modal.css'

export default {
  components: {
    Modal
  },
  props: {
    showModal: {
      type: Boolean
    },
    clickToClose: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '85%'
    },
    fitHeight: {
      type: Boolean,
      default: false
    },
    isShowActionPart: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShowModal: false
    }
  },
  computed: {
    genHeight() {
      const h = window.innerHeight
      return h - 100 + 'px'
    }
  },
  watch: {
    showModal(value) {
      this.isShowModal = value
    }
  },
  methods: {
    closeModal() {
      this.$emit('closeModal')
    }
  },
  created() {
    this.isShowModal = this.showModal
  }
}
</script>

<style lang="scss">
// Base Class
.base-modal {
  &__header {
    position: relative;
    //padding: 20px;
    //border-bottom: 1px solid #dddddd;
    width: 100%;
  }
  &__operation {
    border-top: 1px solid #dddddd;
    padding: 20px;
    text-align: center;
  }
  border-radius: 15px;
}
.modal-container {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: #fff;
  background-clip: border-box;
  //border: 1px solid transparent;
  border-radius: 0.25rem;
  //padding: 0px 0px 0px 0px;
}

.float-close {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 20px;
  //color: var(--base-sub-color);
  //border: 1px solid var(--base-sub-color);
  z-index: 10000;

  .text-custom {
    //color: var(--base-sub-color);
    background-color: var(--base-font-color);
  }
}
// Override Class
// .k-animation-container {
//   z-index: 98;
// }
.vue-neat-modal-backdrop {
  z-index: 97;
}
.vue-neat-modal-wrapper {
  z-index: 98;
}
</style>
