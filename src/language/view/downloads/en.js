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
    step1Desc: 'Extract the downloaded zip file to a permanent folder on your machine, e.g. C:\\DKPrintBridge — do not keep it in Downloads or Desktop as it may be deleted automatically (the program must keep running whenever it is in use).',
    step2Title: 'Edit the printer name in appsettings.json',
    step2Desc: 'Open the appsettings.json file in the extracted folder and update the printer name to match the name shown in Windows (Control Panel → Devices and Printers), then save the file.',
    step3Title: 'Launch JewelryPrintBridge.exe',
    step3Desc: 'Double-click JewelryPrintBridge.exe to start the program. If a Windows SmartScreen prompt appears, click "More info" then "Run anyway". The program will install the certificate automatically on first run.',
    step4Title: 'Verify the program is running correctly',
    step4Desc: 'Leave the console window open (do not close it). Open a browser and navigate to https://localhost:9443/health — if you receive an "ok" response, the program is ready to use. Important: you must test using the exact same browser you use to open the web system, since the certificate is trusted separately in each browser.',
    step5Title: '(Recommended) Set to run automatically at startup',
    step5Desc: 'Press Win + R and type shell:startup then press Enter. Create a Shortcut to JewelryPrintBridge.exe in that folder. The program will start automatically every time your computer boots.',
    trouble1: 'Cannot connect to localhost:9443 → Check that JewelryPrintBridge.exe is running and the console window is still open.',
    trouble2: 'Cannot print / printer not found → Verify the printer name in appsettings.json matches the name shown in Windows.',
    trouble3: 'Browser shows a certificate warning → Close the program and reopen it; the certificate will be reinstalled automatically.',
    trouble4: 'The printer dropdown is empty with no names to choose → Usually caused by opening the web page before starting the program. Click "Reload list" next to the printer dropdown (no need to press F5), or click the ▼ button to see the list / type the printer name manually (check the exact name in Windows Devices and Printers).',
    trouble5: 'The web page shows "Cannot connect to the print program" even though https://localhost:9443/health returns ok → Caused by newer browsers blocking the web page from calling a local program. Use program version v1.2 or later, and if the browser shows a prompt in the address bar asking for permission to access devices/local network, click "Allow" and reload the page. (Check the program version at https://localhost:9443/config, see the version value — from v1.2 onward, the program console prints a new line every time the web page calls it; if you click a button on the web page and the console stays silent, the request never reached the machine.)'
  }
}
