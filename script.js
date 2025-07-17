let bleDevice = null;
let bleServer = null;
let bleService = null;
let bleCharacteristic = null;

// 替换为你的实际 UUID
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
    bleCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);

    document.getElementById("status").textContent = "Status: Connected";
  } catch (error) {
    console.error("Connection failed", error);
    document.getElementById("status").textContent = "Status: Connection failed";
  }
});

function handleNotifications(event) {
  const value = new TextDecoder().decode(event.target.value);
  const parts = value.trim().split(',');

  if (parts.length >= 2) {
    document.getElementById("encoder").textContent = `Encoder Position: ${parts[0]}`;
    document.getElementById("accel").textContent = `Accel: ${parts[1]}`;
  } else {
    document.getElementById("encoder").textContent = `Received: ${value}`;
  }
}

document.getElementById("forward").addEventListener("click", () => {
  sendCommand("F");
});

document.getElementById("backward").addEventListener("click", () => {
  sendCommand("B");
});

function sendCommand(cmd) {
  if (!bleCharacteristic) {
    alert("Not connected");
    return;
  }

  bleCharacteristic.writeValue(new TextEncoder().encode(cmd))
    .catch(err => console.error("Write failed", err));
}
