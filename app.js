let data;

async function start() {
  try {
    const res = await fetch("fares.json");
    if (!res.ok) throw new Error("fares.json not found (" + res.status + ")");
    data = await res.json();

    const names = ["Poblacion", ...data.places.map(p => p.name)];
    for (const id of ["from", "to"]) {
      const select = document.getElementById(id);
      select.innerHTML = "";
      names.forEach(n => select.add(new Option(n, n)));
    }
    document.getElementById("to").selectedIndex = 1;

    ["from", "to", "discount"].forEach(id =>
      document.getElementById(id).addEventListener("change", showFare)
    );

    document.getElementById("swap").addEventListener("click", () => {
      const from = document.getElementById("from");
      const to = document.getElementById("to");
      [from.value, to.value] = [to.value, from.value];
      showFare();
    });

    renderHotline();
    showFare();
  } catch (err) {
    document.getElementById("fare-note").textContent =
      "Could not load fares: " + err.message;
  }
}

function renderHotline() {
  const h = data.hotline || {};
  const btn = document.getElementById("hotline-btn");
  const note = document.getElementById("hotline-note");

  document.getElementById("hotline-name").textContent = h.name || "LGU Tuguegarao City";

  if (h.number) {
    btn.href = "tel:" + h.number.replace(/[^\d+]/g, "");
    btn.textContent = "📞 " + h.number;
    btn.hidden = false;
    note.textContent = "Tap the button to call";
  } else {
    btn.hidden = true;
    note.textContent = "0912-3456-789";
  }

  document.getElementById("updated").textContent =
    data.updatedAsOf ? "Fares: " + data.updatedAsOf : "";
}

function showFare() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const discounted = document.getElementById("discount").checked;
  const type = discounted ? "discounted" : "regular";

  const label = document.getElementById("fare-label");
  const amount = document.getElementById("fare-amount");
  const note = document.getElementById("fare-note");

  label.textContent = discounted
    ? "Official Student / Senior / PWD Fare"
    : "Official Regular Fare";

  if (from === to) {
    amount.textContent = "-";
    note.textContent = "Choose two different places";
    return;
  }

  if (from === "Poblacion" && to === "Poblacion") {
    amount.textContent = "₱" + data.poblacion[type].toFixed(2);
    note.textContent = "Fixed fare within the Poblacion";
    return;
  }

  // Only poblacion <-> barangay is official
  const place = from === "Poblacion" ? to : to === "Poblacion" ? from : null;
  if (!place) {
    amount.textContent = "-";
    note.textContent = "No official fare listed for this trip";
    return;
  }

  const fare = data.places.find(p => p.name === place)[type];
  amount.textContent = "₱" + fare.toFixed(2);
  note.textContent = "Poblacion ↔ " + place;
}

start();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

(function () {
  const splash = document.getElementById("splash");
  if (!splash) return;

  let seen = false;
  try {
    seen = sessionStorage.getItem("splashSeen") === "1";
    sessionStorage.setItem("splashSeen", "1");
  } catch (e) {}

  if (seen) { splash.remove(); return; }

  setTimeout(() => {
    splash.classList.add("hide");
    setTimeout(() => splash.remove(), 600);
  }, 2500);
})();