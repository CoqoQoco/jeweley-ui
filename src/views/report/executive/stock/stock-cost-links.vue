<!--
  stock-cost-links — กล่องลิงก์ในแท็บ "ต้นทุน" ของคลังสินค้า: ไปหน้า "ราคาที่ควรตรวจ" (route stock-product-price-review)
  ตีราคาด่วนไม่มีหน้าแยก (เป็นกล่องในหน้ารายละเอียดสินค้า) จึงมีแค่คำอธิบายใต้ปุ่ม ไม่สร้างลิงก์ปลอม
-->
<template>
  <SectionCardGeneric :title="$t('view.productionInsight.stockInsight.costLinksTitle')" icon="bi-tags" accent="main" headerStyle="legend">
    <div class="stock-cost-links">
      <ButtonGeneric variant="green" icon="bi-search" :label="$t('view.productionInsight.stockInsight.linkPriceReview')" @click="openPriceReview" />
      <p class="stock-cost-links__hint">{{ $t('view.productionInsight.stockInsight.costLinksHint') }}</p>
    </div>
  </SectionCardGeneric>
</template>

<script>
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

export default {
  name: 'StockCostLinks',

  components: { ButtonGeneric, SectionCardGeneric },

  methods: {
    openPriceReview() {
      this.$router.push({ name: 'stock-product-price-review' })
    }
  }
}
</script>

<style lang="scss" scoped>
.stock-cost-links {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-sm);
}

.stock-cost-links__hint {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
