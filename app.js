let chartInstance = null;

const button = document.getElementById("searchBtn");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("errorMsg");

button.addEventListener("click", fetchWeather);

async function fetchWeather() {

    loading.style.display = "block";
    errorMsg.style.display = "none";

    if (chartInstance) {
        chartInstance.destroy(); // Control de memoria
    }

    try {
        const url = `
       https://api.open-meteo.com/v1/forecast?latitude=23&longitude=-102&hourly=temperature_2m,temperature_80m,temperature_120m,temperature_180m
        `;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Error en la API");

        const data = await response.json();

        // 🔹 Tomamos SOLO las próximas 48 horas
        const labels = data.hourly.time.slice(0, 48)
            .map(t => t.replace("T", " "));

        const temperatures = data.hourly.temperature_2m.slice(0, 48);

        // 🔹 Lógica de color
        let color = "#00e5ff";
        if (temperatures.some(t => t > 30)) color = "red";
        if (temperatures.some(t => t < 10)) color = "blue";

        drawChart(labels, temperatures, color);

    } catch (error) {
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
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 7
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
                x: {
                    title: {
                        display: true,
                        text: "Hora"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Temperatura °C"
                    }
                }
            }
        }
    });
}
