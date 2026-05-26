import { useState } from "react";

// Weather icon mapping
const weatherIcons = {
  Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️",
  Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Fog: "🌫️", default: "🌡️"
};

const WeatherSkeleton = () => (
  <div className="card weather-main-card" style={{ opacity: 0.7 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text" style={{ width: "40%" }}></div>
      </div>
      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <div className="skeleton skeleton-circle" style={{ marginBottom: "0.5rem" }}></div>
        <div className="skeleton skeleton-text" style={{ width: "80px" }}></div>
      </div>
    </div>
    <div className="weather-stats">
      <div className="weather-stat"><div className="skeleton skeleton-circle" style={{ width: "30px", height: "30px" }}></div><div className="skeleton skeleton-text" style={{ width: "60px", marginTop: "5px" }}></div></div>
      <div className="weather-stat"><div className="skeleton skeleton-circle" style={{ width: "30px", height: "30px" }}></div><div className="skeleton skeleton-text" style={{ width: "60px", marginTop: "5px" }}></div></div>
      <div className="weather-stat"><div className="skeleton skeleton-circle" style={{ width: "30px", height: "30px" }}></div><div className="skeleton skeleton-text" style={{ width: "60px", marginTop: "5px" }}></div></div>
    </div>
    <div className="ai-tip-box" style={{ marginTop: "1.5rem" }}>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text" style={{ width: "80%" }}></div>
    </div>
  </div>
);

function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Don't clear weather immediately so the transition is smoother
    // setWeather(null); 
    // setForecast([]);

    try {
      // 1. Get Coordinates from OpenStreetMap (Nominatim) Geocoding API (Extremely robust for villages!)
      let searchQuery = city;
      if (!searchQuery.toLowerCase().includes('karnataka')) {
        searchQuery += ', Karnataka';
      }
      
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=in&addressdetails=1`);
      if (!geoRes.ok) throw new Error("Failed to find location.");
      const geoData = await geoRes.json();
      
      if (!geoData || geoData.length === 0) {
        throw new Error("Location not found. Please try adding the district or state name.");
      }
      
      const location = geoData[0];
      const latitude = location.lat;
      const longitude = location.lon;
      const name = location.name || city.split(',')[0];
      
      let district = location.address?.state_district || location.address?.county || "";
      let state = location.address?.state || "Karnataka";
      district = district.replace(" District", "").replace(" district", "");
      
      const regionDisplay = district && district !== name ? `${district}, ${state}` : state;

      // 2. Fetch current weather and daily forecast from Open-Meteo
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
      
      if (!weatherRes.ok) throw new Error("Failed to fetch weather data.");
      const weatherData = await weatherRes.json();

      const mapWeatherCode = (code) => {
        if (code === 0) return { main: "Clear", description: "clear sky" };
        if (code >= 1 && code <= 3) return { main: "Clouds", description: "partly cloudy" };
        if (code === 45 || code === 48) return { main: "Fog", description: "foggy" };
        if (code >= 51 && code <= 57) return { main: "Drizzle", description: "drizzle" };
        if (code >= 61 && code <= 67) return { main: "Rain", description: "rain" };
        if (code >= 71 && code <= 77) return { main: "Snow", description: "snow" };
        if (code >= 80 && code <= 82) return { main: "Rain", description: "rain showers" };
        if (code >= 85 && code <= 86) return { main: "Snow", description: "snow showers" };
        if (code >= 95 && code <= 99) return { main: "Thunderstorm", description: "thunderstorm" };
        return { main: "Clear", description: "clear" };
      };

      const currentCond = mapWeatherCode(weatherData.current.weather_code);

      const current = {
        name: name,
        sys: { country: regionDisplay },
        weather: [currentCond],
        main: {
          temp: weatherData.current.temperature_2m,
          feels_like: weatherData.current.apparent_temperature,
          humidity: weatherData.current.relative_humidity_2m,
        },
        wind: { speed: (weatherData.current.wind_speed_10m * (1000 / 3600)).toFixed(1) },
      };

      setWeather(current);

      const dailyForecast = [];
      for(let i = 0; i < 5; i++) {
        if(weatherData.daily.time[i]) {
          const dayCond = mapWeatherCode(weatherData.daily.weather_code[i]);
          dailyForecast.push({
            dateString: weatherData.daily.time[i],
            weather: [dayCond],
            main: {
              temp: (weatherData.daily.temperature_2m_max[i] + weatherData.daily.temperature_2m_min[i]) / 2,
            }
          });
        }
      }
      setForecast(dailyForecast);

    } catch (err) {
      setError(err.message || "Failed to fetch weather data.");
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const icon = (condition) => weatherIcons[condition] || weatherIcons.default;

  return (
    <div className="container">
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h2 className="page-title" style={{ marginBottom: "0.5rem" }}>🌤️ Weather Insights</h2>
        <p className="page-subtitle">Real-time agricultural weather data for your local fields.</p>
      </div>

      {/* Search Section */}
      <div className="card form-card" style={{ margin: "0 auto 3rem", boxShadow: "var(--shadow-lg)" }}>
        <form onSubmit={fetchWeather} style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <div className="input-group" style={{ flex: "1 1 300px", marginBottom: 0 }}>
            <input
              placeholder="Enter your village, city or district..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              style={{ padding: "1.2rem", fontSize: "1.1rem" }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "auto", padding: "1.2rem 2rem", marginTop: 0 }}>
            {loading ? "Searching..." : "🔍 Check Weather"}
          </button>
        </form>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: "4px solid #ef4444", marginBottom: "2rem", animation: "fadeIn 0.3s ease" }}>
          <p className="error-msg" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>⚠️</span> {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && <WeatherSkeleton />}

      {/* Current Weather Results */}
      {!loading && weather && (
        <div className="card weather-main-card" style={{ animation: "fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="badge">Current Conditions</span>
              <h3 style={{ fontSize: "2.2rem", marginBottom: "0.25rem", fontWeight: "700" }}>{weather.name}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>{weather.sys?.country}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "4rem", filter: "drop-shadow(0 0 10px rgba(16, 185, 129, 0.2))" }}>{icon(weather.weather?.[0]?.main)}</div>
              <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--primary)", marginTop: "-0.5rem" }}>
                {Math.round(weather.main?.temp)}°C
              </div>
              <p style={{ textTransform: "capitalize", color: "var(--text-muted)", fontWeight: "500" }}>{weather.weather?.[0]?.description}</p>
            </div>
          </div>

          <div className="weather-stats">
            <div className="weather-stat">
              <span>💧</span>
              <span>{weather.main?.humidity}% Humidity</span>
            </div>
            <div className="weather-stat">
              <span>💨</span>
              <span>{weather.wind?.speed} m/s Wind</span>
            </div>
            <div className="weather-stat">
              <span>🌡️</span>
              <span>{Math.round(weather.main?.feels_like)}°C Feels like</span>
            </div>
          </div>

          <div className="ai-tip-box" style={{ marginTop: "2rem" }}>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.2rem" }}>💡</span>
              <div>
                <strong style={{ color: "var(--primary)", display: "block", marginBottom: "0.25rem" }}>Agricultural Advice:</strong>
                {weather.weather?.[0]?.main === "Rain" || weather.weather?.[0]?.main === "Drizzle" || weather.weather?.[0]?.main === "Thunderstorm"
                  ? "Precipitation expected. Delay any pesticide spraying or irrigation. Ensure proper drainage in low-lying areas."
                  : weather.weather?.[0]?.main === "Clear"
                  ? "Clear skies ahead. Excellent window for harvesting, drying crops, or applying fertilizers."
                  : "Moderate conditions. Good for general field maintenance. Keep an eye on moisture levels."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5-Day Forecast */}
      {!loading && forecast.length > 0 && (
        <div style={{ marginTop: "4rem", animation: "fadeIn 0.8s ease" }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            📅 <span>5-Day Extended Forecast</span>
          </h3>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
            {forecast.map((item, i) => {
              const dateObj = new Date(item.dateString);
              const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
              
              return (
                <div key={i} className="card" style={{ textAlign: "center", padding: "1.5rem", background: i === 0 ? "rgba(16, 185, 129, 0.05)" : "var(--bg-surface)" }}>
                  <p style={{ fontSize: "0.9rem", fontWeight: "700", color: i === 0 ? "var(--primary)" : "var(--text-muted)", marginBottom: "1rem" }}>
                    {i === 0 ? "TODAY" : dateStr.toUpperCase()}
                  </p>
                  <div style={{ fontSize: "2.5rem", margin: "1rem 0" }}>{icon(item.weather?.[0]?.main)}</div>
                  <p style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>{Math.round(item.main?.temp)}°C</p>
                  <p style={{ fontSize: "0.85rem", textTransform: "capitalize", color: "var(--text-muted)", marginTop: "0.5rem" }}>{item.weather?.[0]?.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Weather;