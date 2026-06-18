<!-- eslint-disable vue/no-restricted-imports -->
<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-header">
          <span>{{ $t('planUpdate.costCardTitle') }}</span>
          <span class="bi bi-arrow-right ml-1"></span>
          <span class="ml-1">{{ `ใบจ่าย-รับคืนงาน เลขที่: ${model.wo}-${model.woNumber}` }}</span>
        </div>
        <form @submit.prevent="onSubmit" class="p-2">
          <!-- transection -->
          <div>
            <DataTable
              :value="tranItems"
              rowGroupMode="subheader"
              groupRowsBy="nameGroup"
              stripedRows
              showGridlines
            >
              <ColumnGroup type="header">
                <Row>
                  <Column :header="$t('planUpdate.costCardDescription')" :colspan="3" />
                  <Column :header="$t('common.field.quantity')" />
                  <Column :header="$t('planUpdate.pricePerQty')" />
                  <Column :header="$t('common.field.weight')" />
                  <Column :header="$t('planUpdate.pricePerWeight')" />
                  <Column :header="$t('planUpdate.totalPrice')" />
                </Row>
              </ColumnGroup>

              <Column field="nameGroup"> </Column>
              <Column field="index" style="width: 10px">
                <template #body="slotProps">
                  <span>{{ slotProps.index + 1 }}</span>
                </template>
              </Column>
              <Column field="action" style="width: 10px">
                <template #body="slotProps">
                  <ButtonGeneric
                    variant="red"
                    icon="bi-trash"
                    type="button"
                    :title="$t('common.btn.delete')"
                    @click="delItem(slotProps.index)"
                  />
                </template>
              </Column>
              <Column field="nameDescription">
                <template #body="slotProps">
                  <div v-if="slotProps.data.nameGroup === 'ETC' || slotProps.data.isAdd">
                    <input
                      type="text"
                      style="background-color: #b5dad4"
                      class="form-control"
                      v-model="slotProps.data.nameDescription"
                      required
                    />
                  </div>
                  <div v-else>
                    <span>{{ slotProps.data.nameDescription }}</span>
                    <span v-if="slotProps.data.nameGroup === 'Gold'" class="ml-2 text-ref">
                      {{
                        `[ ราคาอ้างอิง --> ${
                          slotProps.data.priceReference
                            ? slotProps.data.priceReference.toFixed(2)
                            : Number(0).toFixed(2)
                        } ]`
                      }}
                    </span>
                  </div>
                </template>
              </Column>

              <Column field="qty" style="width: 130px">
                <template #body="slotProps">
                  <input
                    style="background-color: #b5dad4"
                    v-model="slotProps.data.qty"
                    type="number"
                    class="form-control no-spinners text-right"
                    step="any"
                    min="0"
                    required
                    @blur="onBluePrice(slotProps.data, slotProps.index, 'qty')"
                  />
                </template>
              </Column>
              <Column field="qtyPrice" style="width: 110px">
                <template #body="slotProps">
                  <div>
                    <input
                      style="background-color: #b5dad4"
                      v-model="slotProps.data.qtyPrice"
                      type="number"
                      class="form-control text-right"
                      step="any"
                      min="0"
                      required
                      @blur="onBluePrice(slotProps.data, slotProps.index, 'qtyPrice')"
                    />
                  </div>
                </template>
              </Column>

              <Column field="qtyWeight" style="width: 110px">
                <template #body="slotProps">
                  <input
                    style="background-color: #b5dad4"
                    v-model="slotProps.data.qtyWeight"
                    type="number"
                    class="form-control text-right"
                    step="any"
                    min="0"
                    required
                    @blur="onBluePrice(slotProps.data, slotProps.index, 'qtyWeight')"
                  />
                </template>
              </Column>
              <Column field="qtyWeightPrice" style="width: 110px">
                <template #body="slotProps">
                  <div>
                    <input
                      style="background-color: #b5dad4"
                      v-model="slotProps.data.qtyWeightPrice"
                      type="number"
                      class="form-control text-right"
                      step="any"
                      min="0"
                      required
                      @blur="onBluePrice(slotProps.data, slotProps.index, 'qtyWeightPrice')"
                    />
                  </div>
                </template>
              </Column>

              <column field="totalPrice" style="width: 150px">
                <template #body="slotProps">
                  <div>
                    <input
                      v-model="slotProps.data.totalPrice"
                      class="form-control text-right"
                      min="0"
                      disabled
                    />
                  </div>
                </template>
              </column>

              <template #groupheader="slotProps">
                <div class="flex align-items-center gap-2 type-container">
                  <span><i class="bi bi-clipboard2-check mr-2"></i></span>
                  <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
                </div>
              </template>
              <template #groupfooter="slotProps">
                <div class="d-flex align-items-center justify-content-between gap-2 type-container">
                  <div>
                    <span><i class="bi bi-clipboard2-check-fill mr-2"></i></span>
                    <span>{{ $t('planUpdate.costGroup') }}</span>
                    <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
                  </div>
                  <div class="text-right mr-2">
                    {{ calculateGroupTotal(slotProps.data.nameGroup).toFixed(2) }}
                  </div>
                </div>
              </template>

              <ColumnGroup type="footer">
                <Row>
                  <column :colspan="7">
                    <template #footer>
                      <div class="text-right type-container">
                        <span>{{ $t('planUpdate.costTotal') }}</span>
                      </div>
                    </template>
                  </column>
                  <column :colspan="1">
                    <template #footer>
                      <div class="text-right type-container">
                        <span>{{ caltotalPrice(tranItems) }}</span>
                      </div>
                    </template>
                  </column>
                </Row>
              </ColumnGroup>
            </DataTable>
          </div>

          <div class="action-group-container mt-2">
            <div class="d-flex align-items-center gap-2">
              <DropdownGeneric
                v-model="masterValue"
                :options="masterType"
                optionLabel="name"
                optionValue="code"
                class="mr-2"
                :placeholder="$t('planUpdate.selectItem')"
              />
              <ButtonGeneric
                variant="green"
                icon="bi-plus"
                type="button"
                :title="$t('common.btn.add')"
                class="mt-1 mr-2"
                @click="addItem"
              />
            </div>
            <div>
              <ButtonGeneric
                variant="main"
                icon="bi-calendar-check"
                type="submit"
                class="mt-1"
                :title="$t('common.btn.save')"
              />
            </div>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs'
import _ from 'lodash'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'

import api from '@/axios/axios-helper.js'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceIsValid = {
  isValStatus: false,
  isValReceiveDate: false,
  isValGemAssignDate: false,
  isValCVDAssignDate: false
}

export default {
  components: {
    modal,
    DataTable,
    Column,
    ColumnGroup,
    Row,
    DropdownGeneric,
    ButtonGeneric
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
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
    masterStatus: {
      type: Array,
      required: true,
      default: () => []
    },
    masterGold: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  watch: {
    isShow(newVal) {
      if (newVal) {
        this.initForm(newVal)
      }
    }
  },
  computed: {
    isShowModal() {
      return this.isShow
    },
    model() {
      return this.modelValue
    },
    modelMat() {
      return this.modelMatValue
    },
    modelStatus() {
      return this.masterStatus
    },
    modelGold() {
      return this.masterGold
    }
  },
  data() {
    return {
      autoId: 0,
      status: 70,
      form: {},
      val: { ...interfaceIsValid },
      masterValue: 'ETC',
      masterType: [
        { code: 'Gold', name: this.$t('planUpdate.goldList') },
        { code: 'Gem', name: this.$t('planUpdate.materialList') },
        { code: 'Worker', name: this.$t('planUpdate.workerList') },
        { code: 'Embed', name: this.$t('planUpdate.embedList') },
        { code: 'ETC', name: this.$t('planUpdate.etcList') }
      ],
      groupOrderRunning: {
        Gold: 1,
        Worker: 2,
        Embed: 3,
        Gem: 4,
        ETC: 5
      },
      tempMatAssign: [],
      matAssign: [],
      editingRows: [],
      gemAssign: [],
      editingGemRows: [],
      workerItemSearch: [],
      gemItemSearch: [],
      tranItems: [],
      tranDiscount: []
    }
  },
  methods: {
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return date ? formatDate(date) : ''
    },
    caltotalPrice(data) {
      let total = 0
      data.forEach((item) => {
        total += Number(item.totalPrice)
      })
      return total.toFixed(2)
    },
    caltotalPriceAfterDiscount(data, discount) {
      let total = 0
      let totalDiscount = 0
      data.forEach((item) => {
        total += Number(item.price)
      })
      discount.forEach((item) => {
        totalDiscount += Number(item.price)
      })
      return total > 0 ? (total - totalDiscount).toFixed(2) : Number(0).toFixed(2)
    },
    truncateName(name, maxLength) {
      if (name.length <= maxLength) {
        return name
      }
      return name.slice(0, maxLength) + '...'
    },
    async initForm(value) {
      if (value === true) {
        this.fetchAllTransection()
      }
    },
    checkOutbound(data) {
      return !_.isEmpty(data.outboundRunning) ? true : false
    },
    onclear() {
      this.val = { ...interfaceIsValid }
    },
    closeModal() {
      this.onclear()
      this.$emit('closeModal', 'add')
    },
    onSubmit() {
      if (this.validateForm()) {
        confirmThenSubmit(
          `${this.$t('planUpdate.costCardTitle')} ${this.model.wo}-${this.model.woNumber}`,
          this.$t('planUpdate.confirmCostCard'),
          async () => {
            await this.submit()
          }
        )
      }
    },
    validateForm() {
      return true
    },
    onBluePrice(item, index, fieldName) {
      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? Number(item[fieldName]).toFixed(2) : '0.00',
        totalPrice: Number(item.qty * item.qtyPrice + item.qtyWeight * item.qtyWeightPrice).toFixed(2)
      }
      this.tranItems[index] = newCal
    },
    onBlueDiscount(item, index) {
      let newCal = {
        ...item,
        price: item.price ? Number(item.price).toFixed(2) : '0.00'
      }
      this.tranDiscount[index] = newCal
    },
    addItem() {
      this.tranItems.push({
        nameGroup: this.masterValue ?? 'ETC',
        nameDescription: '',
        date: new Date(),
        qty: 0,
        qtyPrice: Number(0).toFixed(2),
        qtyWeight: 0,
        qtyWeightPrice: Number(0).toFixed(2),
        totalPrice: Number(0).toFixed(2),
        isAdd: true
      })
      this.tranItems = _.sortBy(this.tranItems, (item) => this.groupOrderRunning[item.nameGroup])
    },
    addItemDiscount() {
      this.tranDiscount.push({
        nameGroup: 'Discount',
        nameDescription: '',
        date: new Date(),
        qty: 1,
        price: 0
      })
    },
    delItem(index) {
      this.tranItems.splice(index, 1)
    },
    delItemDiscount(index) {
      this.tranDiscount.splice(index, 1)
    },
    getGroupName(id) {
      switch (id) {
        case 'Gold':
          return this.$t('planUpdate.goldList')
        case 'Gem':
          return this.$t('planUpdate.materialList')
        case 'Worker':
          return this.$t('planUpdate.workerList')
        case 'Embed':
          return this.$t('planUpdate.embedList')
        case 'ETC':
          return this.$t('planUpdate.etcList')
        default:
          return 'Unknown'
      }
    },
    calculateGroupTotal(groupName) {
      return this.tranItems
        .filter((item) => item.nameGroup === groupName)
        .reduce((total, item) => total + Number(item.totalPrice), 0)
    },
    async submit() {
      let no = 1
      const param = {
        productionPlanId: this.model.id,
        wo: this.model.wo,
        woNumber: this.model.woNumber,
        woText: `${this.model.wo}${this.model.woNumber}`,
        item: this.tranItems.map((item) => {
          return {
            no: no++,
            name: item.isAdd ? item.nameDescription : item.name,
            nameGroup: item.nameGroup,
            nameDescription: item.nameDescription,
            date: item.date ? formatISOString(item.date) : null,
            qty: item.qty ?? 0,
            qtyPrice: item.qtyPrice ?? 0,
            qtyWeight: item.qtyWeight ?? 0,
            qtyWeightPrice: item.qtyWeightPrice ?? 0,
            totalPrice: item.totalPrice ?? 0,
            isAdd: item.isAdd
          }
        })
      }
      const res = await api.jewelry.post('ProductionPlan/CreatePrice', param)
      if (res) {
        success(``, '', () => {
          this.$emit('fetch')
        })
      }
    },
    async fetchAllTransection() {
      const res = await api.jewelry.get('ProductionPlan/GetAllTransectionPrice', {
        wo: this.model.wo,
        woNumber: this.model.woNumber
      })
      if (res) {
        this.tranItems = res.items.map((item) => {
          return {
            ...item,
            qtyWeight: item.qtyWeight ? Number(item.qtyWeight).toFixed(3) : '0.000',
            qtyPrice: item.qtyPrice ? Number(item.qtyPrice).toFixed(2) : '0.00',
            qtyWeightPrice: item.qtyWeightPrice ? Number(item.qtyWeightPrice).toFixed(2) : '0.00',
            totalPrice: Number(
              item.qty * item.qtyPrice + item.qtyWeight * item.qtyWeightPrice
            ).toFixed(2)
          }
        })

        if (this.model.priceItems) {
          const sourceItem = this.model.priceItems.find(
            (item) => item.name === 'น้ำหนักทองรวมหลังหักเพชรพลอย'
          )
          const targetItem = this.tranItems.find(
            (item) => item.name === 'น้ำหนักทองรวมหลังหักเพชรพลอย'
          )
          if (sourceItem && targetItem) {
            targetItem.qtyWeightPrice = sourceItem.qtyWeightPrice
            targetItem.priceReference = sourceItem.totalPrice
          }
        }

        this.tranItems = _.sortBy(
          this.tranItems,
          (item) => this.groupOrderRunning[item.nameGroup]
        )

        this.addItemDiscount()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.custom-input {
  margin-top: 5px !important;
}
input {
  margin-top: 0px !important;
}
:deep(.p-autocomplete .p-component) {
  margin-top: 0px !important;
}

.type-container {
  font-size: var(--fs-base);
  font-weight: bold;
  color: var(--base-font-color);
  padding: var(--sp-xs);
}
.action-group-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.text-ref {
  color: gray;
  font-size: small;
}
</style>
