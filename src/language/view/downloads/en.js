export default {
  pageTitle: 'Download Programs',
  manualBtn: 'Manual',
  printBridge: {
    name: 'DK Print Bridge',
    desc: 'A bridge program for printing labels and documents from the system to your local printer. Install once, use anytime.'
  },
  manual: {
    title: 'User Manual — DK Print Bridge',
    sectionInstall: 'A) Installation & Configuration Steps',
    sectionTrouble: 'B) Common Issues',
    step1Title: 'Extract the ZIP file to a permanent folder',
    step1Desc: 'Extract dk-print-bridge-v1.0.zip to a permanent folder on your machine, e.g. C:\\DKPrintBridge — do not keep it in Downloads or Desktop as it may be deleted automatically.',
    step2Title: 'Edit the printer name in appsettings.json',
    step2Desc: 'Open the appsettings.json file in the extracted folder and update the printer name to match the name shown in Windows (Control Panel → Devices and Printers), then save the file.',
    step3Title: 'Launch JewelryPrintBridge.exe',
    step3Desc: 'Double-click JewelryPrintBridge.exe to start the program. If a Windows SmartScreen prompt appears, click "More info" then "Run anyway". The program will install the certificate automatically on first run.',
    step4Title: 'Verify the program is running correctly',
    step4Desc: 'Leave the console window open (do not close it). Open a browser and navigate to https://localhost:9443/health — if you receive an "ok" response, the program is ready to use.',
    step5Title: '(Recommended) Set to run automatically at startup',
    step5Desc: 'Press Win + R and type shell:startup then press Enter. Create a Shortcut to JewelryPrintBridge.exe in that folder. The program will start automatically every time your computer boots.',
    trouble1: 'Cannot connect to localhost:9443 → Check that JewelryPrintBridge.exe is running and the console window is still open.',
    trouble2: 'Cannot print / printer not found → Verify the printer name in appsettings.json matches the name shown in Windows.',
    trouble3: 'Browser shows a certificate warning → Close the program and reopen it; the certificate will be reinstalled automatically.'
  }
}
