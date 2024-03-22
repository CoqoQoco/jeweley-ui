<template>
  <div class="form-container">
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShow" @closeModal="onCloseModal" width="1400px">
      <template v-slot:content>
        <div class="form-content-container">
          <div class="mb-2">
            <span class="txt-title-modal">{{
              `เเก้ไขสถานะการผลิต : ${getStatusName(modelMat.status)}`
            }}</span>
          </div>
          <form v-if="showType === 1" @submit.prevent="onSubmit">
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ไขข้อมูลจ่ายงาน</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันที่จ่ายงาน</span>
                <div class="flex-group">
                  <div class="w-25 txt-desc">{{ formatDate(modelMat.sendDate) }}</div>
                  <div class="mr-2"><i class="bi bi-arrow-right"></i></div>
                  <Calendar
                    class="w-100"
                    :class="val.isValAssignDate === true ? `p-invalid` : ``"
                    v-model="form.assignDate"
                    dateFormat="dd/mm/yy"
                    showIcon
                    showButtonBar
                  />
                </div>
              </div>
              <div>
                <span class="txt-title">ผู้จ่ายงาน</span>
                <input type="text" class="form-control" v-model="form.assignBy" required />
              </div>
            </div>
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ไขข้อมูลรับงาน</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันที่รับงาน</span>
                <div class="flex-group">
                  <div class="w-25 txt-desc">{{ formatDate(modelMat.checkDate) }}</div>
                  <div class="mr-2"><i class="bi bi-arrow-right"></i></div>
                  <Calendar
                    class="w-100"
                    :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                    v-model="form.receiveDate"
                    dateFormat="dd/mm/yy"
                    showIcon
                    showButtonBar
                  />
                </div>
              </div>
              <div>
                <span class="txt-title">ผู้รับงาน</span>
                <input type="text" class="form-control" v-model="form.receiveBy" />
              </div>
            </div>
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ไขรายละเอียด</span>
            </div>
            <div class="form-content-row-grid-container">
              <DataTable
                class="p-datatable-sm"
                showGridlines
                v-model:editingRows="editingRows"
                :value="mat"
                editMode="row"
                dataKey="id"
                scrollable
                @row-edit-save="onRowEditSave"
                :pt="{
                  table: { style: 'min-width: 50rem' },
                  column: {
                    bodycell: ({ state }) => ({
                      style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                    })
                  }
                }"
              >
                <Column style="width: 20px">
                  <template #body="prop">
                    <div
                      class="btn btn-sm btn-danger text-center w-100"
                      @click="onDelGold(prop.data)"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </div>
                  </template>
                </Column>
                <!-- <Column field="id" header="ID" style="width: 10%">
                    <template #editor="{ data, field }">
                      <input type="number" class="form-control" v-model="data[field]" disabled />
                    </template>
                  </Column> -->
                <Column field="gold" header="ทอง" style="width: 100px">
                  <template #editor="{ data, field }">
                    <!-- <input type="text" class="form-control" v-model="data[field]" /> -->
                    <Dropdown
                      v-model="data[field]"
                      :options="masterGold"
                      optionLabel="code"
                      optionValue="code"
                      class="w-full md:w-14rem"
                      placeholder="เลือกทอง"
                    >
                      <!-- :showClear="data[field] ? true : false" -->
                      <!-- <template #option="slotProps">
                          <Tag
                            :value="slotProps.option.value"
                            :severity="getStatusLabel(slotProps.option.value)"
                          />
                        </template> -->
                    </Dropdown>
                  </template>
                </Column>
                <Column field="requestDate" header="วันที่" style="min-width: 120px">
                  <template #editor="{ data, field }">
                    <div>
                      <Calendar
                        class="w-100"
                        v-model="data[field]"
                        dateFormat="dd/mm/yy"
                        showIcon
                        showButtonBar
                      />
                    </div>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.requestDate">
                      {{ formatDate(slotProps.data.requestDate) }}
                    </div>
                  </template>
                </Column>
                <Column field="goldQTYSend" header="จำนวนจ่าย" style="width: 100px">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="goldWeightSend" header="น้ำหนักจ่าย" style="width: 100px">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      step="any"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="goldQTYCheck" header="จำนวนรับ" style="width: 100px">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                      @change="calTotalWages(data)"
                    />
                  </template>
                </Column>
                <Column field="wages" header="ค่าเเรงต่อชิ้น" style="min-width: 100px">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      class="form-control"
                      v-model="data[field]"
                      :disabled="!data.goldQTYCheck"
                      @change="calTotalWages(data)"
                    />
                  </template>
                </Column>
                <Column field="goldWeightCheck" header="น้ำหนักรับ" style="width: 100px">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      step="any"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="description" header="รายละเอียด" style="width: 150px">
                  <template #editor="{ data, field }">
                    <input
                      type="text"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column
                  field="workers"
                  :header="modelMat.status === 90 ? `ช่างขัด` : `ช่างรับงาน`"
                  style="min-width: 150px"
                >
                  <template #editor="{ data, field }">
                    <!-- <input
                      type="text"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    /> -->
                    <AutoComplete
                      v-model="data[field]"
                      :suggestions="workerItemSearch"
                      @complete="onSearchWorker"
                      placeholder="กรอกรหัส/ชื่อช่าง...."
                      :class="data[field] ? `` : `bg-warning`"
                      optionLabel="code"
                      forceSelection
                    >
                      <template #option="slotProps">
                        <div class="flex align-options-center">
                          <div>{{ `${slotProps.option.code} - ${slotProps.option.nameTh}` }}</div>
                        </div>
                      </template>
                    </AutoComplete>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.workers">
                      {{ `${slotProps.data.workers.code} - ${slotProps.data.workers.nameTh}` }}
                    </div>
                  </template>
                </Column>
                <Column
                  v-if="modelMat.status === 90"
                  field="workersSub"
                  header="ช่างชุบ"
                  style="min-width: 150px"
                >
                  <template #editor="{ data, field }">
                    <!-- <input
                      type="text"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    /> -->
                    <AutoComplete
                      v-model="data[field]"
                      :suggestions="workerItemSearch"
                      @complete="onSearchWorker"
                      placeholder="กรอกรหัส/ชื่อช่าง...."
                      :class="data[field] ? `` : `bg-warning`"
                      optionLabel="code"
                      forceSelection
                    >
                      <template #option="slotProps">
                        <div class="flex align-options-center">
                          <div>{{ `${slotProps.option.code} - ${slotProps.option.nameTh}` }}</div>
                        </div>
                      </template>
                    </AutoComplete>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.workersSub">
                      {{
                        `${slotProps.data.workersSub.code} - ${slotProps.data.workersSub.nameTh}`
                      }}
                    </div>
                  </template>
                </Column>
                <Column field="totalWages" header="รวมค่าแรงช่าง" style="width: 120px">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      class="form-control"
                      v-model="data[field]"
                      disabled
                    />
                  </template>
                </Column>
                <Column
                  :rowEditor="true"
                  style="width: 10%; min-width: 7rem"
                  bodyStyle="text-align:center"
                >
                </Column>
                <template #footer>
                  <div class="d-flex justify-content-between">
                    <div>ทั้งหมด {{ this.mat.length }} รายการ</div>
                    <div @click="addMat">
                      <i class="bi bi-plus-square-fill"></i>
                    </div>
                  </div>
                </template>
              </DataTable>
            </div>
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ไขมูลเพิ่มเติม</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">หมายเหตุ - 1</span>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div>
                <span class="txt-title">หมายเหตุ - 2</span>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button
                class="btn btn-sm btn-dark btn-custom mr-2"
                type="button"
                @click="onCloseModal"
              >
                ยกเลิกเเก้ไขสถานะการผลิต
              </button>
              <button class="btn btn-sm btn-warning btn-custom" type="submit">
                ยืนยันเเก้ไขสถานะการผลิต
              </button>
            </div>
          </form>
          <form v-if="showType === 2" @submit.prevent="onSubmit">
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ไขข้อมูลคัดพลอย</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันคัดพลอย</span>
                <div class="flex-group">
                  <div class="w-25 txt-desc">{{ formatDate(modelMat.checkDate) }}</div>
                  <div class="mr-2"><i class="bi bi-arrow-right"></i></div>
                  <Calendar
                    class="w-100"
                    :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                    v-model="form.receiveDate"
                    dateFormat="dd/mm/yy"
                    showIcon
                    showButtonBar
                  />
                </div>
              </div>
              <div>
                <span class="txt-title">ผู้คัดพลอย</span>
                <input type="text" class="form-control" v-model="form.receiveBy" required />
              </div>
            </div>
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ไขรายละเอียด</span>
            </div>
            <div class="form-content-row-grid-container">
              <DataTable
                class="p-datatable-sm"
                showGridlines
                v-model:editingRows="editingRows"
                :value="mat"
                editMode="row"
                dataKey="id"
                @row-edit-save="onRowEditSave"
                :pt="{
                  table: { style: 'min-width: 50rem' },
                  column: {
                    bodycell: ({ state }) => ({
                      style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                    })
                  }
                }"
              >
                <Column style="width: 20px">
                  <template #body="prop">
                    <div
                      class="btn btn-sm btn-danger text-center w-100"
                      @click="onDelGold(prop.data)"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </div>
                  </template>
                </Column>
                <Column field="gold" header="ทอง">
                  <template #editor="{ data, field }">
                    <Dropdown
                      v-model="data[field]"
                      :options="masterGold"
                      optionLabel="code"
                      optionValue="code"
                      class="w-full md:w-14rem"
                      placeholder="เลือกทอง"
                    >
                    </Dropdown>
                  </template>
                </Column>
                <Column field="requestDate" header="วันที่">
                  <template #editor="{ data, field }">
                    <div>
                      <Calendar
                        class="w-100"
                        v-model="data[field]"
                        dateFormat="dd/mm/yy"
                        showIcon
                        showButtonBar
                      />
                    </div>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.requestDate">
                      {{ formatDate(slotProps.data.requestDate) }}
                    </div>
                  </template>
                </Column>
                <Column field="goldQTYCheck" header="จำนวน">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="goldWeightCheck" header="น้ำหนัก">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      step="any"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="workers" header="ช่างคัดพลอ">
                  <template #editor="{ data, field }">
                    <!-- <input
                      type="text"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    /> -->
                    <AutoComplete
                      v-model="data[field]"
                      :suggestions="workerItemSearch"
                      @complete="onSearchWorker"
                      placeholder="กรอกรหัส/ชื่อช่าง...."
                      :class="data[field] ? `` : `bg-warning`"
                      optionLabel="code"
                      forceSelection
                    >
                      <template #option="slotProps">
                        <div class="flex align-options-center">
                          <div>{{ `${slotProps.option.code} - ${slotProps.option.nameTh}` }}</div>
                        </div>
                      </template>
                    </AutoComplete>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.workers">
                      {{ `${slotProps.data.workers.code} - ${slotProps.data.workers.nameTh}` }}
                    </div>
                  </template>
                </Column>
                <Column field="workersSub" header="ช่างคัดเพชร">
                  <template #editor="{ data, field }">
                    <!-- <input
                      type="text"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    /> -->
                    <AutoComplete
                      v-model="data[field]"
                      :suggestions="workerItemSearch"
                      @complete="onSearchWorker"
                      placeholder="กรอกรหัส/ชื่อช่าง...."
                      :class="data[field] ? `` : `bg-warning`"
                      optionLabel="code"
                      forceSelection
                    >
                      <template #option="slotProps">
                        <div class="flex align-options-center">
                          <div>{{ `${slotProps.option.code} - ${slotProps.option.nameTh}` }}</div>
                        </div>
                      </template>
                    </AutoComplete>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.workersSub">
                      {{
                        `${slotProps.data.workersSub.code} - ${slotProps.data.workersSub.nameTh}`
                      }}
                    </div>
                  </template>
                </Column>
                <Column
                  :rowEditor="true"
                  style="width: 10%; min-width: 8rem"
                  bodyStyle="text-align:center"
                ></Column>
                <template #footer>
                  <div class="d-flex justify-content-between">
                    <div>ทั้งหมด {{ this.mat.length }} รายการ</div>
                    <div @click="addMat">
                      <i class="bi bi-plus-square-fill"></i>
                    </div>
                  </div>
                </template>
              </DataTable>
            </div>
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ไขค่าเเรง</span>
            </div>
            <div class="form-content-row-price-container">
              <div>
                <span class="txt-title">ค่าเเรงคัดพลอย</span>
                <input type="number" step="any" class="form-control" v-model="form.totalWages" />
              </div>
            </div>
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ไขข้อมูลเพิ่มเติม</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">หมายเหตุ - 1</span>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div>
                <span class="txt-title">หมายเหตุ - 2</span>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button
                class="btn btn-sm btn-dark btn-custom mr-2"
                type="button"
                @click="onCloseModal"
              >
                ยกเลิกเเก้ไขสถานะการผลิต
              </button>
              <button class="btn btn-sm btn-warning btn-custom" type="submit">
                ยืนยันเเก้ไขสถานะการผลิต
              </button>
            </div>
          </form>
          <form v-if="showType === 3" @submit.prevent="onSubmit">
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ไขข้อมูลตรวจ CVD</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันตรวจ CVD</span>
                <div class="flex-group">
                  <div class="w-25 txt-desc">{{ formatDate(modelMat.checkDate) }}</div>
                  <div class="mr-2"><i class="bi bi-arrow-right"></i></div>
                  <Calendar
                    class="w-100"
                    :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                    v-model="form.receiveDate"
                    dateFormat="dd/mm/yy"
                    showIcon
                    showButtonBar
                  />
                </div>
              </div>
              <div>
                <span class="txt-title">ผู้ตรวจ CVD</span>
                <input type="text" class="form-control" v-model="form.receiveBy" required />
              </div>
            </div>

            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ไขข้อมูลเพิ่มเติม</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">หมายเหตุ - 1</span>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div>
                <span class="txt-title">หมายเหตุ - 2</span>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button
                class="btn btn-sm btn-dark btn-custom mr-2"
                type="button"
                @click="onCloseModal"
              >
                ยกเลิกเเก้ไขสถานะการผลิต
              </button>
              <button class="btn btn-sm btn-warning btn-custom" type="submit">
                ยืนยันเเก้ไขสถานะการผลิต
              </button>
            </div>
          </form>
          <form v-if="showType === 4" @submit.prevent="onSubmit">
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ไขข้อมูลหล่องานเสร็จ</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันหล่องาน</span>
                <div class="flex-group">
                  <div class="w-25 txt-desc">{{ formatDate(modelMat.checkDate) }}</div>
                  <div class="mr-2"><i class="bi bi-arrow-right"></i></div>
                  <Calendar
                    class="w-100"
                    :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                    v-model="form.receiveDate"
                    dateFormat="dd/mm/yy"
                    showIcon
                    showButtonBar
                  />
                </div>
              </div>
              <div>
                <span class="txt-title">ผู้หล่องาน</span>
                <input type="text" class="form-control" v-model="form.receiveBy" required />
              </div>
            </div>
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ไขรายละเอียด</span>
            </div>
            <div class="form-content-row-grid-container">
              <DataTable
                class="p-datatable-sm"
                showGridlines
                v-model:editingRows="editingRows"
                :value="mat"
                editMode="row"
                dataKey="id"
                @row-edit-save="onRowEditSave"
                :pt="{
                  table: { style: 'min-width: 50rem' },
                  column: {
                    bodycell: ({ state }) => ({
                      style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                    })
                  }
                }"
              >
                <Column style="width: 20px">
                  <template #body="prop">
                    <div
                      class="btn btn-sm btn-danger text-center w-100"
                      @click="onDelGold(prop.data)"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </div>
                  </template>
                </Column>
                <Column field="gold" header="ทอง">
                  <template #editor="{ data, field }">
                    <Dropdown
                      v-model="data[field]"
                      :options="masterGold"
                      optionLabel="code"
                      optionValue="code"
                      class="w-full md:w-14rem"
                      placeholder="เลือกทอง"
                    >
                    </Dropdown>
                  </template>
                </Column>
                <Column field="requestDate" header="วันที่">
                  <template #editor="{ data, field }">
                    <div>
                      <Calendar
                        class="w-100"
                        v-model="data[field]"
                        dateFormat="dd/mm/yy"
                        showIcon
                        showButtonBar
                      />
                    </div>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.requestDate">
                      {{ formatDate(slotProps.data.requestDate) }}
                    </div>
                  </template>
                </Column>
                <Column field="goldQTYCheck" header="จำนวน">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="goldWeightCheck" header="น้ำหนัก">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      step="any"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column
                  :rowEditor="true"
                  style="width: 10%; min-width: 8rem"
                  bodyStyle="text-align:center"
                ></Column>
                <template #footer>
                  <div class="d-flex justify-content-between">
                    <div>ทั้งหมด {{ this.mat.length }} รายการ</div>
                    <div @click="addMat">
                      <i class="bi bi-plus-square-fill"></i>
                    </div>
                  </div>
                </template>
              </DataTable>
            </div>
            <!-- <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ไขค่าเเรง</span>
            </div> -->
            <!-- <div class="form-content-row-price-container">
              <div>
                <span class="txt-title">ค่าเเรงคัดพลอย</span>
                <input type="number" step="any" class="form-control" v-model="form.totalWages" />
              </div>
            </div> -->
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ไขข้อมูลเพิ่มเติม</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">หมายเหตุ - 1</span>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div>
                <span class="txt-title">หมายเหตุ - 2</span>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button
                class="btn btn-sm btn-dark btn-custom mr-2"
                type="button"
                @click="onCloseModal"
              >
                ยกเลิกเเก้ไขสถานะการผลิต
              </button>
              <button class="btn btn-sm btn-warning btn-custom" type="submit">
                ยืนยันเเก้ไขสถานะการผลิต
              </button>
            </div>
          </form>
          <form v-if="showType === 5" @submit.prevent="onSubmit">
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ข้อมูลประเมินราคา</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันประเมินราคา</span>
                <div class="flex-group">
                  <div class="w-25 txt-desc">{{ formatDate(modelMat.checkDate) }}</div>
                  <div class="mr-2"><i class="bi bi-arrow-right"></i></div>
                  <Calendar
                    class="w-100"
                    :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                    v-model="form.receiveDate"
                    dateFormat="dd/mm/yy"
                    showIcon
                    showButtonBar
                  />
                </div>
              </div>
              <div>
                <span class="txt-title">ผู้ประเมินราคา</span>
                <input type="text" class="form-control" v-model="form.receiveBy" required />
              </div>
            </div>

            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>เเก้ไขข้อมูลเพิ่มเติม</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">หมายเหตุ - 1</span>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div>
                <span class="txt-title">หมายเหตุ - 2</span>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button
                class="btn btn-sm btn-dark btn-custom mr-2"
                type="button"
                @click="onCloseModal"
              >
                ยกเลิกเเก้ไขสถานะการผลิต
              </button>
              <button class="btn btn-sm btn-warning btn-custom" type="submit">
                ยืนยันเเก้ไขสถานะการผลิต
              </button>
            </div>
          </form>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import AutoComplete from 'primevue/autocomplete'
import moment from 'dayjs'

import swAlert from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-config.js'
import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs'

// const interfaceMat = {
//   gold: null,
//   goldQTYSend: null,
//   goldWeightSend: null,
//   goldQTYCheck: null,
//   goldWeightCheck: null,
//   worker: null
// }
const interfaceForm = {
  status: null,
  assignDate: null,
  assignBy: null,
  receiveDate: null,
  receiveBy: null,
  assignTo: null,
  wages: null,
  remark1: null,
  remark2: null,
  totalWages: null
}
const interfaceVal = {
  isValStatus: false,
  isValAssignDate: false,
  isValReceiveDate: false,
  isValGemAssignDate: false,
  isValCVDAssignDate: false
}

export default {
  components: {
    modal,
    loading,
    Calendar,
    Dropdown,
    DataTable,
    Column,
    AutoComplete
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
      type: Object,
      required: true,
      default: () => {}
    },
    masterGold: {
      type: Array,
      required: true,
      default: () => []
    },
    masterStatus: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    model() {
      return this.modelValue
    },
    modelMat() {
      console.log('modelMatValue', this.modelMatValue)
      return this.modelMatValue
    },
    modelMasterStatus() {
      return this.masterStatus
    }
  },
  watch: {
    async modelMatValue(value) {
      //onsole.log(value)
      this.autoId = 0
      if (value.tbtProductionPlanStatusDetail) {
        this.mat = await Promise.all(
          value.tbtProductionPlanStatusDetail.map(async (thing) => {
            return {
              id: ++this.autoId,
              gold: thing.gold,
              goldQTYSend: thing.goldQtySend,
              goldWeightSend: thing.goldWeightSend,
              goldQTYCheck: thing.goldQtyCheck,
              goldWeightCheck: thing.goldWeightCheck,
              description: thing.description,
              workers: await this.onSearchWorkerByCode(thing.worker),
              workersSub: await this.onSearchWorkerByCode(thing.workerSub),
              worker: thing.worker,
              workerSub: thing.workerSub,
              wages: thing.wages,
              totalWages: thing.totalWages,
              requestDate: new Date(thing.requestDate)
            }
          })
        )
        //console.log(this.mat)
      }

      //console.log(this.mat)
      this.onSelectType(value.status)
      this.form = {
        assignDate: value.sendDate ? new Date(value.sendDate) : null,
        assignBy: value.sendName,
        receiveBy: value.checkName,
        receiveDate: value.checkDate ? new Date(value.checkDate) : null,
        remark1: value.remark1,
        remark2: value.remark2,
        totalWages: value.wagesTotal
      }
    }
  },
  data() {
    return {
      // --- flag --- //
      isLoading: false,
      showType: 0,
      autoId: 0,

      // --- form --- //
      form: {
        ...interfaceForm
      },
      val: {
        ...interfaceVal
      },
      mat: [],
      editingRows: [],
      workerItemSearch: []
    }
  },
  methods: {
    // --- controller --- //
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return date ? formatDate(date) : ''
    },
    showDate(date) {
      return date ? moment(date).format('DD/MM/yyyy') : ''
    },
    onCloseModal() {
      this.$emit('closeModal')
    },
    onSelectType(status) {
      if (status) {
        if (status === 50 || status === 60 || status === 80 || status === 90) {
          this.showType = 1
        } else if (status === 70) {
          this.showType = 2
        } else if (status === 85) {
          this.showType = 3
        } else if (status === 55) {
          this.showType = 4
        } else if (status === 95) {
          this.showType = 5
        }
      } else {
        this.showType = 0
      }
    },
    getStatusName(id) {
      if (this.modelMasterStatus.length) {
        const status = this.modelMasterStatus.filter((x) => x.id === id)
        return status[0].nameTh
      } else {
        const status = this.masterStatusFetch.filter((x) => x.id === id)
        return status[0].nameTh
      }
    },
    onSubmit() {
      swAlert.confirmSubmit(
        ``,
        '',
        async () => {
          this.submit()
        },
        null,
        null
      )
    },
    calTotalWages(data) {
      data.totalWages = data.wages * (data.goldQTYCheck ?? 0)
      //console.log(data.totalWages)
    },

    // ----------- Grid -------------------//
    onRowEditSave(event) {
      let { newData, index } = event
      this.mat[index] = newData
    },
    onDelGold(item) {
      const index = this.mat.indexOf(item)
      this.mat.splice(index, 1)
    },
    addMat() {
      const add = {
        id: ++this.autoId,
        gold: 'YG',
        goldQTYSend: null,
        goldWeightSend: null,
        goldQTYCheck: null,
        goldWeightCheck: null,
        worker: null,
        workerSub: null,
        wages: null
      }
      this.mat.push(add)
    },

    // --- APIs --- //
    async submit() {
      try {
        this.isLoading = true
        //console.log(this.form.assignDate)
        this.mat = this.mat.map((item) => {
          return {
            ...item,
            worker: item.workers?.code,
            workerSub: item.workersSub?.code
          }
        })

        const param = {
          wo: this.model.wo,
          woNumber: this.model.woNumber,
          productionPlanId: this.model.id,
          HeaderId: this.modelMat.id,

          status: this.modelMat.status,
          sendName: this.form.assignBy,
          sendDate: this.form.assignDate ? formatISOString(this.form.assignDate) : null,
          checkName: this.form.receiveBy,
          checkDate: this.form.receiveDate ? formatISOString(this.form.receiveDate) : null,
          remark1: this.form.remark1,
          remark2: this.form.remark2,
          totalWages: this.form.totalWages,
          golds: [...this.mat]
        }

        //console.log(param)
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanUpdateStatusDetail', param)
        if (res) {
          swAlert.success(
            ``,
            '',
            () => {
              this.form = {
                ...interfaceForm
              }
              this.val = {
                ...interfaceVal
              }
              this.mat = []
              this.showType = 0
              this.$emit('fetch')
            },
            null,
            null
          )
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },
    async onSearchWorker(e) {
      try {
        //this.isLoading = true
        //console.log(this.formValue)
        const params = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null,
            type: this.form.status,
            active: 1
          }
        }
        const res = await api.jewelry.post('Worker/Search', params)
        if (res) {
          //console.log(res)
          this.workerItemSearch = [...res.data]
          //this.workerItemSearch = res.data.map((x) => `${x.code} : ${x.nameTh}`)
        }
        //this.isLoading = false
      } catch (error) {
        console.log(error)
        //this.isLoading = false
      }
    },
    async onSearchWorkerByCode(e) {
      try {
        if (e === null) {
          return null
        }
        //this.isLoading = true
        //console.log(this.formValue)
        const params = {
          take: 0,
          skip: 0,
          search: {
            code: e,
            text: null,
            type: null,
            active: 0
          }
        }
        const res = await api.jewelry.post('Worker/Search', params)
        if (res) {
          //console.log(res.data[0])
          return res.data[0]
        } else {
          return null
        }
        //this.isLoading = false
      } catch (error) {
        console.log(error)
        //this.isLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(input) {
  margin-top: 0px !important;
}
:deep(.p-dropdown) {
  height: 35px !important;
  padding-left: 5px;
  width: 100% !important;
  margin-top: 0px !important;
}
:deep(.p-calendar) {
  height: 35px;
  margin-top: 0px !important;
}
.form-content-container {
  padding: 20px 20px;
  overflow: auto;
  //height: 650px;
}
.form-content-row-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  padding: 0px 30px;
}
.form-content-row-grid-container {
  display: grid;
  //grid-template-columns: 1fr;
  //gap: 50px;
  padding: 0px 30px;
}
.form-content-row-price-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 50px;
  padding: 0px 30px;
}
.txt-title-part {
  padding-left: 30px;
  padding-top: 10px;
  font-size: 14px;
  color: var(--base-font-color);
}
.txt-title-modal {
  padding: 30px;
  font-size: 20px;
  color: var(--base-font-color);
}
.txt-title {
  font-size: 12px;
}
.flex-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
