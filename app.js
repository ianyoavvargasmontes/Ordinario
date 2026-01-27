let chartInstance = null;

const button = document.getElementById("searchBtn");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("errorMsg");
const cityInput = document.getElementById("cityInput");

button.addEventListener("click", fetchWeather);

async function fetchWeather() {

    loading.style.display = "block";
    errorMsg.style.display = "none";

    if (chartInstance) {
        chartInstance.destroy();
    }

    try {
        let lat, lon;
        const query = cityInput.value.trim();

        if (!query) {
            alert("Ingresa una ciudad o coordenadas");
            loading.style.display = "none";
            return;
        }

        // 🔹 Coordenadas directas
        if (query.includes(",")) {
            [lat, lon] = query.split(",");
        }
        // 🔹 Geocoding por ciudad
        else {
            const geo = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${query}`
            );

            const geoData = await geo.json();

            if (!geoData.results || geoData.results.length === 0) {
                throw new Error("Ciudad no encontrada");
            }

            lat = geoData.results[0].latitude;
            lon = geoData.results[0].longitude;
        }

        // 🔹 URL CORRECTA (una sola línea)
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&timezone=auto`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Error en la API");

        const data = await response.json();

        const labels = data.hourly.time.slice(0, 48).map(t => t.replace("T", " "));
        const temperatures = data.hourly.temperature_2m.slice(0, 48);

        let color = "#00e5ff";
        if (temperatures.some(t => t > 30)) color = "red";
        if (temperatures.some(t => t < 10)) color = "blue";

        drawChart(labels, temperatures, color);

    } catch (error) {
        console.error(error);
        errorMsg.textContent = "❌ Error al cargar datos meteorológicos";
        errorMsg.style.display = "block";
    } finally {
        loading.style.display = "none";
    }
}

function drawChart(labels, data, color) {
    const ctx = document.getElementById("weatherChart").getContext("2d");

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Temperatura por hora (°C)",
                data,
                borderColor: color,
                backgroundColor: color,
                tension: 0.4
            }]
        },
        options: {
            responsive: true
        }
    });
}
