// ===== ESP32-C3 Web BLE Dashboard (script.js) =====
// Works with the HTML/CSS structure I gave you.
// Matches the UUIDs and device name used in your Arduino sketch.

let bleDevice = null;
let bleServer = null;
let bleService = null;
let bleCharacteristic = null;

const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const CHARACTERISTIC_UUID = "abcdefab-1234-1234-1234-abcdefabcdef";

const els = {
  status: document.getElementById("status"),
  btnConnect: document.getElementById("connect"),
  btnStart: document.getElementById("start"),
  btnStop: document.getElementById("stop"),
  xyz: document.getElementById("xyz"),
  encoder: document.getElementById("encoder"),
  log: document.getElementById("data"),
};

// ---------- Helpers ----------
function logToScreen(msg) {
  const p = document.createElement("p");
  p.textContent = msg;
  els.log.appendChild(p);
  if (els.log.childElementCount > 500) els.log.firstChild.remove(); // prevent runaway growth
  console.log(msg);
}

function setStatus(text) {
  els.status.textContent = text;
}

function requireWebBluetooth() {
  if (!navigator.bluetooth) {
    setStatus("❌ Web Bluetooth not supported");
    throw new Error("Web Bluetooth not supported in this browser.");
  }
}

function parseNotificationValue(event) {
  const str = new TextDecoder().decode(event.target.value);
  logToScreen("📨 Notification: " + str);

  // Expected: "X:1.23 Y:4.56 Z:7.89 ENC:123"
  const m = str.match(/X:([-\d.]+)\s+Y:([-\d.]+)\s+Z:([-\d.]+)\s+ENC:(-?\d+)/i);
  if (m) {
    els.xyz.textContent = `X: ${m[1]} | Y: ${m[2]} | Z: ${m[3]}`;
    els.encoder.textContent = `Encoder: ${m[4]}`;
  }
}

async function sendCommand(cmd) {
  if (!bleCharacteristic) {
    logToScreen("⚠️ Not connected to a characteristic.");
    return;
  }
  try {
    await bleCharacteristic.writeValue(new TextEncoder().encode(cmd));
    logToScreen(`✅ Sent "${cmd}"`);
  } catch (e) {
    logToScreen(`❌ Failed to send "${cmd}": ${e}`);
  }
}

function cleanupOnDisconnect() {
  if (bleDevice) {
    try { bleDevice.gatt?.disconnect(); } catch (_) {}
  }
  bleDevice = bleServer = bleService = bleCharacteristic = null;
  setStatus("🔌 Not Connected");
  logToScreen("ℹ️ Disconnected.");
}

// ---------- Event handlers ----------
async function handleConnectClick() {
  try {
    requireWebBluetooth();
    logToScreen("🔎 Requesting device… (Tip: use Chrome/Edge over HTTPS on Android)");
    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ name: "ESP32C3-MotorBLE" }],
      optionalServices: [SERVICE_UUID], // needed to access service after connect
    });

    bleDevice.addEventListener("gattserverdisconnected", () => {
      cleanupOnDisconnect();
      // Optional: auto-reconnect attempt
      // setTimeout(() => handleReconnect().catch(console.error), 1000);
    });

    setStatus("🔗 Connecting…");
    bleServer = await bleDevice.gatt.connect();
    logToScreen("✅ GATT connected");

    bleService = await bleServer.getPrimaryService(SERVICE_UUID);
    bleCharacteristic = await bleService.getCharacteristic(CHARACTERISTIC_UUID);

    await bleCharacteristic.startNotifications();
    bleCharacteristic.addEventListener("characteristicvaluechanged", parseNotificationValue);

    setStatus("✅ Connected");
    logToScreen("📡 Notifications enabled");
  } catch (err) {
    logToScreen("❌ Connection failed: " + err.message);
    setStatus("❌ Connection failed");
    cleanupOnDisconnect();
  }
}

// Optional: example auto-reconnect flow (if you want it later)
// async function handleReconnect() {
//   if (!bleDevice) throw new Error("No known device to reconnect.");
//   setStatus("🔁 Reconnecting…");
//   bleServer = await bleDevice.gatt.connect();
//   bleService = await bleServer.getPrimaryService(SERVICE_UUID);
//   bleCharacteristic = await bleService.getCharacteristic(CHARACTERISTIC_UUID);
//   await bleCharacteristic.startNotifications();
//   bleCharacteristic.addEventListener("characteristicvaluechanged", parseNotificationValue);
//   setStatus("✅ Connected");
//   logToScreen("🔁 Reconnected & notifications re-enabled");
// }

// ---------- Wire up UI ----------
els.btnConnect.addEventListener("click", handleConnectClick);
els.btnStart.addEventListener("click", () => sendCommand("START"));
els.btnStop.addEventListener("click", () => sendCommand("STOP"));

// Initial state
setStatus("🔌 Not Connected");
logToScreen("Ready. Click “Connect” to pair with ESP32C3-MotorBLE.");
