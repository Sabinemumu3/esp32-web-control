let bleDevice = null;
let bleServer = null;
let bleService = null;
let bleCharacteristic = null;

// 替换为你的 UUID
const SERVICE_UUID = '12345678-1234-1234-1234-1234567890ab';
const CHARACTERISTIC_UUID = 'abcdefab-1234-1234-1234-abcdefabcdef';

document.getElementById("connect").addEventListener("click", async () => {
  try {
    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ name: 'ESP32C3-MotorBLE' }],
      optionalServices: [SERVICE_UUID]
    });

    bleServer = await bleDevice.gatt.connect();
    bleService = await bleServer.getPrimaryService(SERVICE_UUID);
    bleCharacteristic = await bleService.getCharacteristic(CHARACTERISTIC_UUID);

    await bleCharacteristic.startNotifications();
    bleCharacteristic.addEventListener("characteristicvaluechanged", (event) => {
      const value = new TextDecoder().decode(event.target.value);
      console.log("📥 BLE Data:", value);
      document.getElementById("ble-data").innerText = value;
    });

    document.getElementById("ble-data").innerText = "✅ Connected to ESP32C3-MotorBLE";
  } catch (error) {
    console.error("❌ Connection failed:", error);
    alert("Bluetooth connection failed. Please try again.");
  }
});

// 控制按钮事件绑定
document.getElementById("start").addEventListener("click", async () => {
  await sendBLECommand("START");
});

document.getElementById("stop").addEventListener("click", async () => {
  await sendBLECommand("STOP");
});

document.getElementById("reset").addEventListener("click", async () => {
  await sendBLECommand("RESET");
});

async function sendBLECommand(command) {
  if (!bleCharacteristic) {
    alert("Please connect to the device first.");
    return;
  }

  try {
    await bleCharacteristic.writeValue(new TextEncoder().encode(command));
    console.log("📤 Sent command:", command);
  } catch (error) {
    console.error("❌ Failed to send command:", error);
  }
}
