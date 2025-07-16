
let bleServer = null;
let bleCharacteristic = null;

document.getElementById("connect").addEventListener("click", async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "ESP32C3" }],
      optionalServices: ["12345678-1234-1234-1234-1234567890ab"]
    });

    bleServer = await device.gatt.connect();
    const service = await bleServer.getPrimaryService("12345678-1234-1234-1234-1234567890ab");
    bleCharacteristic = await service.getCharacteristic("abcdefab-1234-1234-1234-abcdefabcdef");

    document.getElementById("status").innerText = "Status: Connected";

    bleCharacteristic.startNotifications();
    bleCharacteristic.addEventListener("characteristicvaluechanged", event => {
      const value = new TextDecoder().decode(event.target.value);
      document.getElementById("encoder").innerText = "Encoder Position: " + value;
    });

  } catch (error) {
    console.error(error);
    document.getElementById("status").innerText = "Status: Connection failed";
  }
});

function sendCommand(cmd) {
  if (!bleCharacteristic) {
    alert("Device not connected.");
    return;
  }
  bleCharacteristic.writeValue(new TextEncoder().encode(cmd));
}
