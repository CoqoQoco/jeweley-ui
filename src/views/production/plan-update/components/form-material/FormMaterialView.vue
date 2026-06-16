<template>
  <div class="form-container">
    <div class="data-container">
      <!-- eslint-disable-next-line no-restricted-imports -->
      <DataTable
        :value="modelMatValue"
        class="p-datatable-sm"
        showGridlines
        scrollable
        scrollHeight="calc(100vh - 170px)"
      >
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column style="width: 50px; text-align: center">
          <template #body="prop">
            <ButtonGeneric
              variant="red"
              icon="bi-trash-fill"
              :title="$t('common.btn.delete')"
              @click="onDeletItem(prop.data)"
            />
          </template>
        </Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column field="goldNavigation" :header="$t('planView.colGoldType')">
          <template #body="prop">
            <div v-if="prop.data.goldNavigation?.code">
              {{ `${prop.data.goldNavigation?.code}: ${prop.data.goldNavigation?.nameTh}` }}
            </div>
            <div v-else>-</div>
          </template>
        </Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column field="goldSizeNavigation" :header="$t('planView.colGoldPercent')">
          <template #body="prop">
            <div v-if="prop.data.goldSizeNavigation?.code">
              {{ `${prop.data.goldSizeNavigation?.nameTh}` }}
            </div>
            <div v-else>-</div>
          </template>
        </Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column field="goldQty" :header="$t('planView.colGoldQty')">
          <template #body="prop">
            {{ `${prop.data.goldQty ?? '-'}` }}
          </template>
        </Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column field="gemNavigation" :header="$t('planView.colGemType')">
          <template #body="prop">
            <div v-if="prop.data.gemNavigation?.code">
              {{ `${prop.data.gemNavigation?.code}: ${prop.data.gemNavigation?.nameTh}` }}
            </div>
            <div v-else>-</div>
          </template>
        </Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column field="gemShapeNavigation" :header="$t('planView.colGemShape')">
          <template #body="prop">
            <div v-if="prop.data.gemShapeNavigation?.code">
              {{
                `${prop.data.gemShapeNavigation?.code}: ${prop.data.gemShapeNavigation?.nameTh}  ${
                  prop.data.gemSize ?? ``
                }`
              }}
            </div>
            <div v-else>-</div>
          </template>
        </Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column field="gemQty" :header="$t('planView.colGemQty')">
          <template #body="prop">
            {{ `${prop.data.gemQty ?? '-'}  ${prop.data.gemQty ? prop.data.gemUnit : ''}` }}
          </template>
        </Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column field="gemWeight" :header="$t('planView.colGemWeight')">
          <template #body="prop">
            {{
              `${prop.data.gemWeight ?? '-'}  ${prop.data.gemWeight ? prop.data.gemWeightUnit : ''}`
            }}
          </template>
        </Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column field="diamondQty" :header="$t('planView.colDiamondQty')">
          <template #body="prop">
            {{
              `${prop.data.diamondQty ?? '-'}  ${prop.data.diamondQty ? prop.data.diamondUnit : ''}`
            }}
          </template>
        </Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column field="diamondWeight" :header="$t('planView.colDiamondWeight')">
          <template #body="prop">
            {{
              `${prop.data.diamondWeight ?? '-'}  ${
                prop.data.diamondWeight ? prop.data.diamondWeightUnit : ''
              }`
            }}
          </template>
        </Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column field="diamondSize" :header="$t('planView.colDiamondSize')">
          <template #body="prop">
            {{ `${prop.data.diamondSize ?? '-'}` }}
          </template>
        </Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column field="diamondQuality" :header="$t('planView.colDiamondQuality')">
          <template #body="prop">
            {{ `${prop.data.diamondQuality ?? '-'}` }}
          </template>
        </Column>
        <template #footer>
          <div>
            <ButtonGeneric
              variant="main"
              icon="bi-plus"
              :label="$t('planUpdate.addMaterial')"
              @click="onShowFormMaterialUpdate"
            />
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-restricted-imports
import DataTable from 'primevue/datatable'
// eslint-disable-next-line no-restricted-imports
import Column from 'primevue/column'

import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import api from '@/axios/axios-helper.js'

export default {
  components: {
    DataTable,
    Column,
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
    }
  },
  methods: {
    onDeletItem(item) {
      confirmSubmit(
        `${item.goldNavigation.code}-${item.goldNavigation.nameTh}, ${this.$t('common.field.quantity')} ${item.goldQty}`,
        this.$t('planUpdate.confirmDeleteMaterial'),
        async () => {
          await this.deletMatItem(item)
        },
        null,
        null
      )
    },
    onShowFormMaterialUpdate() {
      this.$emit('onShowFormMaterialUpdate')
    },
    async deletMatItem(item) {
      const params = {
        planId: this.modelValue.id,
        wo: this.modelValue.wo,
        woNumber: this.modelValue.woNumber,
        materialId: item.id
      }

      const res = await api.jewelry.post('ProductionPlan/ProductionPlanDeleteMaterial', params)
      if (res) {
        success(
          ``,
          '',
          async () => {
            this.$emit('fetch')
          },
          null,
          null
        )
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.data-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  background-color: #f7f7f7;
  padding: var(--sp-sm);
  height: calc(100vh - 160px);
  overflow: auto;
}
</style>
