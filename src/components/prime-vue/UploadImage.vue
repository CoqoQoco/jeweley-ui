<template>
  <div class="upload-container" :style="`height:${hight};`">
    <div class="upload-header">
      <div class="row form-group">
        <div class="col-md-4">
          <div class="upload-btn">
            <input class="hidden-input" type="file" accept=".jpg, .png" @change="onImportIamge" />
            <button class="btn btn-sm btn-warning btn-upload-custom" type="button">
              เลือกรูปภาพ
            </button>
          </div>
        </div>
        <div class="col-md-8">
          <div class="row form-group">
            <div class="col-md-12">
              <input class="form-control" type="text" disabled v-model="name" />
            </div>
            <!-- <div class="col-md-5">
              <button class="btn btn-sm btn-warning btn-upload-custom">ยกเลิก</button>
            </div> -->
          </div>
        </div>
      </div>
    </div>
    <div class="upload-preview">
      <div v-if="name">
        <img :src="imgUrl" alt="Preview" class="preview-image" />
        <!-- <i class="bi bi-x del-iamge-x"></i> -->
      </div>
    </div>
  </div>
</template>

<script>
//import FileUpload from 'primevue/fileupload'
export default {
  components: {
    //FileUpload
  },
  props: {
    hight: {
      type: String
    }
  },
  data() {
    return {
      name: '',
      imgUrl: ''
    }
  },
  methods: {
    onImportIamge(e) {
      if (e.target.files[0]) {
        this.name = e.target.files[0].name

        //preview
        const reader = new FileReader()
        reader.onload = (event) => {
          this.imgUrl = event.target.result
        }
        reader.readAsDataURL(e.target.files[0])

        //emit
        this.$emit('onImportFile', e.target.files[0])
      }
    }
  }
}
</script>

<style lang="scss">
.upload-container {
  border: 1px solid var(--base-color);
  //height: 200px;
  background-color: #ffff;
  padding: 0px;

  display: grid;
}
.upload-header{
    padding: 10px;
    height: 55px;
    background-color: var(--base-color);
    //vertical-align: middle;
}
.hidden-input {
  opacity: 0;
  overflow: hidden;
  position: absolute;
  width: 80%;
  height: 35px;
}
.btn-upload-custom {
  width: 100%;
  height: 35px;
  //border: 1px solid var(--base-color);
}
.upload-preview {
  display: grid;
  place-items: center;
}
.preview-image {
  width: 300px;
  height: 300px;
  border: 1px solid var(--base-sub-color);
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  border-radius: 10px;

  //display: inline-block;
  //position: relative;
}
.del-iamge-x {
  //position: absolute;
  //top: 0;
  //right: 0;
}
</style>
