export const DOWNLOAD_ITEMS = [
  {
    id: 'print-bridge',
    icon: 'bi-printer',
    nameKey: 'view.downloads.printBridge.name',
    descKey: 'view.downloads.printBridge.desc',
    version: 'v1.2',
    sizeLabel: '~40 MB',
    os: 'Windows 64-bit',
    // เก็บไฟล์ที่ Azure Blob (container เดียวกับรูป — เปิด public read อยู่แล้ว)
    // repo bridge เป็น private ลูกค้าโหลดจาก GitHub Release ไม่ได้
    url: 'https://jewelrystore.blob.core.windows.net/jewelry-images/downloads/dk-print-bridge-v1.2.zip',
    hasManual: true
  }
]
