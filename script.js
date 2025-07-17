let bleDevice = null;
let bleServer = null;
let bleService = null;
let bleCharacteristic = null;

const SERVICE_UUID = '12345678-1234-1234-1234-1234567890ab';
const CHARACTERISTIC_UUID = 'abcdefab-1234-1234-1234-abcdefabcdef';

const statusDiv = document.getElementById("status");
const logBox = document.getElementById("log");

document.getElementById("connect").addEventListener("click", async () => {
  try {
    statusDiv.innerText = "Status: Connecting...";

    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ name: "ESP32C3-MotorBLE" }],
      optionalServices: [SERVICE_UUID]
    });

    bleServer = await bleDevice.gatt.connect();
    bleService = await bleServer.getPrimaryService(SERVICE_UUID);
    bleCharacteristic = await bleService.getCharacteristic(CHARACTERISTIC_UUID);

    await bleCharacteristic.startNotifications();
    bleCharacteristic.addEventListener("characteristicvaluechanged", (event) => {
      const value = new TextDecoder().decode(event.target.value);
      logBox.value += `\n[ESP32] ${value}`;
      logBox.scrollTop = logBox.scrollHeight;
    });

    statusDiv.innerText = "Status: Connected ✅";
  } catch (error) {
    console.error(error);
    statusDiv.innerText = "Status: Failed to connect ❌";
  }
});

document.getElementById("send").addEventListener("click", async () => {
  const command = document.getElementById("command").value;
  if (bleCharacteristic && command) {
    const data = new TextEncoder().encode(command);
    try {
      await bleCharacteristic.writeValue(data);
      logBox.value += `\n[You] ${command}`;
      logBox.scrollTop = logBox.scrollHeight;
    } catch (error) {
      logBox.value += `\n⚠️ Write failed: ${error}`;
    }
  }
});
