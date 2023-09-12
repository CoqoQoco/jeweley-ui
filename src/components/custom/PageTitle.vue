<template>
  <div v-if="isShowTitle" id="wmsPageTitle" class="page-title-container">
    <div class="row">
      <!-- แสดง Title และ Desctiption -->
      <div :class="[!isShowRightSlot ? 'col-12' : 'col-9']">
        <p class="title">{{ title }}</p>
        <p v-if="description" class="description">{{ description }}</p>
      </div>
      <!-- หากต้องการเพิ่ม BTN สามารถเปิดใช้งาน Flag และ Slot ตามนี้ -->
      <div v-if="isShowRightSlot" class="col-3 add-on-container">
        <slot name="rightSlot"></slot>
      </div>
    </div>

    <div v-if="isShowBtnClose" class="on-close-float">
      <i
        @click="onDeleteTitle"
        class="cursor k-icon k-i-close text-secondary"
      ></i>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    isShowRightSlot: {
      type: Boolean,
      default: false,
    },
    isShowBtnClose: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isShowTitle: true,
    };
  },
  watch: {
    isShowTitle(value) {
      this.$store.commit("isShowTitle", value);
    },
  },
  methods: {
    onDeleteTitle() {
      this.isShowTitle = false;
    },
  },
  mounted() {
    this.$store.commit("isShowTitle", true);
  },
};
</script>

<style lang="scss" scoped>
// Custom
.page-title-container {
  border-bottom: 1px solid var(--base-font-color);
  padding-bottom: 8px;
  margin-bottom: 12px;
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

// Override
p {
  margin-bottom: 0px;
}
</style>
