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

        const url = `https://open-meteo.com/en/docs?hourly=temperature_2m,rain,precipitation,precipitation_probability,apparent_temperature,dew_point_2m,relative_humidity_2m,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_moisture_27_to_81cm&latitude=-11.4087&longitude=-69.3032`;

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
