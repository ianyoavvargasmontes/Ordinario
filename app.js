let chart = null;

const btn = document.getElementById("searchBtn");
const input = document.getElementById("cityInput");
const statusBox = document.getElementById("statusBox");
const chartBox = document.getElementById("chartBox");
const errorMsg = document.getElementById("errorMsg");

btn.addEventListener("click", loadWeather);

async function loadWeather() {
    try {
        showLoading();

        let lat, lon;
        const query = input.value.trim();

        if (!query) throw new Error("Ingrese una ciudad o coordenadas");

        // Coordenadas directas
        if (query.includes(",")) {
            [lat, lon] = query.split(",");
        } 
        // Geocoding por ciudad
        else {
            const geo = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${query}`
            );
            const geoData = await geo.json();

            if (!geoData.results) throw new Error("Ciudad no encontrada");

            lat = geoData.results[0].latitude;
            lon = geoData.results[0].longitude;
        }

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max&timezone=auto`;

        const res = await fetch(url);
        const data = await res.json();

        const labels = data.daily.time;
        const temps = data.daily.temperature_2m_max;

        renderChart(labels, temps);
        showChart();

    } catch (err) {
        showError(err.message);
    }
}

function renderChart(labels, temps) {
    if (chart) chart.destroy();

    let color = "#38bdf8";
    if (Math.max(...temps) > 30) color = "red";
    if (Math.min(...temps) < 10) color = "#38bdf8";

    const ctx = document.getElementById("weatherChart");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Temperatura Máxima (°C)",
                data: temps,
                borderColor: color,
                backgroundColor: color,
                tension: 0.4,
                pointRadius: 5
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
    errorMsg.classList.add("hidden");
}

function showChart() {
    statusBox.classList.add("hidden");
    chartBox.classList.remove("hidden");
}

function showError(msg) {
    statusBox.classList.add("hidden");
    errorMsg.textContent = msg;
    errorMsg.classList.remove("hidden");
}
