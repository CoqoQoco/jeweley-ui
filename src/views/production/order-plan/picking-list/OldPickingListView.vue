<template>
  <div class="app-container">
    <h2>ชื่อฟอร์ม</h2>
    <form>
      <div class="row">
        <div class="col-lg-2">
          <img src="@/assets/ring.jpg" class="img-responsive" />
          <input type="file" class="form-control" id="num_wo" />
        </div>
        <div class="col-lg-10">
          <div class="row">
            <div class="col-sm-6">
              <div class="form-group>">
                <label>แม่พิมพ์ : </label>
                <input type="text" class="form-control" id="num_wo" />
              </div>
              <div class="form-group>">
                <label>เลขที่ W.O. : </label>
                <input type="text" class="form-control" id="num_wo" />
              </div>
              <div class="form-group>">
                <label>ลำดับ W.O. : </label>
                <input type="text" class="form-control" id="num_wo" />
              </div>
              <div class="form-group>">
                <label>รหัสสินค้า : </label>
                <input type="text" class="form-control" id="num_wo" />
              </div>
            </div>
            <div class="col-sm-6">
              <div class="form-group>">
                <label>ใบจ่าย/รับคืนงาน : </label>
                <input type="date" class="form-control" id="num_wo" />
              </div>
              <div class="form-group>">
                <label>Require Date : </label>
                <input type="date" class="form-control" id="num_wo" />
              </div>
              <div class="form-group>">
                <label>รหัสลูกค้า : </label>
                <input type="text" class="form-control" id="num_wo" />
              </div>
              <div class="form-group>">
                <label>Remark : </label>
                <input type="text" class="form-control" id="num_wo" />
              </div>
            </div>
            <div class="col-sm-2">
              <div class="form-group>">
                <label>หน่วย : </label>
                <input type="text" class="form-control" id="num_wo" />
              </div>
            </div>
            <div class="col-sm-2">
              <div class="form-group>">
                <label>ยอดคลัง : </label>
                <input type="text" class="form-control" id="num_wo" />
              </div>
            </div>
            <div class="col-sm-2">
              <div class="form-group>">
                <label>สำเร็จรูป : </label>
                <input type="text" class="form-control" id="num_wo" />
              </div>
            </div>
            <div class="col-sm-2">
              <div class="form-group>">
                <label>กึ่งสำเร็จรูป : </label>
                <input type="text" class="form-control" id="num_wo" />
              </div>
            </div>
            <div class="col-sm-2">
              <div class="form-group>">
                <label>ต้องหล่อ : </label>
                <input type="text" class="form-control" id="num_wo" />
              </div>
            </div>
            <div class="col-sm-12"><hr /></div>
            <div class="col-sm-12">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>ขนาด</th>
                    <th>จำนวน</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><input type="text" class="form-control" id="num_wo" /></td>
                    <td><input type="text" class="form-control" id="num_wo" /></td>
                  </tr>
                </tbody>
              </table>
              <button class="btn btn-primary text-center">+</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.img-responsive {
  max-width: 100%;
  height: auto;
}
label {
  color: var(--base-font-color);
}
</style>
