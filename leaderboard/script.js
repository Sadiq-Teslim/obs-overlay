/**
 * Overlay Controller
 * Handles: Real-time WebSockets + Simulation Mode
 */

// --- CONFIGURATION ---
const CONFIG = {
  // URL Placeholder - This should be replaced with the real ws url from the backend.
  wsUrl: "wss://overlays.lbc.domain/ws/events",
  reconnectInterval: 5000,
  goalTarget: 3000,
  enableSimulation: false,
};

// --- STATE ---
let state = {
  currentBalance: 0,
  history: [],
};

// --- DOM ELEMENTS ---
const ui = {
  goalCurrent: document.getElementById("txt-current"),
  goalTarget: document.getElementById("txt-target"),
  goalBar: document.getElementById("bar-fill"),
  lbList: document.getElementById("lb-list"),
  alertBox: document.getElementById("alert-box"),
  alertUser: document.getElementById("alert-user"),
  alertAmount: document.getElementById("alert-amount"),
};

// --- INITIALIZATION ---
function init() {
  ui.goalTarget.innerText = CONFIG.goalTarget.toLocaleString();

  // Check URL params to force simulation (e.g. index.html?sim=true)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("sim") === "true" || CONFIG.enableSimulation) {
    console.log("Simulation Mode Enabled");
    document.body.classList.add("debug-mode");
    startSimulation();
  } else {
    connectWebSocket();
  }
}

// --- CORE: HANDLE DATA ---
function handleData(data) {
  console.log("Received Event:", data);

  if (data.type === "replace_all") {
    renderLeaderboard(data.supporters);
  }
  else if (data.event_type === "tip") {
    triggerAlert(data.username, data.amount_tokens);
  }
}

// --- LOGIC: RENDER LEADERBOARD ---
function renderLeaderboard(supporters) {
  if (!supporters || supporters.length === 0) return;

  // Take top 5
  const top5 = supporters.slice(0, 5);

  let html = "";
  top5.forEach((user, index) => {
    const isTop = index === 0 ? "top-rank" : "";
    let icon = "";
    if (user.badges && user.badges.includes("diamond")) icon = "💎 ";
    else if (user.badges && user.badges.includes("flame")) icon = "🔥 ";
    else if (user.badges && user.badges.includes("star")) icon = "⭐ ";

    html += `
            <li class="lb-row ${isTop}">
                <span class="lb-rank">${index + 1}</span>
                <span class="lb-name">${icon}${user.name}</span>
                <span class="lb-val">${user.amount.toLocaleString()}</span>
            </li>
        `;
  });

  ui.lbList.innerHTML = html;
}

// --- LOGIC: TRIGGER ALERT ---
function triggerAlert(name, amount) {
  state.currentBalance += amount;
  const pct = Math.min((state.currentBalance / CONFIG.goalTarget) * 100, 100);

  ui.goalCurrent.innerText = state.currentBalance.toLocaleString();
  ui.goalBar.style.width = `${pct}%`;

  ui.alertUser.innerText = name || "Anonymous";
  ui.alertAmount.innerText = `${amount} tks`;

  ui.alertBox.classList.add("active");


  setTimeout(() => {
    ui.alertBox.classList.remove("active");
  }, 4000);
}

// --- WEBSOCKET CONNECTION ---
function connectWebSocket() {
  console.log(`Connecting to ${CONFIG.wsUrl}...`);
  const socket = new WebSocket(CONFIG.wsUrl);

  socket.addEventListener("open", () => {
    console.log("WebSocket Connected");
  });

  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      handleData(data);
    } catch (e) {
      console.error("JSON Parse Error", e);
    }
  });

  socket.addEventListener("close", () => {
    console.log("WebSocket Disconnected. Retrying...");
    setTimeout(connectWebSocket, CONFIG.reconnectInterval);
  });
}

// --- SIMULATION (FAKE DATA) ---
function startSimulation() {
  console.log("Starting Loop...");

  // Sim Tip every 5 seconds
  setInterval(() => {
    const fakeUser = ["DaddyMax", "LagosKing", "StudioFan", "RichieRich"][
      Math.floor(Math.random() * 4)
    ];
    const fakeAmt = [10, 50, 100, 500][Math.floor(Math.random() * 4)];

    handleData({
      event_type: "tip",
      username: fakeUser,
      amount_tokens: fakeAmt,
    });
  }, 5000);

  setInterval(() => {
    handleData({
      type: "replace_all",
      supporters: [
        {
          name: "ElReyAzul",
          amount: 1250 + Math.floor(Math.random() * 100),
          badges: ["diamond"],
        },
        {
          name: "SirGold",
          amount: 740 + Math.floor(Math.random() * 100),
          badges: ["flame"],
        },
        { name: "AnónimoVIP", amount: 520, badges: ["flame"] },
        { name: "Luna", amount: 280, badges: ["star"] },
        { name: "ShadowCat", amount: 130, badges: ["star"] },
      ],
    });
  }, 10000);
}

init();
