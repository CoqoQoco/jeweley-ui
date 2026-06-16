<template>
  <div class="form-container">
    <div class="grid-container">
      <div class="data-container">
        <div class="image-container">
          <div v-if="imageUrl">
            <img class="image-preview" :src="imageUrl" alt="Image" preview />
          </div>
          <div v-else class="spinner-border" role="status">
            <span class="sr-only">{{ $t('common.label.loading') }}</span>
          </div>
        </div>
        <div class="d-flex flex-column ml-2 mr-2 mb-2">
          <span class="txt-title">{{ $t('planView.productDetail') }}</span>
          <span class="txt-desc-product">{{ model.productDetail }}</span>
        </div>
      </div>
      <div class="data-container">
        <div class="data-txt-deatail-conatiner mb-2 mt-4">
          <div class="d-flex flex-column">
            <span class="txt-title">{{ $t('planTracking.colWo') }}</span>
            <span class="txt-desc">{{ model.wo }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">{{ $t('planUpdate.woNumber') }}</span>
            <span class="txt-desc">{{ model.woNumber }}</span>
          </div>
        </div>
        <div class="data-txt-deatail-conatiner mb-2">
          <div class="d-flex flex-column">
            <span class="txt-title">{{ $t('planTracking.colMold') }}</span>
            <span class="txt-desc">{{ model.mold }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">{{ $t('planUpdate.requestDate') }}</span>
            <span class="txt-desc">{{ formatDate(model.requestDate) }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">{{ $t('planUpdate.createDate') }}</span>
            <span class="txt-desc">{{ formatDate(model.createDate) }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">{{ $t('planUpdate.updateDate') }}</span>
            <span class="txt-desc">{{
              formatDate(model.updateDate) == null ? formatDate(model.updateDate) : '-'
            }}</span>
          </div>
        </div>
        <div class="data-txt-deatail-conatiner-customer mb-2">
          <div class="d-flex flex-column">
            <span class="txt-title">{{ $t('planTracking.colCustomerCode') }}</span>
            <span class="txt-desc">{{ model.customerNumber }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">{{ $t('planTracking.colCustomerName') }}</span>
            <span class="txt-desc">{{ model.customerName }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">{{ $t('planTracking.colCustomerType') }}</span>
            <span class="txt-desc">{{ getCustomerType(model.customerType) }}</span>
          </div>
        </div>
        <div class="data-txt-deatail-conatiner-customer mb-2">
          <div class="d-flex flex-column">
            <span class="txt-title">{{ $t('planTracking.colProductCode') }}</span>
            <span class="txt-desc">{{ model.productNumber ? model.productNumber : '-' }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">{{ $t('planUpdate.productName') }}</span>
            <span class="txt-desc">{{ model.productName ? model.productName : '-' }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">{{ $t('planTracking.colProductType') }}</span>
            <span class="txt-desc">{{ getProductType(model.productType) }}</span>
          </div>
        </div>
        <div class="data-txt-deatail-conatiner mb-2">
          <div class="d-flex flex-column">
            <span class="txt-title">{{ $t('planTracking.colProductQty') }}</span>
            <span class="txt-desc">{{ model.productQty ? model.productQty : '-' }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">{{ $t('planView.unitLabel') }}</span>
            <span class="txt-desc">{{ model.productQtyUnit ? model.productQtyUnit : '-' }}</span>
          </div>
        </div>
        <div class="data-txt-deatail-remark-conatiner mb-2">
          <div class="d-flex flex-column">
            <span class="txt-title">{{ $t('common.field.remark') }}</span>
            <span class="txt-desc">{{ model.remark ? model.remark : '-' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-end mt-3">
      <pdf
        class="btn btn-sm btn-green mr-2"
        :modelValue="model"
        :matValue="modelMat"
      ></pdf>
      <ButtonGeneric
        variant="main"
        icon="bi-brush"
        :label="$t('planUpdate.editHeader')"
        @click="onShowFormHeaderUpdate"
      />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

// External dependencies
import { formatDate } from '@/services/utils/dayjs'
import { getAzureBlobUrl } from '@/config/azure-storage-config.js'

// Local components
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const pdf = defineAsyncComponent(() => import('@/components/pdf-make/FilePDFProductionPlanView.vue'))

export default {
  components: {
    pdf,
    ButtonGeneric
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    modelMatValue: {
      type: Array,
      required: true,
      default: () => []
    },
    masterCustomerType: {
      type: Array,
      required: true,
      default: () => []
    },
    masterProductType: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    model() {
      this.fetchImageData(this.modelValue.mold)
      return this.modelValue
    },
    modelMat() {
      return this.modelMatValue
    }
  },
  watch: {
    async 'model.mold'() {
      await this.fetchImageData()
    }
  },
  data() {
    return {
      form: {},
      imageUrl: ''
    }
  },
  methods: {
    getCustomerType(item) {
      if (this.masterCustomerType.length) {
        let customer = this.masterCustomerType.filter((x) => x.code === item)
        return customer.length ? `${customer[0].nameTh}` : '-'
      }
    },
    getProductType(item) {
      if (this.masterProductType.length) {
        let customer = this.masterProductType.filter((x) => x.code === item)
        return customer.length ? `${customer[0].nameTh}` : '-'
      }
    },
    onShowFormHeaderUpdate() {
      this.$emit('onShowFormHeaderUpdate')
    },
    formatDate(date) {
      return date ? formatDate(date) : ''
    },
    async fetchImageData(mold) {
      const blobPath = `Mold/${mold}-Mold.png`
      this.imageUrl = getAzureBlobUrl(blobPath)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.grid-container {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-sm);
}
.data-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  background-color: #f7f7f7;
  padding: var(--sp-sm);
  height: calc(100vh - 260px);
  overflow: auto;
}
.data-txt-deatail-conatiner {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: var(--sp-sm);
  padding: 0 0 0 30px;
  font-size: var(--fs-xl);
}
.data-txt-deatail-conatiner-customer {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: var(--sp-sm);
  padding: 0 0 0 30px;
  font-size: var(--fs-xl);
}
.data-txt-deatail-remark-conatiner {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--sp-sm);
  padding: 0 0 0 30px;
  font-size: var(--fs-xl);
}
.image-container {
  display: grid;
  place-items: center;
  height: 300px;
}
.image-preview {
  max-width: 250px;
  height: auto;
  border-radius: var(--radius-md);
  object-fit: contain;
}
.txt-title {
  font-size: var(--fs-base);
}
.txt-desc {
  font-size: var(--fs-xl);
  color: var(--base-font-color);
}
.txt-desc-product {
  font-size: var(--fs-base);
  color: var(--base-font-color);
}
</style>
