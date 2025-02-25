<template>
  <div class="image-container">
    <!-- <img class="image-preview" :src="urlImage" alt="PreviewImage" /> -->
    <Image
      v-if="urlImage"
      :class="borderShow ? `image-preview` : ``"
      :src="urlImage"
      alt="Image"
      :width="width"
      :height="height"
      :preview="preview"
    />
    <div v-else class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
    <!-- <Avatar :image="urlImage" size="xlarge" shape="square" /> -->
  </div>
</template>

<script>
import api from '@/axios/axios-helper.js'
//import Avatar from 'primevue/avatar'
import Image from 'primevue/image'
export default {
  name: 'PreviewImage',
  inheritAttrs: false, // ป้องกัน
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
    path: {
      type: String,
      default: () => ''
    },
    type: {
      type: String,
      required: true,
      default: () => ''
    },
    width: {
      type: Number,
      default: () => 60
    },
    height: {
      type: Number,
      default: () => 60
    },
    borderShow: {
      type: Boolean,
      default: () => true
    },
    preview: {
      type: Boolean,
      default: () => true
    }
    // fetch: {
    //   type: Number,
    //   required: true,
    //   default: () => 0
    // }
  },
  watch: {
    imageName: {
      handler: 'fetchImageData',
      immediate: true
    }
  },
  data() {
    return {
      urlImage: null,
      name: null
    }
  },
  methods: {
    async fetchImageData() {
      try {
        switch (this.type) {
          case 'PATH':
            {
              const param = {
                imageName: `${this.imageName}`,
                path: this.path
              }
              const res = await api.jewelry.get('FileExtension/GetImage', param, {
                skipLoading: true
              })

              if (res) {
                this.urlImage = `data:image/png;base64,${res}`
              }
            }
            break
          case 'ORDERPLAN':
            {
              const param = {
                imageName: this.imageName
              }
              const res = await api.jewelry.get('FileExtension/GetPlanImage', param, {
                skipLoading: true
              })

              if (res) {
                this.urlImage = `data:image/png;base64,${res}`
              }
            }
            break
          case 'MOLD':
            {
              const param = {
                imageName: `${this.imageName}-Mold.png`
              }
              const res = await api.jewelry.get('FileExtension/GetMoldImage', param, {
                skipLoading: true
              })

              if (res) {
                this.urlImage = `data:image/png;base64,${res}`
              }
            }
            break
          case 'PLANMOLD':
            {
              const param = {
                imageName: `${this.imageName}`
              }
              const res = await api.jewelry.get('FileExtension/GetPlanMoldDesignImage', param, {
                skipLoading: true
              })

              if (res) {
                this.urlImage = `data:image/png;base64,${res}`
              }
            }
            break
          case 'PLANMOLDRESIN':
            {
              const param = {
                imageName: `${this.imageName}`
              }
              const res = await api.jewelry.get('FileExtension/GetPlanMoldResinImage', param, {
                skipLoading: true
              })

              if (res) {
                this.urlImage = `data:image/png;base64,${res}`
              }
            }
            break
          case 'STOCK-PRODUCT':
            {
              const param = {
                imageName: `${this.path}`
              }
              const res = await api.jewelry.get('FileExtension/GetStockProductImage', param, {
                skipLoading: true
              })

              //console.log('STOCK-PRODUCT-IMAGE', res)
              if (res) {
                this.urlImage = `data:image/png;base64,${res}`
              }
            }
            break
        }
      } catch (error) {
        console.log(error)
      }
    }
  },
  async created() {
    //await this.fetchImageData()
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
