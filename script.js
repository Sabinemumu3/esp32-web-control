let bleDevice = null;
let bleServer = null;
let bleService = null;
let bleCharacteristic = null;

const SERVICE_UUID = '12345678-1234-1234-1234-1234567890ab';
const CHARACTERISTIC_UUID = 'abcdefab-1234-1234-1234-abcdefabcdef';

async function connectBLE() {
  try {
    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ name: 'ESP32C3-MotorBLE' }],
      optionalServices: [SERVICE_UUID]
    });

    bleServer = await bleDevice.gatt.connect();
    bleService = await bleServer.getPrimaryService(SERVICE_UUID);
    bleCharacteristic = await bleService.getCharacteristic(CHARACTERISTIC_UUID);

    await bleCharacteristic.startNotifications();
    bleCharacteristic.addEventListener("characteristicvaluechanged", handleNotify);

    document.getElementById("status").innerText = "✅ Connected";
  } catch (error) {
    console.error("Connection failed", error);
    document.getElementById("status").innerText = "❌ Connection failed";
  }
}

function handleNotify(event) {
  const value = new TextDecoder().decode(event.target.value);
  document.getElementById("data").innerText = value;
}

async function sendCommand(cmd) {
  if (!bleCharacteristic) return;
  try {
    const encoder = new TextEncoder();
    await bleCharacteristic.writeValue(encoder.encode(cmd));
    console.log("Command sent:", cmd);
  } catch (err) {
    console.error("Write failed:", err);
  }
}

document.getElementById("connectBtn").addEventListener("click", connectBLE);
document.getElementById("startBtn").addEventListener("click", () => sendCommand("START"));
document.getElementById("stopBtn").addEventListener("click", () => sendCommand("STOP"));
