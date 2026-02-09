#### ช่วยเขียนเเละดดกเไข code ตามรูปเเบบใน E:\coqo_duangkeaw\Code\jeweley-ui\CLAUDE.md เท่านั้นครับ

### สร้าง dashboard คลังสินค้า ดุตัวอย่างที่ E:\coqo_duangkeaw\Code\jeweley-ui\src\views\receipt-stock\gem\dashboard  ให้มี  filter bar เหมือนกัน ภาพรวม / รายสัปดา /วันนี้ฝรายเดือน
โดยสร้าง ui ไว้ที่ E:\coqo_duangkeaw\Code\jeweley-ui\src\views\receipt-stock\product\dashboard
### สร้าง api ก่อนครับ วางไว้ที่ E:\coqo_duangkeaw\Code\jewelry-api\Jewelry.Api\Jewelry.Service\Stock\Product\ProductService.cs ดูตัวอย่างข้อมูลที่ function list,get

ตัวอย่างข้อมูล

  {
            "stockNumber": "DK-18K-1XR-001",
            "stockNumberOrigin": "AB66048",
            "receiptNumber": "DK18K202511230001",
            "receiptType": "White Gold",
            "receiptDate": "2025-11-23T12:42:10.782368Z",
            "productNumber": "R00135M7Y21",
            "productNameEn": "18K RING D/R/S/E",
            "productNameTh": "18K RING D/R/S/E",
            "productTypeName": "แหวน",
            "productType": "R",
            "productPrice": 82300.0,
            "wo": "5203070",
            "woNumber": 30,
            "woText": "520307030",
            "productionType": "White Gold",
            "productionTypeSize": "18K",
            "productionDate": "2025-11-23T12:42:10.788063Z",
            "mold": "R-135M",
            "imageName": "R-135M",
            "imagePath": "R-135M.jpg",
            "status": "Available",
            "qty": 1.0,
            "location": null,
            "size": "#64",
            "remark": "ปรับราคา08/11/2568",
            "createDate": "2025-11-23T12:42:10.788063Z",
            "createBy": "system",
            "updateDate": null,
            "updateBy": null,
            "materials": [
                {
                    "type": "Gold",
                    "typeName": null,
                    "typeCode": "YG",
                    "typeBarcode": "5.25 g. Gold ",
                    "qty": 0.0,
                    "qtyUnit": null,
                    "weight": 5.25,
                    "weightUnit": "g.",
                    "size": null,
                    "region": null,
                    "price": 0.0
                },
                {
                    "type": "Diamond",
                    "typeName": null,
                    "typeCode": "VS,G",
                    "typeBarcode": "44Diamond0.2 ct. VS,G",
                    "qty": 44.0,
                    "qtyUnit": null,
                    "weight": 0.2,
                    "weightUnit": "ct.",
                    "size": null,
                    "region": null,
                    "price": 12800.0
                },
                {
                    "type": "Gem",
                    "typeName": null,
                    "typeCode": "Ruby",
                    "typeBarcode": "8Ruby0.34 ct.",
                    "qty": 8.0,
                    "qtyUnit": null,
                    "weight": 0.34,
                    "weightUnit": "ct.",
                    "size": " ",
                    "region": null,
                    "price": 1600.0
                },
                {
                    "type": "Gem",
                    "typeName": null,
                    "typeCode": "Sapphire",
                    "typeBarcode": "7Sapphire0.26 ct.",
                    "qty": 7.0,
                    "qtyUnit": null,
                    "weight": 0.26,
                    "weightUnit": "ct.",
                    "size": " ",
                    "region": null,
                    "price": 1900.0
                },
                {
                    "type": "Gem",
                    "typeName": null,
                    "typeCode": "Emerald",
                    "typeBarcode": "7Emerald0.19 ct.",
                    "qty": 7.0,
                    "qtyUnit": null,
                    "weight": 0.19,
                    "weightUnit": "ct.",
                    "size": " ",
                    "region": null,
                    "price": 2500.0
                }
            ]
        },

        ให้ดึงเเค่ item ที่ qty_remaining > 1 
        โดยจะเเสดงข้อมูลเเค่ภาพรวมก่อนครับ ว่ามี stockg เป็นยังไง ให้โชวืเป็น กราพ

        เเบ่งตาม  productTypeName(ประเภทสินค้า), productionType(สีของทอง/เงิน), productionTypeSize (ประเภททอง/เงิน)

