let data;

async function start() {
  const res = await fetch("fares.json");
  data = await res.json();

  const names = ["Poblacion", ...data.places.map(p => p.name)];
  for (const id of ["from", "to"]) {
    const select = document.getElementById(id);
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

  showFare();
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
