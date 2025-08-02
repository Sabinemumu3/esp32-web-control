let bleDevice, bleServer, bleService, bleCharacteristic;

const SERVICE_UUID = '12345678-1234-1234-1234-1234567890ab';
const CHARACTERISTIC_UUID = 'abcdefab-1234-1234-1234-abcdefabcdef';

document.getElementById("connect").addEventListener("click", async () => {
  try {
    document.getElementById("status").textContent = "🔍 Scanning for BLE devices...";
    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ name: "Makerobo" }],
      optionalServices: [SERVICE_UUID]
    });

    bleServer = await bleDevice.gatt.connect();
    bleService = await bleServer.getPrimaryService(SERVICE_UUID);
    bleCharacteristic = await bleService.getCharacteristic(CHARACTERISTIC_UUID);

    document.getElementById("status").textContent = `✅ Connected to ${bleDevice.name}`;
  } catch (error) {
    console.error(error);
    document.getElementById("status").textContent = "❌ Connection failed";
  }
});

function sendCommand(cmd) {
  if (!bleCharacteristic) {
    alert("Please connect to a BLE device first.");
    return;
  }

  const encoder = new TextEncoder();
  bleCharacteristic.writeValue(encoder.encode(cmd)).then(() => {
    console.log(`Command sent: ${cmd}`);
  }).catch(error => {
    console.error("Failed to write command:", error);
  });
}
