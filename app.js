let chartInstance = null;

const button = document.getElementById("searchBtn");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("errorMsg");

button.addEventListener("click", fetchWeather);

async function fetchWeather() {
    const cityInput = document.getElementById("cityInput").value;
    const days = document.getElementById("daysSelect").value;

    errorMsg.style.display = "none";
    loading.style.display = "block";

    if (chartInstance) {
        chartInstance.destroy();
    }

    try {
        let latitude = 19.4326;
        let longitude = -99.1332; // CDMX por defecto

        // Si el usuario ingresa coordenadas
        if (cityInput.includes(",")) {
            [latitude, longitude] = cityInput.split(",");
        }

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max&timezone=auto`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al obtener datos");

        const data = await response.json();

        const labels = data.daily.time.slice(0, days);
        const temperatures = data.daily.temperature_2m_max.slice(0, days);

        const color = temperatures.some(t => t > 30)
            ? "red"
            : temperatures.some(t => t < 10)
            ? "blue"
            : "#00e5ff";

        drawChart(labels, temperatures, color);

    } catch (error) {
        errorMsg.textContent = "❌ No se pudieron cargar los datos.";
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
                label: "Temperatura Máxima (°C)",
                data,
                borderColor: color,
                backgroundColor: color,
                tension: 0.3,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    enabled: true
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: "Temperatura °C"
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Fecha"
                    }
                }
            }
        }
    });
}
