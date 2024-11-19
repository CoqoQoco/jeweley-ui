<template>
  <div class="">
    <FileUpload
      name="demo[]"
      url="/api/upload"
      @upload="onTemplatedUpload($event)"
      :multiple="true"
      accept="image/*"
      :maxFileSize="maxFileSize"
      @select="onSelectedFiles"
    >
      <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
        <div class="box-header-action">
          <div class="d-flex">
            <span><i class="bi bi-image mr-2 title-header"></i></span>
            <span class="title-header">{{ title }}</span>
          </div>
          <div>
            <button
              class="btn btn-sm btn-primary mr-2"
              style="width: 100px"
              @click.prevent="chooseCallback(chooseCallback)"
            >
              <span><i class="bi bi-image"></i></span>
              <span class="ml-2">เลือกไฟล์</span>
            </button>
            <!-- @click.prevent="clearCallback(clearCallback)" -->
            <button
              ref="btnClear"
              id="btnClear"
              :class="['btn btn-sm', !files || files.length === 0 ? 'btn-secondary' : 'btn-danger']"
              @click.prevent="executeClearCallback(clearCallback)"
              style="width: 100px"
              :disabled="!files || files.length === 0"
              v-if="isAllClear"
            >
              <span><i class="bi bi-x-circle"></i></span>
              <span class="ml-2">ล้าง</span>
            </button>
            <button
              :class="[
                'btn btn-sm ml-2',
                !files || files.length === 0 ? 'btn-secondary' : 'btn-main'
              ]"
              @click="uploadEvent(uploadCallback)"
              :disabled="!files || files.length === 0"
              v-if="isUpload"
            >
              <span><i class="bi bi-cloud-upload"></i></span>
              <span class="ml-2">อัพโหลด</span>
            </button>
          </div>
        </div>
      </template>
      <template #content="{ files, removeFileCallback }">
        <div v-if="files.length > 0">
          <!-- <h5>Pending</h5> -->
          <div class="box-content">
            <div v-for="(file, index) of files" :key="file.name + file.type + file.size" class="">
              <div class="box-img-content">
                <div>
                  <img
                    class="box-img"
                    role="presentation"
                    :alt="file.name"
                    :src="file.objectURL"
                    width="150"
                    height="150"
                  />
                </div>
                <div class="d-flex" style="font-size: 15px">
                  <span class="">{{ truncateFileName(file.name, 8) }}</span>
                  <span class="mr-1">,</span>
                  <span> {{ formatSize(file.size) }}</span>
                </div>
                <!-- <div style="font-size: 15px">{{ formatSize(file.size) }}</div> -->
                <!-- <Badge value="Pending" severity="warning" /> -->
                <button
                  class="btn btn-sm btn-danger"
                  @click="onRemoveTemplatingFile(file, removeFileCallback, index)"
                >
                  <i class="bi bi-x-circle"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #empty>
        <div class="box-content">
          <p class="mt-5 mb-0 text-secondary">Drag and drop files to here to upload.</p>
        </div>
      </template>
    </FileUpload>
  </div>
</template>

<script>
import FileUpload from 'primevue/fileupload'

export default {
  components: {
    FileUpload
  },
  props: {
    maxFileSize: {
      type: Number,
      default: () => 4000000
    },
    title: {
      type: String,
      default: () => 'อัพโหลดรูปภาพ'
    },
    isUpload: {
      type: Boolean,
      default: () => false
    },
    isAllClear: {
      type: Boolean,
      default: () => true
    },
    countClearFiles: {
      type: Number,
      default: () => 0
    }
  },
  watch: {
    countClearFiles() {
      console.log('clearFilesFunction', this.countClearFiles)
      if (this.countClearFiles > 0) {
        document.getElementById('btnClear').click()
      }
    }
  },
  data() {
    return {
      isLoading: false,
      files: [],
      totalSize: 0,
      totalSizePercent: 0
    }
  },
  methods: {
    executeClearCallback(clearCallback) {
      // ดำเนินการล้างไฟล์ภายใน component
      clearCallback()
      this.totalSize = 0
      this.totalSizePercent = 0
      this.$emit('onUpdateFile', [])
    },
    onRemoveTemplatingFile(file, removeFileCallback, index) {
      removeFileCallback(index)
      this.totalSize -= parseInt(this.formatSize(file.size))
      this.totalSizePercent = this.totalSize / 10
      //console.log('this.files - index remove', this.files)
      this.$emit('onUpdateFile', this.files)
    },
    onClearTemplatingUpload(clear) {
      clear()
      this.totalSize = 0
      this.totalSizePercent = 0
    },
    onSelectedFiles(event) {
      this.loading = true
      this.files = event.files
      this.files.forEach((file) => {
        this.totalSize += parseInt(this.formatSize(file.size))
      })
      //console.log('this.files - select', this.files)
      this.$emit('onUpdateFile', this.files)
      this.loading = false
    },
    uploadEvent(callback) {
      this.totalSizePercent = this.totalSize / 10
      callback()
    },
    onTemplatedUpload() {
      this.$toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 })
    },
    formatSize(bytes) {
      const k = 1024
      const dm = 3
      const sizes = this.$primevue.config.locale.fileSizeTypes

      if (bytes === 0) {
        return `0 ${sizes[0]}`
      }

      const i = Math.floor(Math.log(bytes) / Math.log(k))
      const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm))

      return `${formattedSize} ${sizes[i]}`
    },
    truncateFileName(fileName, maxLength) {
      if (fileName.length <= maxLength) return fileName

      const extension = fileName.split('.').pop()
      const nameWithoutExtension = fileName.slice(0, fileName.lastIndexOf('.'))

      if (nameWithoutExtension.length <= maxLength) return fileName

      return `${nameWithoutExtension.slice(0, maxLength)}.... .${extension}`
    }
  },
  mounted() {
    console.log('created: this.$refs.btnClear', this.$refs.btnClear)
    this.$emit('btnClearRef', this.$refs.btnClear)
  }
}
</script>

<style lang="scss" scoped>
:deep(.p-fileupload-buttonbar) {
  background-color: var(--base-color);
}
.box-header-action {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.title-header {
  font-size: 17px;
  //display: grid;
  color: var(--base-font-color);
  font-weight: 700;
}
.box-content {
  display: flex;
  justify-content: center;
  gap: 20px;
}
.box-img-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.box-img {
  border: 2px solid #921313;
  border-radius: 5px;
}
</style>
