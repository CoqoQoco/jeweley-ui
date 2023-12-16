<template>
  <div>
    <div class="main">
      <div class="dropzone-container" @dragover="dragover" @dragleave="dragleave" @drop="drop">
        <input
          type="file"
          multiple
          name="file"
          id="fileInput"
          class="hidden-input"
          @change="onChange"
          ref="file"
          accept=".xls, .xlsx"
        />
        <!-- accept=".pdf,.jpg,.jpeg,.png" -->

        <label for="fileInput" class="file-label">
          <i class="bi bi-cloud-arrow-down-fill" style="font-size: 50px"></i>
          <div v-if="isDragging">Release to drop files here.</div>
          <!-- <div v-else>Drop files here or <u>click here</u> to upload.</div> -->
          <div>
            <span>Drop files here or</span>
            <a class="btn btn-sm btn-info ml-2 no-underline">{{ $t('button.title.browse') }}</a>
          </div>
        </label>

        <div class="preview-container" v-if="files.length">
          <div v-for="file in files" :key="file.name" class="preview-card">
            <div>
              <p :title="file.name">
                {{ makeName(file.name) }}
              </p>
            </div>
            <div>
              <button
                type="button"
                class="btn-preview-remove"
                @click="remove(files.indexOf(file))"
                title="Remove file"
              >
                <i class="bi bi-x-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="fileName-container">
        <div class="preview-container" v-if="files.length">
          <div v-for="file in files" :key="file.name" class="preview-card">
            <div>
              <p :title="file.name">
                {{ makeName(file.name) }}
              </p>
            </div>
            <div>
              <button
                type="button"
                class="btn-preview-remove"
                @click="remove(files.indexOf(file))"
                title="Remove file"
              >
                <i class="bi bi-x-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
//import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  data() {
    return {
      isDragging: false,
      files: []
    }
  },
  methods: {
    onChange() {
      //swAlert.warning('test', null, null)
      if (this.files.length > 0) {
        this.files = [...this.files, ...this.$refs.file.files]
      } else {
        this.files = [...this.$refs.file.files]
      }
    },
    generateThumbnail(file) {
      let fileSrc = URL.createObjectURL(file)
      setTimeout(() => {
        URL.revokeObjectURL(fileSrc)
      }, 1000)
      return fileSrc
    },
    makeName(name) {
      //name.split('.')[0].substring(0, 3) + '...' + name.split('.')[name.split('.').length - 1]
      if (name.length > 7) {
        return name.split('.')[0].substring(0, 7) + '...'
      } else {
        return name
      }
    },
    remove(i) {
      this.files.splice(i, 1)
    },
    dragover(e) {
      e.preventDefault()
      this.isDragging = true
    },
    dragleave() {
      this.isDragging = false
    },
    drop(e) {
      e.preventDefault()
      this.$refs.file.files = e.dataTransfer.files
      this.onChange()
      this.isDragging = false
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  display: flex;
  flex-grow: 1;
  flex-direction: row;
  align-items: flex-start;
  //height: 100vh;
  justify-content: center;
  text-align: center;
  color: var(--base-font-color);
  //background-color: var(--base-sub-color);
}
.dropzone-container {
  padding-bottom: 1rem;
  //background: #f7fafc;
  width: 100%;
  border-radius: 10px;
  border: 3px solid var(--base-font-color);
  background-color: var(--base-color);
  border-style: dotted;
}
.fileName-container {
  margin-left: 5px;
  padding-bottom: 1rem;
  //background: #f7fafc;
  width: 100%;
  border-radius: 10px;
  border: 3px solid var(--base-font-color);
  background-color: var(--base-color);
  border-style: dotted;
}
.hidden-input {
  opacity: 0;
  overflow: hidden;
  position: absolute;
  width: 1px;
  height: 1px;
}
.file-label {
  font-size: 20px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}
.preview-container {
  display: flex;
  justify-content: center;
  //align-items: center;
  //align-content: center;
  //flex-direction: row;
  margin-top: 0.5rem;
}
.preview-card {
  //display: flex;
  //flex-direction: column;
  //justify-content: center;
  //border: 1px solid var(--base-font-color);
  //border-radius: 5px;
  border-style: double;
  width: 70px;
  padding: 2px;
  margin-left: 5px;
  //color: var(--base-color);
  //background-color: var(--base-sub-color);

  .btn-preview-remove {
    border: none;
    color: var(--base-font-color);
    background-color: var(--base-color);
  }
}
.preview-img {
  width: 50px;
  height: 50px;
  border-radius: 5px;
  border: 1px solid #a2a2a2;
  background-color: #a2a2a2;
}
</style>
