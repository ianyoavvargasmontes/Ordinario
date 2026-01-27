const btn = document.getElementById("btnSearch");
const input = document.getElementById("cityInput");
const statusBox = document.getElementById("status");
const chartBox = document.getElementById("chartBox");

let chart = null;

btn.addEventListener("click", () => {
  if (!input.value) return alert("Ingresa ciudad o coordenadas");
  loadWeather(input.value);
});

async function loadWeather(query) {
  try {
    showLoading();

    let lat, lon;

    if (query.includes(",")) {
      [lat, lon] = query.split(",");
    } else {
      const geo = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=${query}");
      const geoData = await geo.json();
      lat = geoData.results[0].latitude;
      lon = geoData.results[0].longitude;
    }

    const url = "https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max&timezone=auto";

    const res = await fetch(url);
    const data = await res.json();

    const labels = data.daily.time;
    const temps = data.daily.temperature_2m_max;

    renderChart(labels, temps);
    showChart();

  } catch (error) {
    showError();
  }
}

function renderChart(labels, temps) {
  if (chart) chart.destroy();

  let color = "green";
  if (Math.max(...temps) > 30) color = "red";
  if (Math.min(...temps) < 10) color = "blue";

  const ctx = document.getElementById("weatherChart");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Temperatura °C",
        data: temps,
        borderColor: color,
        backgroundColor: color,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      interaction: {
        mode: "index",
        intersect: false
      }
    }
  });
}

function showLoading() {
  statusBox.classList.remove("hidden");
  chartBox.classList.add("hidden");
}

function showChart() {
  statusBox.classList.add("hidden");
  chartBox.classList.remove("hidden");
}

function showError() {
  statusBox.innerHTML = "<p>Error al obtener datos 😢</p>";
}