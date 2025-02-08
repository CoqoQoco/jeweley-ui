<template>
  <div id="wmsPageTitle" class="page-title-container">
    <div>
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
    }
  },
  data() {
    return {
      isShowTitle: true
    }
  },
  watch: {},
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
.filter-container {
  border: 1px solid #dddddd;
  border-radius: 5px;

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  //background-color: var(--base-color);
  padding: 10px ;
  //margin-top: 10px;
  overflow: auto;
}
// Custom
.page-title-container {
  //border-bottom: 1px solid var(--base-font-color);
  //padding-bottom: 5px;
  //margin-bottom: 5px;
  position: relative;
  border-radius: 5px;

  padding: 10px 10px 10px 0px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: var(--base-font-color);

  .title {
    font-size: 1.2rem;
    font-weight: bold;
    color: #ffff;
  }

  .description {
    margin-top: -2px;
    color: #ffff;
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
