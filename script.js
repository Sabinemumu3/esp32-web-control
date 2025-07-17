let bleDevice;
let bleCharacteristic;

const SERVICE_UUID = '12345678-1234-1234-1234-1234567890ab';
const CHARACTERISTIC_UUID = 'abcdefab-1234-1234-1234-abcdefabcdef';

document.getElementById("connect").addEventListener("click", async () => {
  try {
    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ name: 'ESP32C3-MotorBLE' }],
      optionalServices: [SERVICE_UUID]
    });

    const server = await bleDevice.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);
    bleCharacteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

    await bleCharacteristic.startNotifications();
    bleCharacteristic.addEventListener("characteristicvaluechanged", handleNotifications);

    document.getElementById("status").textContent = "✅ Connected to ESP32C3-MotorBLE";
  } catch (error) {
    console.error("❌ Connection failed:", error);
    document.getElementById("status").textContent = "❌ Connection failed";
  }
});

document.getElementById("start").addEventListener("click", () => {
  if (bleCharacteristic) {
    bleCharacteristic.writeValue(new TextEncoder().encode("START"));
  }
});

document.getElementById("stop").addEventListener("click", () => {
  if (bleCharacteristic) {
    bleCharacteristic.writeValue(new TextEncoder().encode("STOP"));
  }
});

function handleNotifications(event) {
  const value = new TextDecoder().decode(event.target.value);
  console.log("📡 Received:", value);
  document.getElementById("status").textContent = "📡 Receiving Data...";
  if (value.includes("X:") && value.includes("ENC:")) {
    const parts = value.split(" ");
    const x = parts.find(p => p.startsWith("X:")) || "X:-";
    const y = parts.find(p => p.startsWith("Y:")) || "Y:-";
    const z = parts.find(p => p.startsWith("Z:")) || "Z:-";
    const enc = parts.find(p => p.startsWith("ENC:")) || "ENC:-";
    document.getElementById("xyz").textContent = `${x} | ${y} | ${z}`;
    document.getElementById("encoder").textContent = `${enc}`;
  }
}
