<template>
  <div class="app-container">
    <div class="contianer-fixed">
      <h3>นำเข้าใบงาน</h3>
      <div class="contianer-page-line" style="margin-bottom: 10px"></div>
      <div class="contianer-drag-and-drop"><DragAndDrop></DragAndDrop></div>
      <div class="contianer-btn-import">
        <button class="btn btm-sm btn-danger">
          {{ $t('button.title.allDelete') }}
        </button>
        <button class="btn btm-sm btn-primary ml-2">
          {{ $t('button.title.check') }}
        </button>
      </div>
      <!-- <div class="contianer-page-line"></div> -->
    </div>
    <div class="contianer-document">
      <h3>ใบงานรอตรวจสอบเเละนำเข้า</h3>
      <div class="contianer-page-line" style="margin-bottom: 10px"></div>
      <div class="container-documnet-folder">
        <div
          class="container-documnet-file"
          v-for="(item, index) in document"
          :key="index"
          @click="confirmDocument"
        >
          <i class="bi bi-file-earmark-post-fill"></i>
          <h3>{{ item.no }}</h3>
          <p>Something something</p>
          <p>Something something</p>
        </div>
      </div>
      <!-- <div class="contianer-page-line border-top-10"></div> -->
    </div>
    <ModalConfirm :isShowModal="isShowModal" @closeModal="onCloseModal"></ModalConfirm>
  </div>
</template>

<script>
import DragAndDrop from '@/components/btn-import/DragAndDropFile.vue'
import ModalConfirm from './components/ModalFileSubmit.vue'
export default {
  components: {
    DragAndDrop,
    ModalConfirm
    //ListItemExpnad
  },
  data() {
    return {
      isShowModal: false,
      document: [
        { no: '6608010' },
        { no: '6608011' },
        { no: '6608012' },
        { no: '6608013' },
        { no: '6608014' },
        { no: '6608015' },
        { no: '6608016' },
        { no: '6608017' },
        { no: '6608010' },
        { no: '6608011' },
        { no: '6608012' },
        { no: '6608013' },
        { no: '6608014' },
        { no: '6608015' }
      ]
    }
  },
  methods: {
    confirmDocument() {
      console.log('show modal')
      this.isShowModal = true
    },
    onCloseModal() {
      this.isShowModal = false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  h3 {
    color: var(--base-font-color);
  }
}
.contianer-fixed {
  //background-color: red;
  position: relative;
  //width: calc(100% - 90px); /* ลดความกว้างเพื่อไม่ให้ล้น */
  //overflow: hidden; /* เพิ่มการกำหนดค่า overflow */
}
.contianer-drag-and-drop {
}
.contianer-btn-import {
  display: flex;
  justify-content: end;
  padding-top: 10px;
  padding-bottom: 10px;
}
.contianer-page-line {
  border-bottom: 2px solid var(--base-font-color);
}
.contianer-document {
  max-width: 100%;
  margin-top: 20px;

  .container-documnet-folder {
    justify-content: center;
    display: flex;
    //flex-direction: column;
    flex-wrap: wrap;
    height: calc(100vh - 400px);
    overflow: auto;
    .container-documnet-file {
      position: relative;
      text-align: center;
      border-radius: 3px;
      border: 1px solid var(--base-font-color);
      width: 200px;
      transition: 0.2s all cubic-bezier(0.4, 0, 0.2, 1);
      padding: 35px 16px 25px;
      margin-bottom: 23px;
      margin-right: 17px;
      cursor: pointer;
    }
    .container-documnet-file::hover {
      box-shadow: 0px 7px 5px -6px var(--base-font-color);
    }
    .container-documnet-file i {
      display: block;
      color: var(--base-font-color);
      font-size: 55px;
      height: 55px;
      line-height: 54px;
      margin-bottom: 20px;
      cursor: pointer;
    }
  }
  .container-documnet-folder::before {
    display: block;
    position: absolute;
    top: -40px;
  }
}
</style>
