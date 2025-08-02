let bleDevice, bleServer, bleService, bleCharacteristic;

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

    document.getElementById("status").textContent = "✅ Connected to ESP32";
  } catch (error) {
    console.error("Connection failed", error);
    document.getElementById("status").textContent = "❌ Failed to connect";
  }
});

async function sendCommand(cmd) {
  if (!bleCharacteristic) {
    alert("Please connect to ESP32 first.");
    return;
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(cmd); // e.g., "ONu"
    await bleCharacteristic.writeValue(data);
    document.getElementById("status").textContent = `📤 Sent command: ${cmd}`;
  } catch (error) {
    console.error("Send failed", error);
    document.getElementById("status").textContent = "❌ Send failed";
  }
}
