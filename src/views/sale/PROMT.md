#### ช่วยเขียนเเละเเก้ไข code ตามรูปเเบบใน E:\coqo_duangkeaw\Code\jeweley-ui\CLAUDE.md เท่านั้นครับ
#### ถ้ามีการใช้ prime-vue components >> ตรวจสอบว่ามี generic-components ไหม >> ไม่มีให้สร้างไว้เพื่อ re-used >> 
#### read and update D:\DuangKeaw\code\jeweley-ui\src\views\sale\SALES_FLOW.md


 ตรวจสอบ D:\DuangKeaw\code\jeweley-ui\src\services\helper\pdf\sale-order\sale-order-pdf-builder.js
    - อยากมให้ comment ข้อความท้ายออก อันนี้
     // Conditions
              {
                margin: [0, 10, 0, 0],
                stack: [
                  // { text: 'Price is F.O.B. Bangkok', style: 'conditionText' },
                  // { text: 'Production time within 4-6 weeks', style: 'conditionText' },
                  // { text: '50% deposit upon order, 50% balance before shipment.', style: 'conditionText' },
                  // { text: 'Gold weight, Diamond weight and Stones weight are approximately', style: 'conditionText' },
                  // { text: 'W.C.P.F.R stand for Wax, Casting, Polising, Fliding, Rhodium', style: 'conditionText' },
                  // { text: 'Minimun order 10 pcs per design', style: 'conditionText' },
                  // { text: 'The price quotation is current gold price market at www.kitco.com', style: 'conditionText' },
                  { text: 'Price is F.O.B. Bangkok not inclued freight and insurance', style: 'conditionText' },
                  { text: 'Production time within 5-7 weeks', style: 'conditionText' },
                  { text: '40% payment of tt, 60% before the shipment.', style: 'conditionText' },
                  { text: 'Gold weight, Diamond weight and Stones weight are approximately, the actual weight will be known after production is completed', style: 'conditionText' },
                  // { text: 'W.C.P.F.R stand for Wax, Casting, Polising, Fliding, Rhodium', style: 'conditionText' },
                  { text: 'Minimun order 10 pcs per design / Minimun purchase US$ 5,000', style: 'conditionText' },
                  { text: 'The price quotation is current gold price market at www.kitco.com (please confirm within 2 days)', style: 'conditionText' }
                ]
              }

     เเล้วน้ไปใว่ที่ D:\DuangKeaw\code\jeweley-ui\src\services\helper\pdf\quotation\quotation-pdf-builder.js เเทนครับ
 ### ออกเเบบ plan ที่ D:\DuangKeaw\code\jeweley-ui\src\views\sale\PLAN.md ก่อนครับ เเละรอ confirm inplement

 