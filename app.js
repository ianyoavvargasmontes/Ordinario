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

    const startDate = document.getElementById("dateInput").value;
    const days = document.getElementById("daysSelect").value;

    if (!startDate) {
      showError("Selecciona una fecha");
      return;
    }

    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 16);

    const selected = new Date(startDate);
    if (selected > maxDate) {
      showError("La API solo permite hasta 16 días desde hoy");
      return;
    }

    let lat, lon;

    if (query.includes(",")) {
      [lat, lon] = query.split(",");
    } else {
      const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}`);
      const geoData = await geo.json();

      if (!geoData.results || geoData.results.length === 0) {
        showError("Ciudad no encontrada");
        return;
      }

      lat = geoData.results[0].latitude;
      lon = geoData.results[0].longitude;
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + parseInt(days));

    const endStr = endDate.toISOString().split("T")[0];

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max&start_date=${startDate}&end_date=${endStr}&timezone=auto`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.daily) {
      showError("La API no devolvió datos válidos");
      return;
    }

    renderChart(data.daily.time, data.daily.temperature_2m_max);
    updateLegend(data.daily.temperature_2m_max);
    showChart();

  } catch (e) {
    console.error(e);
    showError("Error en la petición");
  }
}

function renderChart(labels, temps) {
  if (chart) chart.destroy();

  const ctx = document.getElementById("weatherChart");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Temperatura °C",
        data: temps,

        // Colores por punto
        pointBackgroundColor: temps.map(t =>
          t > 30 ? "red" : t < 10 ? "blue" : "green"
        ),

        borderColor: "green",

        // Colores por segmento de línea
        segment: {
          borderColor: ctx => {
            const t = ctx.p1.parsed.y;
            return t > 30 ? "red" : t < 10 ? "blue" : "green";
          }
        },

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

function updateLegend(temps) {
  const hot = temps.filter(t => t > 30).length;
  const cold = temps.filter(t => t < 10).length;
  const normal = temps.length - hot - cold;

  document.getElementById("legend").innerHTML = `
    🔴 ${hot} días > 30°C <br>
    🔵 ${cold} días < 10°C <br>
    🟢 ${normal} días normales
  `;
}


function showLoading() {
  statusBox.classList.remove("hidden");
  chartBox.classList.add("hidden");
}

function showChart() {
  statusBox.classList.add("hidden");
  chartBox.classList.remove("hidden");
}

function showError(msg = "Error al obtener datos 😢") {
  statusBox.classList.remove("hidden");
  chartBox.classList.add("hidden");
  statusBox.innerHTML = `
    <div class="spinner"></div>
    <p>${msg}</p>
  `;
}