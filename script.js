let bleDevice, bleServer, bleService, bleCharacteristic;

const SERVICE_UUID = '12345678-1234-1234-1234-1234567890ab';
const CHARACTERISTIC_UUID = 'abcdefab-1234-1234-1234-abcdefabcdef';

const status = document.getElementById("status");
const logBox = document.getElementById("log");

function log(msg) {
  logBox.value += msg + "\n";
  logBox.scrollTop = logBox.scrollHeight;
}

async function connectBLE() {
  try {
    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ name: "ESP32C3-MotorBLE" }],
      optionalServices: [SERVICE_UUID]
    });

    bleServer = await bleDevice.gatt.connect();
    bleService = await bleServer.getPrimaryService(SERVICE_UUID);
    bleCharacteristic = await bleService.getCharacteristic(CHARACTERISTIC_UUID);

    await bleCharacteristic.startNotifications();
    bleCharacteristic.addEventListener("characteristicvaluechanged", event => {
      const value = new TextDecoder().decode(event.target.value);
      log("[ESP32] " + value);
    });

    status.textContent = "✅ Connected";
    log("✅ Connected to ESP32C3-MotorBLE");
  } catch (err) {
    status.textContent = "❌ Failed to connect";
    log("❌ Connection failed: " + err);
  }
}

async function sendCommand(cmd) {
  if (bleCharacteristic && cmd) {
    await bleCharacteristic.writeValue(new TextEncoder().encode(cmd));
    log("[You] " + cmd);
  } else {
    log("⚠️ Not connected.");
  }
}

document.getElementById("connect").addEventListener("click", connectBLE);
document.getElementById("start").addEventListener("click", () => sendCommand("START"));
document.getElementById("stop").addEventListener("click", () => sendCommand("STOP"));
document.getElementById("calibrate").addEventListener("click", () => sendCommand("CALIBRATE"));
document.getElementById("send").addEventListener("click", () => {
  const cmd = document.getElementById("command").value.trim();
  sendCommand(cmd);
});
