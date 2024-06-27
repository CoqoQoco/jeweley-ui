<template>
  <div class="">
    <loading :isLoading="isLoading"></loading>
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
          <div>
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
            <button
              :class="['btn btn-sm', !files || files.length === 0 ? 'btn-secondary' : 'btn-danger']"
              @click.prevent="clearCallback(clearCallback)"
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
      <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">
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
                <span class="font-weight-bold">{{ truncateFileName(file.name, 5) }}</span>
                <div>{{ formatSize(file.size) }}</div>
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

        <div v-if="uploadedFiles.length > 0">
          <h5>Completed</h5>
          <div class="flex flex-wrap p-0 sm:p-5 gap-5">
            <div
              v-for="(file, index) of uploadedFiles"
              :key="file.name + file.type + file.size"
              class="card m-0 px-6 flex flex-column border-1 surface-border align-items-center gap-3"
            >
              <div>
                <img
                  role="presentation"
                  :alt="file.name"
                  :src="file.objectURL"
                  width="100"
                  height="50"
                />
              </div>
              <span class="font-semibold">{{ file.name }}</span>
              <div>{{ formatSize(file.size) }}</div>
              <button
                icon="pi pi-times"
                @click="removeUploadedFileCallback(index)"
                outlined
                rounded
                severity="danger"
              />
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
import { defineAsyncComponent } from 'vue'
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import FileUpload from 'primevue/fileupload'

export default {
  components: {
    FileUpload,
    loading
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
      default: () => false
    }
  },
  watch: {},
  data() {
    return {
      isLoading: false,
      files: [],
      totalSize: 0,
      totalSizePercent: 0
    }
  },
  methods: {
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
    // ส่งฟังก์ชัน removeAllFiles ไปยัง parent component
    if (typeof this.onRemoveAllFiles === 'function') {
      this.onRemoveAllFiles(this.onRemoveAllFiles)
    }
  }
}
</script>

<style lang="scss" scoped>
.box-header-action {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.title-header {
  font-size: 17px;
  display: grid;
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
