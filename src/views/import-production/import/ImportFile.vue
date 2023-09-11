<template>
  <div class="app-container">
    <div class="import-contaner">
      <DragAndDrop></DragAndDrop>
      <div class="btn-file-container">
        <button class="btn btm-sm btn-danger">
          {{ $t('button.title.allDelete') }}
        </button>
        <button class="btn btm-sm btn-success">
          {{ $t('button.title.check') }}
        </button>
      </div>
      <div class="page-line"></div>
    </div>
    <div class="doc-container">
      <div class="folder">
        <div class="doc" v-for="(item, index) in document" :key="index">
          <i class="bi bi-file-earmark-post-fill"></i>
          <h3>{{ item.no }}</h3>
          <p>Something something</p>
          <p>Something something</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DragAndDrop from '@/components/btn-import/DragAndDropFile.vue'
//import ListItemExpnad from '@/components/list-expnad-collap/ListExpandCollap.vue'
export default {
  components: {
    DragAndDrop
    //ListItemExpnad
  },
  data() {
    return {
      document: [
        { no: '6608015' },
        { no: '6608015' },
        { no: '6608015' },
        { no: '6608015' },
        { no: '6608015' },
        { no: '6608015' },
        { no: '6608015' },
        { no: '6608015' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' },
        { no: '1111111111' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  //display: flex;
  //flex-direction: column;
  //height: 100vh;
}
.import-contaner {
  position: fixed;
  width: calc(100% - 100px); /* ลดความกว้างเพื่อไม่ให้ล้นด้านขวา */
  padding: 10px;
}
.btn-file-container {
  //display:;
  padding-top: 10px;
  padding-bottom: 10px;
  //border-bottom: 3px solid var(--base-font-color);
}
.page-line {
  border-bottom: 2px solid var(--base-font-color);
}

.doc-container {
  max-width: 100%;
  margin: 50px;
  //position: relative;
  //height: calc(100vh - 50px); /* ลบระยะขอบบน 50px เพื่อให้ถึงขอบล่าง */
  //height: calc(100vh - 100px);
  //box-sizing: border-box;
  //overflow: auto;
  .folder {
    justify-content: center;
    display: flex;
    flex-wrap: wrap;

    .doc {
      border-radius: 3px;
      //width: calc(20% - 17px);
      width: 200px;
      margin-bottom: 23px;
      text-align: center;
      border: 1px solid var(--base-font-color);
      transition: 0.2s all cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      padding: 35px 16px 25px;
      margin-right: 17px;
      cursor: pointer;
    }
    .doc:hover {
      box-shadow: 0px 7px 5px -6px rgba(0, 0, 0, 0.12);
    }
    .doc i {
      color: var(--base-font-color);
      height: 55px;
      margin-bottom: 20px;
      font-size: 55px;
      display: block;
      line-height: 54px;
      cursor: pointer;
    }
  }
  .folder::before {
    //content: 'Folder name';
    display: block;
    position: absolute;
    top: -40px;
  }
}
</style>
