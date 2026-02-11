#### ช่วยเขียนเเละเเก้ไข code ตามรูปเเบบใน E:\coqo_duangkeaw\Code\jeweley-ui\CLAUDE.md เท่านั้นครับ
#### ถ้ามีการใช้ prime-vue components >> ตรวจสอบว่ามี generic-components ไหม >> ไม่มีให้สร้างไว้เพื่อ re-used >> 


 - ปรับปรุง mobile scan stcok ที่ E:\coqo_duangkeaw\Code\jeweley-ui\src\views\mobile\scan
    - ตรง scan ต้องเลือกจะจ scan อะไรครับ
    - เราจะเริ่มที่ scan สินค้า >> get api E:\coqo_duangkeaw\Code\jeweley-ui\src\stores\modules\api\stock\product-api.js fetchDataGet()
    - จะได้รายละเอียกสินค้า ให้ทำการโชว์ พร้อม image สินค้าด้วยครับ ลองดูการโชว์สินค้าที่ E:\coqo_duangkeaw\Code\jeweley-ui\src\views\stock\product\list เเต่ปรับปรุงให้เหมาะกับ mobile
    - จากนั้นให้เพิ่ม zone action ไว้ก่อนครับ เราจะมาเพิ่ม action ทีหลังว่ามีแผนสามารถทำอะไรต่อได้บ้างใน mobile feature

