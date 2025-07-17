let bleDevice = null;
let bleServer = null;
let bleService = null;
let bleCharacteristic = null;

const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const CHARACTERISTIC_UUID = "abcdefab-1234-1234-1234-abcdefabcdef";

document.getElementById("connect").addEventListener("click", async () => {
  try {
    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ name: "ESP32C3-MotorBLE" }],
      optionalServices: [SERVICE_UUID]
    });

    bleServer = await bleDevice.gatt.connect();
    bleService = await bleServer.getPrimaryService(SERVICE_UUID);
    bleCharacteristic = await bleService.getCharacteristic(CHARACTERISTIC_UUID);

    document.getElementById("status").textContent = "✅ Connected";

    // 接收通知
    await bleCharacteristic.startNotifications();
    bleCharacteristic.addEventListener("characteristicvaluechanged", handleNotifications);

  } catch (error) {
    console.error("BLE connection failed:", error);
    document.getElementById("status").textContent = "❌ Connection failed";
  }
});

document.getElementById("start").addEventListener("click", async () => {
  if (bleCharacteristic) {
    await bleCharacteristic.writeValue(new TextEncoder().encode("START"));
    console.log("Sent START command");
  }
});

document.getElementById("stop").addEventListener("click", async () => {
  if (bleCharacteristic) {
    await bleCharacteristic.writeValue(new TextEncoder().encode("STOP"));
    console.log("Sent STOP command");
  }
});


function handleNotifications(event) {
  const value = new TextDecoder().decode(event.target.value);
  console.log("Notification:", value);

  // 示例数据格式: X:1.23 Y:4.56 Z:7.89 ENC:123
  const match = value.match(/X:([-\d.]+)\s+Y:([-\d.]+)\s+Z:([-\d.]+)\s+ENC:(-?\d+)/i);
  if (match) {
    document.getElementById("xyz").textContent =
      `X: ${match[1]} | Y: ${match[2]} | Z: ${match[3]}`;
    document.getElementById("encoder").textContent =
      `Encoder: ${match[4]}`;
  }
}
