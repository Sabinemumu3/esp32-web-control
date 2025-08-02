let bleDevice, bleServer, bleService, bleCharacteristic;

const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

document.getElementById("connect").onclick = async () => {
  try {
    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'Makerobo' }],
      optionalServices: [SERVICE_UUID]
    });

    bleServer = await bleDevice.gatt.connect();
    bleService = await bleServer.getPrimaryService(SERVICE_UUID);
    bleCharacteristic = await bleService.getCharacteristic(CHARACTERISTIC_UUID);
    alert("✅ Connected to Makerobo BLE!");
  } catch (error) {
    console.error(error);
    alert("❌ Failed to connect.");
  }
};

const sendCommand = async (cmd) => {
  if (!bleCharacteristic) {
    alert("Please connect first.");
    return;
  }
  const data = new TextEncoder().encode(cmd);
  await bleCharacteristic.writeValue(data);
};

document.getElementById("up").onclick = () => sendCommand("A");
document.getElementById("down").onclick = () => sendCommand("B");
document.getElementById("left").onclick = () => sendCommand("C");
document.getElementById("right").onclick = () => sendCommand("D");
document.getElementById("stop").onclick = () => sendCommand("F");
