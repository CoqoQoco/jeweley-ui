#### ช่วยเขียนเเละเเก้ไข code ตามรูปเเบบใน E:\coqo_duangkeaw\Code\jeweley-ui\CLAUDE.md เท่านั้นครับ
#### ถ้ามีการใช้ prime-vue components >> ตรวจสอบว่ามี generic-components ไหม >> ไม่มีให้สร้างไว้เพื่อ re-used >> สร้างเเละเช็ค ที่ E:\coqo_duangkeaw\Code\jeweley-ui\src\components\prime-vue
###  update E:\coqo_duangkeaw\Code\jeweley-ui\src\views\stock\product\list\stock-product-list.md


ปรับปรุง list inventory ดังนี้
 - เขียน api จาก E:\coqo_duangkeaw\Code\jewelry-api\Jewelry.Api\Jewelry.Api\Controllers\Stock\StockProductController.cs
    1 GetStockCostDetail
    2 GetProductCostDetailVersion

    เขียนที่ E:\coqo_duangkeaw\Code\jeweley-ui\src\stores\modules\api\stock\product-api.js
 

  - เพิ่ม btn ใน action ที่ E:\coqo_duangkeaw\Code\jeweley-ui\src\views\stock\product\list\components\data-table-view.vue

    1 ดูต้นทุนสินค้า (GetStockCostDetail) ดึง api เพื่อเเสดงต้นทุนสิน สามารถโชว์เหมือนหน้า ตีราคาได้เลยครับ เเต่จะเป็น readonly เท่านั้น
    2 ดูปรัวัติตีราคา เเต่จะ สามารถ return มาหลาย version สามารถเลือกดูได้ว่าจะดู การตีราคา version ไหน เป็น readonly เหมือนกันครับ

    ลองช่วยออกเเบบ เเละแผนก่อนครับ