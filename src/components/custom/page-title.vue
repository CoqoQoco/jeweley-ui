<template>
  <div v-if="isShowTitle" id="wmsPageTitle" :class="['page-title-container', { 'page-title-filled': filled }]">
    <!-- Filled mode with icon: flex row layout [icon box] [title+desc] -->
    <template v-if="filled">
      <div class="filled-header-inner">
        <div v-if="icon" class="filled-icon-box">
          <i :class="['bi', icon]"></i>
        </div>
        <div class="filled-text-group">
          <p class="title">{{ title }}</p>
          <p v-if="description" class="description">{{ description }}</p>
        </div>
        <div v-if="$slots.rightSlot" class="filled-actions">
          <slot name="rightSlot" />
        </div>
      </div>
    </template>

    <!-- Default mode: original layout (row-based, backward compatible) -->
    <template v-else>
      <div class="row">
        <div :class="[!isShowRightSlot ? 'col-12' : 'col-9']" class="title-container">
          <p class="title">{{ title }}</p>
          <p v-if="description" class="description">{{ description }}</p>
        </div>
        <div v-if="isShowRightSlot" class="col-3 add-on-container">
          <slot name="rightSlot"></slot>
        </div>
      </div>
    </template>

    <div v-if="isShowBtnClose" class="on-close-float">
      <i @click="onDeleteTitle" class="cursor k-icon k-i-close text-secondary"></i>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    isShowRightSlot: {
      type: Boolean,
      default: false
    },
    isShowBtnClose: {
      type: Boolean,
      default: true
    },
    filled: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isShowTitle: true
    }
  },
  watch: {
    isShowTitle() {
      //this.$store.commit("isShowTitle", value);
    }
  },
  methods: {
    onDeleteTitle() {
      this.isShowTitle = false
    }
  },
  mounted() {
    //this.$store.commit("isShowTitle", true);
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';

// Custom
.page-title-container {
  border-bottom: 1px solid var(--base-font-color);
  padding-bottom: 5px;
  margin-bottom: 10px;
  position: relative;

  .title {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--base-font-color);
  }

  .description {
    margin-top: -2px;
    color: var(--base-font-color);
    font-size: 0.7rem;
  }

  .add-on-container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .on-close-float {
    position: absolute;
    top: 0;
    right: 0;
  }
}

// Filled variant — header zone bg main red, ตัวอักษรขาว (ใช้ใน SearchBarGeneric)
.page-title-container.page-title-filled {
  @include filled-surface($gradient: false, $dot: true);
  border-bottom: none;
  padding: var(--sp-md) var(--sp-lg);
  margin-bottom: 0;

  .filled-header-inner {
    display: flex;
    align-items: center;
    gap: var(--sp-md);
  }

  // กล่องไอคอน: translucent white บนพื้นแดง — token overlay-white-solid
  .filled-icon-box {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: var(--overlay-white-solid);
    display: flex;
    align-items: center;
    justify-content: center;

    .bi {
      color: var(--on-inverse);
      font-size: var(--fs-xl);
    }
  }

  .filled-text-group {
    flex: 1;
    min-width: 0;
  }

  .title {
    font-size: var(--fs-xl);
    font-weight: 700;
    line-height: 1.2;
    color: var(--on-inverse);
  }

  .description {
    color: var(--on-inverse-muted);
    font-size: var(--fs-sm);
    margin-top: 0;
    line-height: 1.3;
  }

  .filled-actions {
    flex-shrink: 0;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: var(--sp-sm);
  }

  // ปุ่มใน filled-actions: สีเขียว teal เป็น default, ทุกปุ่มกว้างเท่ากัน
  :deep(.filled-actions .btn) {
    width: 100%;
    justify-content: center;
    background: var(--base-green);
    border: 1px solid var(--base-green);
    color: var(--color-card-bg);
  }

  :deep(.filled-actions .btn:hover) {
    filter: brightness(0.92);
  }
}

// Override
p {
  margin-bottom: 0px;
}
</style>
