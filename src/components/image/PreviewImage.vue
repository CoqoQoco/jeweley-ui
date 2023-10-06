<template>
  <div class="image-container">
    <!-- <img class="image-preview" :src="urlImage" alt="PreviewImage" /> -->
    <Image
      v-if="urlImage"
      class="image-preview"
      :src="urlImage"
      alt="Image"
      width="60"
      height="60"
      preview
    />
    <div v-else class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
    <!-- <Avatar :image="urlImage" size="xlarge" shape="square" /> -->
  </div>
</template>

<script>
import api from '@/axios/axios-config.js'
//import Avatar from 'primevue/avatar'
import Image from 'primevue/image'
export default {
  components: {
    //Avatar
    Image
  },
  props: {
    imageName: {
      type: String,
      required: true,
      default: () => ''
    },
    type: {
      type: String,
      required: true,
      default: () => ''
    }
  },
  data() {
    return {
      urlImage: null
    }
  },
  methods: {
    async fetchImageData() {
      try {
        //console.log
        switch (this.type) {
          case 'ORDERPLAN': {
            const param = {
              imageName: this.imageName
            }
            const res = await api.jewelry.get('FileExtension/GetPlanImage', param)

            if (res) {
              this.urlImage = `data:image/png;base64,${res}`
            }
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
  },
  async created() {
    await this.fetchImageData()
  }
}
</script>

<style lang="scss" scoped>
.image-container {
  //display: grid;
  //place-content: center start;
  padding: 5px 0px 5px 0px;
}
.image-preview {
  //height: 100px;
  //width: 100px;
  border: 1px solid var(--base-color);
}
</style>
