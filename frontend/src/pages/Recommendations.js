import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const getCropInsights = (crop) => {
  const c = (crop || "").toLowerCase();

  // Custom agronomic insights database customized for North Karnataka crops
  const database = {
    rice: {
      climate: {
        title: "High-Moisture Wetland",
        text: "This crop thrives in high rainfall (above 150-200mm) or standing water conditions typical of wet sub-basins in North Karnataka.",
        icon: "🌊"
      },
      soil: {
        title: "Heavy Clay Soil Retentive",
        text: "Requires heavy clay or alluvial clay loam soil that retains water effectively. Avoid sandy soils.",
        icon: "🧱"
      },
      marketplace: {
        title: "Paddy Transplanters & Harvesters"
      }
    },
    maize: {
      climate: {
        title: "Warm Semi-Arid Adaptability",
        text: "Maize is highly adaptable and performs best in sunny conditions with moderate, well-distributed seasonal rainfall.",
        icon: "☀️"
      },
      soil: {
        title: "Well-Drained Loam Setup",
        text: "Ensure deep tilling and ridge-furrow sowing to prevent waterlogging, which severely stunts maize roots.",
        icon: "🚜"
      },
      marketplace: {
        title: "Seeding & Shelling Equipment"
      }
    },
    chickpea: {
      climate: {
        title: "Cool & Dry Rabi Season",
        text: "Ideal for the winter (Rabi) season in North Karnataka, requiring very low rainfall and cool nighttime temperatures.",
        icon: "❄️"
      },
      soil: {
        title: "Moisture-Retentive Clay Loam",
        text: "Thrives in deep, black cotton soils that retain moisture from the monsoon season. Avoid over-watering.",
        icon: "🟫"
      },
      marketplace: {
        title: "Seed Drills & Harvesters"
      }
    },
    pigeonpeas: {
      climate: {
        title: "Drought-Resistant Pulses",
        text: "Pigeonpeas (Tur) are highly drought-tolerant, matching the dry semi-arid climate of Kalaburagi (the Tur bowl of Karnataka).",
        icon: "☀️"
      },
      soil: {
        title: "Deep Alluvial/Black Soil",
        text: "Requires well-drained soils. Deep tilling is critical to facilitate its deep, moisture-seeking taproot system.",
        icon: "🚜"
      },
      marketplace: {
        title: "Broad-Bed Furrow Planters"
      }
    },
    cotton: {
      climate: {
        title: "Sunny & Dry Harvest Climate",
        text: "Requires a long frost-free warm season with ample sunshine and dry conditions during the boll-opening stage.",
        icon: "🌤️"
      },
      soil: {
        title: "Regur (Black Cotton) Soil",
        text: "Thrives in deep clayey black soils. Apply balanced Nitrogen and Potassium (K) to support strong fiber development.",
        icon: "🟫"
      },
      marketplace: {
        title: "Cotton Pickers & Subsoilers"
      }
    },
    grapes: {
      climate: {
        title: "Dry Summer & Mild Winters",
        text: "Matches dry climatic zones like Vijayapura, where low humidity during ripening prevents fungal mildew infections.",
        icon: "🍇"
      },
      soil: {
        title: "Gravelly & Sandy Loams",
        text: "Requires well-drained gravelly or sandy loam soils. Heavy fertilizer feeding of Potassium is vital for high brix sweetening.",
        icon: "🧪"
      },
      marketplace: {
        title: "Drip Irrigation & Trellis Hire"
      }
    },
    pomegranate: {
      climate: {
        title: "Semi-Arid Arid Climate",
        text: "Extremely well-suited for dry, warm districts. Dry air during fruit development enhances skin color and quality.",
        icon: "☀️"
      },
      soil: {
        title: "Light Sandy-Loam/Clay-Loam",
        text: "Prefers well-drained loams. Highly sensitive to waterlogging; drip irrigation and organic mulching are mandatory.",
        icon: "💧"
      },
      marketplace: {
        title: "Export Logistics & Pruning Tools"
      }
    },
    watermelon: {
      climate: {
        title: "Hot & Sunny Summer Crop",
        text: "Requires warm daytime temperatures (above 25°C) and dry air. Ideal for summer riverbed or drip irrigation farming.",
        icon: "☀️"
      },
      soil: {
        title: "Sandy/Riverbed Loams",
        text: "Prefers very light, warm sandy loam soils. Utilize plastic mulching to protect vines from soil contact and disease.",
        icon: "🍉"
      },
      marketplace: {
        title: "Drip Systems & Mulch Layers"
      }
    },
    muskmelon: {
      climate: {
        title: "Dry & Warm Climatic Profiles",
        text: "Requires warm, dry weather and high sunshine hours. Excess rainfall during ripening will dilute sugar levels.",
        icon: "☀️"
      },
      soil: {
        title: "Sandy Loams with High Drainage",
        text: "Ensure deep bed-preparation to avoid root rot. High potassium inputs ensure excellent aroma and sweet flesh.",
        icon: "🚜"
      },
      marketplace: {
        title: "Bed Formers & Planters"
      }
    },
    banana: {
      climate: {
        title: "Humid Tropical High-Rainfall",
        text: "Requires warm, humid climates with steady water supply. Highly sensitive to strong winds which rip the leaf canopy.",
        icon: "🌴"
      },
      soil: {
        title: "Rich Organic-Heavy Loam",
        text: "Very heavy feeder of Nitrogen and Potassium. Apply abundant organic compost and maintain thick crop mulching.",
        icon: "🍌"
      },
      marketplace: {
        title: "Drip Networks & compost Spreaders"
      }
    },
    mango: {
      climate: {
        title: "Warm Summer Ripening",
        text: "Requires hot, dry summers for optimal fruit ripening and sweetening. High humidity induces pest problems.",
        icon: "🥭"
      },
      soil: {
        title: "Deep Alluvial Loam",
        text: "Requires deep soil profiles for its extensive root systems. Practice basin water harvesting around tree canopies.",
        icon: "🌳"
      },
      marketplace: {
        title: "Orchard Sprayers & Pickers"
      }
    }
  };

  // Safe fallback if the crop is not explicitly defined in our regional database
  const fallback = {
    climate: {
      title: "Climatic Adaptability",
      text: `This crop matches typical climatic profiles of North Karnataka and similar dryland agriculture zones.`,
      icon: "📍"
    },
    soil: {
      title: "Soil & Land Preparation",
      text: "Ensure deep tilling before sowing to improve water absorption, break hard soil crusts, and clear weed residues.",
      icon: "🚜"
    },
    marketplace: {
      title: "Services & Logistics Support"
    }
  };

  // Find standard matches
  let match = null;
  Object.keys(database).forEach(key => {
    if (c.includes(key)) {
      match = database[key];
    }
  });

  return match || fallback;
};

function Recommendations() {
  const [activeTab, setActiveTab] = useState("crop"); // 'crop' or 'disease'

  // Crop Recommendation Form State
  const [cropForm, setCropForm] = useState({
    N: 50,
    P: 50,
    K: 50,
    temperature: 25,
    humidity: 60,
    ph: 6.5,
    rainfall: 100
  });

  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [cropResult, setCropResult] = useState(null);
  const [cropLoading, setCropLoading] = useState(false);
  const [cropError, setCropError] = useState("");

  // Disease Scanner State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState("");
  const [activeTreatmentTab, setActiveTreatmentTab] = useState("organic"); // 'organic' or 'chemical'

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const cropInsights = cropResult ? getCropInsights(cropResult.crop) : null;

  // Fetch live weather data using Geolocation + Open-Meteo
  const handleAutoDetectWeather = () => {
    if (!navigator.geolocation) {
      setWeatherError("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingWeather(true);
    setWeatherError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Fetch current weather from Open-Meteo API
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=rain_sum&timezone=auto`
          );
          if (!weatherRes.ok) throw new Error("Failed to fetch weather data.");

          const weatherData = await weatherRes.json();
          const temp = weatherData.current_weather.temperature;
          // Approximate humidity based on typical local climate models
          const approxHumidity = Math.min(Math.max(Math.round(80 - (temp - 20) * 2), 20), 95);
          // Estimate rainfall based on past day's records or dynamic models
          const rain = weatherData.daily?.rain_sum?.[0] || 45;

          setCropForm(prev => ({
            ...prev,
            temperature: Math.round(temp),
            humidity: approxHumidity,
            rainfall: Math.round(rain * 10) // scale to typical crop rainfall bounds
          }));

          setWeatherError("Live regional weather synchronized successfully!");
        } catch (err) {
          setWeatherError("Failed to fetch local weather. Prefilled standard defaults.");
        } finally {
          setLoadingWeather(false);
        }
      },
      (err) => {
        setWeatherError("Location permission denied. Please enter weather values manually.");
        setLoadingWeather(false);
      }
    );
  };

  // Submit Crop Recommendation Form
  const handleCropSubmit = async (e) => {
    e.preventDefault();
    setCropLoading(true);
    setCropError("");
    setCropResult(null);

    try {
      const res = await API.post("/ml/recommend", cropForm, { headers });
      if (res.data.success) {
        setCropResult(res.data);
      } else {
        setCropError("Unable to retrieve recommendation.");
      }
    } catch (err) {
      setCropError(err.response?.data?.message || "Error contacting ML recommendation engine.");
    } finally {
      setCropLoading(false);
    }
  };

  // Handle image select for disease scanner
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
      setScanError("");
    }
  };

  // Submit Disease Scanner Image
  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setScanError("Please select a leaf image first.");
      return;
    }

    setScanning(true);
    setScanError("");
    setScanResult(null);

    const formData = new FormData();
    formData.append("leaf", selectedFile);

    try {
      const res = await API.post("/ml/detect", formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data"
        }
      });

      // Artificial delay of 2.5 seconds to showcase scanning animation
      setTimeout(() => {
        if (res.data.success) {
          setScanResult(res.data);
        } else {
          setScanError("Failed to diagnose leaf image.");
        }
        setScanning(false);
      }, 2500);

    } catch (err) {
      setScanError(err.response?.data?.message || "Error communicating with deep learning engine.");
      setScanning(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "1000px", paddingBottom: "3rem" }}>
      <h2 className="page-title" style={{ fontSize: "2.2rem", fontWeight: "bold", textAlign: "center", marginBottom: "0.25rem" }}>
        🌾 AI Agronomic Advisor
      </h2>
      <p className="page-subtitle" style={{ textAlign: "center", opacity: 0.8, marginBottom: "2rem", fontSize: "1.05rem" }}>
        Real-time soil classification and deep-learning leaf diagnosis customized for North Karnataka farmers.
      </p>

      {/* Tabs Controller */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button
          onClick={() => setActiveTab("crop")}
          className={activeTab === "crop" ? "btn-primary" : "btn-secondary"}
          style={{ padding: "0.75rem 1.5rem", borderRadius: "12px", border: activeTab === "crop" ? "none" : "1px solid var(--border-color)", background: activeTab === "crop" ? "var(--primary)" : "transparent", color: activeTab === "crop" ? "#fff" : "var(--text-muted)", cursor: "pointer", transition: "all 0.3s ease" }}
        >
          🌱 Crop Recommendation
        </button>
        <button
          onClick={() => setActiveTab("disease")}
          className={activeTab === "disease" ? "btn-primary" : "btn-secondary"}
          style={{ padding: "0.75rem 1.5rem", borderRadius: "12px", border: activeTab === "disease" ? "none" : "1px solid var(--border-color)", background: activeTab === "disease" ? "var(--primary)" : "transparent", color: activeTab === "disease" ? "#fff" : "var(--text-muted)", cursor: "pointer", transition: "all 0.3s ease" }}
        >
          🔬 AI Leaf Scanner
        </button>
      </div>

      {/* TAB 1: CROP RECOMMENDATION */}
      {activeTab === "crop" && (
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>

          {/* Inputs Section */}
          <div className="card" style={{ background: "var(--bg-glass)", backdropFilter: "blur(12px)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "1.5rem" }}>
            <h3 style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1.2rem", color: "var(--primary)", marginBottom: "1.5rem" }}>
              <span>Enter Parameters</span>
              <button
                onClick={handleAutoDetectWeather}
                disabled={loadingWeather}
                style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem", background: "rgba(16, 185, 129, 0.1)", color: "var(--primary)", border: "1px solid var(--border-color)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
              >
                {loadingWeather ? "🔄 Loading..." : "🌦️ Get Live Weather"}
              </button>
            </h3>

            {weatherError && (
              <p style={{ fontSize: "0.85rem", color: weatherError.includes("successfully") ? "#4ade80" : "#f87171", margin: "-0.5rem 0 1rem 0" }}>
                {weatherError}
              </p>
            )}

            <form onSubmit={handleCropSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Soil Macronutrients */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                <div className="input-group">
                  <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>Nitrogen (N)</label>
                  <input
                    type="number"
                    value={cropForm.N}
                    onChange={(e) => setCropForm({ ...cropForm, N: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="150"
                    required
                    style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.05)", color: "var(--text-main)", width: "100%" }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>Phosphorus (P)</label>
                  <input
                    type="number"
                    value={cropForm.P}
                    onChange={(e) => setCropForm({ ...cropForm, P: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="150"
                    required
                    style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.05)", color: "var(--text-main)", width: "100%" }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>Potassium (K)</label>
                  <input
                    type="number"
                    value={cropForm.K}
                    onChange={(e) => setCropForm({ ...cropForm, K: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="220"
                    required
                    style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.05)", color: "var(--text-main)", width: "100%" }}
                  />
                </div>
              </div>

              {/* pH Level */}
              <div className="input-group">
                <label style={{ fontSize: "0.8rem", opacity: 0.8, display: "flex", justifyContent: "space-between" }}>
                  <span>Soil pH (Acidity)</span>
                  <span style={{ color: "var(--primary)", fontWeight: "bold" }}>{cropForm.ph}</span>
                </label>
                <input
                  type="range"
                  value={cropForm.ph}
                  onChange={(e) => setCropForm({ ...cropForm, ph: parseFloat(e.target.value) })}
                  min="3.5"
                  max="9.0"
                  step="0.1"
                  required
                  style={{ width: "100%", cursor: "pointer", accentColor: "#8b5cf6" }}
                />
              </div>

              {/* Environmental metrics */}
              <div className="input-group">
                <label style={{ fontSize: "0.8rem", opacity: 0.8, display: "flex", justifyContent: "space-between" }}>
                  <span>Temperature (°C)</span>
                  <span>{cropForm.temperature}°C</span>
                </label>
                <input
                  type="range"
                  value={cropForm.temperature}
                  onChange={(e) => setCropForm({ ...cropForm, temperature: parseInt(e.target.value) })}
                  min="10"
                  max="45"
                  style={{ width: "100%", cursor: "pointer", accentColor: "#8b5cf6" }}
                />
              </div>

              <div className="input-group">
                <label style={{ fontSize: "0.8rem", opacity: 0.8, display: "flex", justifyContent: "space-between" }}>
                  <span>Humidity (%)</span>
                  <span>{cropForm.humidity}%</span>
                </label>
                <input
                  type="range"
                  value={cropForm.humidity}
                  onChange={(e) => setCropForm({ ...cropForm, humidity: parseInt(e.target.value) })}
                  min="15"
                  max="100"
                  style={{ width: "100%", cursor: "pointer", accentColor: "#8b5cf6" }}
                />
              </div>

              <div className="input-group">
                <label style={{ fontSize: "0.8rem", opacity: 0.8, display: "flex", justifyContent: "space-between" }}>
                  <span>Rainfall (mm)</span>
                  <span>{cropForm.rainfall} mm</span>
                </label>
                <input
                  type="range"
                  value={cropForm.rainfall}
                  onChange={(e) => setCropForm({ ...cropForm, rainfall: parseInt(e.target.value) })}
                  min="20"
                  max="300"
                  style={{ width: "100%", cursor: "pointer", accentColor: "#8b5cf6" }}
                />
              </div>

              {cropError && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: "0" }}>❌ {cropError}</p>}

              <button
                type="submit"
                className="btn-primary"
                disabled={cropLoading}
                style={{ padding: "0.85rem", borderRadius: "10px", fontSize: "1rem", fontWeight: "bold", background: "var(--primary)", border: "none", cursor: "pointer" }}
              >
                {cropLoading ? "🧠 AI Analyzing..." : "🔍 Recommend Best Crop"}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {cropResult ? (
              <div className="card" style={{ background: "var(--bg-glass)", backdropFilter: "blur(12px)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "2rem", textAlign: "center" }}>
                <span style={{ fontSize: "3rem" }}>🌾</span>
                <p style={{ fontSize: "0.85rem", textTransform: "uppercase", tracking: "wider", opacity: 0.6, marginBottom: "0.25rem" }}>
                  AI RECOMMENDATION
                </p>
                <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--warning-text)", textTransform: "capitalize", margin: "0.5rem 0" }}>
                  {cropResult.crop}
                </h2>
                <div style={{ display: "inline-block", background: "rgba(16, 185, 129, 0.1)", color: "var(--primary)", padding: "0.4rem 1rem", borderRadius: "50px", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
                  {cropResult.method}
                </div>

                <p style={{ fontSize: "0.95rem", lineHeight: "1.6", opacity: 0.9, marginBottom: "1.5rem", padding: "0 1rem" }}>
                  {cropResult.details}
                </p>

                {/* Additional regional insights */}
                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem", textAlign: "left" }}>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: "600", color: "var(--primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>💡</span> Agronomic Insights & Actions:
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>

                    {/* Card 1: Regional Climate */}
                    <div style={{
                      display: "flex",
                      gap: "0.75rem",
                      background: "rgba(59, 130, 246, 0.05)",
                      border: "1px solid rgba(59, 130, 246, 0.15)",
                      borderLeft: "4px solid #3b82f6",
                      borderRadius: "12px",
                      padding: "0.85rem 1rem",
                      transition: "all 0.2s ease"
                    }}>
                      <span style={{ fontSize: "1.25rem", marginTop: "2px" }}>{cropInsights?.climate?.icon || "📍"}</span>
                      <div>
                        <h5 style={{ margin: "0 0 0.2rem 0", fontSize: "0.85rem", fontWeight: "bold", color: "var(--info-text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {cropInsights?.climate?.title}
                        </h5>
                        <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: "1.4", opacity: 0.9 }}>
                          {cropInsights?.climate?.text}
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Soil Management */}
                    <div style={{
                      display: "flex",
                      gap: "0.75rem",
                      background: "rgba(245, 158, 11, 0.05)",
                      border: "1px solid rgba(245, 158, 11, 0.15)",
                      borderLeft: "4px solid #f59e0b",
                      borderRadius: "12px",
                      padding: "0.85rem 1rem",
                      transition: "all 0.2s ease"
                    }}>
                      <span style={{ fontSize: "1.25rem", marginTop: "2px" }}>{cropInsights?.soil?.icon || "🚜"}</span>
                      <div>
                        <h5 style={{ margin: "0 0 0.2rem 0", fontSize: "0.85rem", fontWeight: "bold", color: "var(--warning-text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {cropInsights?.soil?.title}
                        </h5>
                        <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: "1.4", opacity: 0.9 }}>
                          {cropInsights?.soil?.text}
                        </p>
                      </div>
                    </div>

                    {/* Card 3: Marketplace & Resources */}
                    <div style={{
                      display: "flex",
                      gap: "0.75rem",
                      background: "rgba(16, 185, 129, 0.05)",
                      border: "1px solid rgba(16, 185, 129, 0.15)",
                      borderLeft: "4px solid #10b981",
                      borderRadius: "12px",
                      padding: "0.85rem 1rem",
                      transition: "all 0.2s ease"
                    }}>
                      <span style={{ fontSize: "1.25rem", marginTop: "2px" }}>🌱</span>
                      <div>
                        <h5 style={{ margin: "0 0 0.2rem 0", fontSize: "0.85rem", fontWeight: "bold", color: "var(--success-text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {cropInsights?.marketplace?.title || "Marketplace & Resources"}
                        </h5>
                        <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: "1.4", opacity: 0.9 }}>
                          Check our <Link to="/service-marketplace" style={{ color: "var(--primary)", textDecoration: "underline", fontWeight: "600" }}>Service Marketplace</Link> or <Link to="/equipment" style={{ color: "var(--primary)", textDecoration: "underline", fontWeight: "600" }}>Equipment List</Link> to hire planters/harvesters suitable for <span style={{ textTransform: "capitalize", fontWeight: "bold", color: "var(--warning-text)" }}>{cropResult.crop}</span>.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "16px", padding: "3rem 2rem", textAlign: "center", opacity: 0.6 }}>
                <span style={{ fontSize: "3rem" }}>🧐</span>
                <h3 style={{ marginTop: "1rem", fontSize: "1.1rem" }}>Awaiting Analysis</h3>
                <p style={{ fontSize: "0.9rem" }}>Provide your farm's soil NPK levels and weather parameters to run the predictive model.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI LEAF SCANNER */}
      {activeTab === "disease" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>

            {/* Upload form card */}
            <div className="card" style={{ background: "var(--bg-glass)", backdropFilter: "blur(12px)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", color: "var(--primary)", marginBottom: "1rem" }}>Upload Leaf Photo</h3>

              <form onSubmit={handleScanSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                {/* Drag and Drop Zone */}
                <div
                  onClick={() => document.getElementById("leaf-file").click()}
                  style={{ border: "2px dashed var(--border-color)", borderRadius: "12px", padding: "2rem", textAlign: "center", cursor: "pointer", background: "rgba(0,0,0,0.03)", transition: "all 0.3s ease", position: "relative", overflow: "hidden" }}
                >
                  <input
                    type="file"
                    id="leaf-file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />

                  {previewUrl ? (
                    <div style={{ position: "relative", display: "inline-block", maxWidth: "100%", height: "200px" }}>
                      <img
                        src={previewUrl}
                        alt="Leaf Preview"
                        style={{ maxHeight: "100%", maxWidth: "100%", borderRadius: "8px", objectFit: "contain" }}
                      />

                      {/* Scanning animation overlay */}
                      {scanning && (
                        <div
                          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 255, 0, 0.05)", border: "1px solid rgba(0,255,0,0.3)", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center" }}
                        >
                          <div
                            style={{ width: "100%", height: "3px", background: "linear-gradient(90deg, transparent, #22c55e, transparent)", position: "absolute", top: "0%", left: 0, animation: "scanLine 2.5s infinite linear" }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: "3rem" }}>📸</span>
                      <h4 style={{ margin: "1rem 0 0.25rem 0", fontSize: "1rem" }}>Click to upload leaf photo</h4>
                      <p style={{ fontSize: "0.8rem", opacity: 0.6 }}>Supports JPG, JPEG, PNG, WEBP up to 5MB</p>
                    </div>
                  )}
                </div>

                {scanError && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: "0" }}>❌ {scanError}</p>}

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={scanning || !selectedFile}
                  style={{ padding: "0.85rem", borderRadius: "10px", fontSize: "1rem", fontWeight: "bold", background: "var(--primary)", border: "none", cursor: "pointer", opacity: (!selectedFile || scanning) ? 0.6 : 1 }}
                >
                  {scanning ? "🧬 Deep-Scanning Leaf..." : "🔍 Run AI Leaf Diagnosis"}
                </button>
              </form>
            </div>

            {/* Results section */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {scanResult ? (
                <div className="card" style={{ background: "var(--bg-glass)", backdropFilter: "blur(12px)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                      <p style={{ fontSize: "0.8rem", textTransform: "uppercase", tracking: "wider", opacity: 0.6 }}>DIAGNOSED CONDITION</p>
                      <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", color: scanResult.diagnosis.disease.includes("Healthy") ? "var(--success-text)" : "var(--warning-text)", marginTop: "0.25rem" }}>
                        {scanResult.diagnosis.disease}
                      </h3>
                      <p style={{ fontSize: "0.85rem", opacity: 0.7, margin: "0.25rem 0 0 0" }}>Crop: <strong>{scanResult.diagnosis.crop}</strong></p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>
                        {Math.round(scanResult.confidence * 100)}%
                      </div>
                      <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>Confidence</span>
                    </div>
                  </div>

                  {/* Confidence progress bar */}
                  <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.08)", borderRadius: "10px", marginBottom: "1.5rem", overflow: "hidden" }}>
                    <div
                      style={{ height: "100%", width: `${scanResult.confidence * 100}%`, background: "linear-gradient(90deg, var(--primary), #3b82f6)", borderRadius: "10px" }}
                    />
                  </div>

                  {/* Dynamic method badge */}
                  <div style={{ display: "inline-block", background: "rgba(16, 185, 129, 0.1)", color: "var(--primary)", padding: "0.3rem 0.8rem", borderRadius: "50px", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "1rem" }}>
                    {scanResult.method}
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                    <h4 style={{ fontSize: "0.9rem", color: "#f43f5e", marginBottom: "0.25rem" }}>🔎 Observed Symptoms:</h4>
                    <p style={{ fontSize: "0.85rem", opacity: 0.9, lineHeight: "1.5", margin: "0" }}>
                      {scanResult.diagnosis.symptoms}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "16px", padding: "3rem 2rem", textAlign: "center", opacity: 0.6 }}>
                  <span style={{ fontSize: "3rem" }}>📸</span>
                  <h3 style={{ marginTop: "1rem", fontSize: "1.1rem" }}>Awaiting Leaf Scan</h3>
                  <p style={{ fontSize: "0.9rem" }}>Drag or upload an image of a diseased crop leaf, then run the diagnosis engine.</p>
                </div>
              )}
            </div>
          </div>

          {/* Treatment Guidelines Panel (Displays only when diagnostic results are loaded) */}
          {scanResult && (
            <div className="card" style={{ background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", color: "var(--primary)", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
                🛠️ Treatment & Control Advisory
              </h3>

              {/* Treatment tab selectors */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.2rem" }}>
                <button
                  onClick={() => setActiveTreatmentTab("organic")}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", borderRadius: "8px", border: activeTreatmentTab === "organic" ? "none" : "1px solid var(--border-color)", background: activeTreatmentTab === "organic" ? "rgba(16, 185, 129, 0.2)" : "transparent", color: activeTreatmentTab === "organic" ? "var(--primary)" : "var(--text-muted)", cursor: "pointer", transition: "all 0.3s ease" }}
                >
                  🍃 Organic & Biological Remedies
                </button>
                <button
                  onClick={() => setActiveTreatmentTab("chemical")}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", borderRadius: "8px", border: activeTreatmentTab === "chemical" ? "none" : "1px solid var(--border-color)", background: activeTreatmentTab === "chemical" ? "rgba(239, 68, 68, 0.2)" : "transparent", color: activeTreatmentTab === "chemical" ? "#ef4444" : "var(--text-muted)", cursor: "pointer", transition: "all 0.3s ease" }}
                >
                  🧪 Chemical Control (Recommended)
                </button>
              </div>

              {/* Treatment Details */}
              {activeTreatmentTab === "organic" ? (
                <div style={{ animation: "fadeIn 0.3s ease" }}>
                  <p style={{ fontSize: "0.9rem", lineHeight: "1.6", background: "rgba(0,0,0,0.03)", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid #10b981", color: "var(--text-main)" }}>
                    {scanResult.diagnosis.organic}
                  </p>
                </div>
              ) : (
                <div style={{ animation: "fadeIn 0.3s ease" }}>
                  <p style={{ fontSize: "0.9rem", lineHeight: "1.6", background: "rgba(0,0,0,0.03)", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid #ef4444", color: "var(--text-main)" }}>
                    {scanResult.diagnosis.chemical}
                  </p>
                </div>
              )}

              {/* Prevention Rules */}
              <div style={{ borderTop: "1px solid var(--border-color)", marginTop: "1.5rem", paddingTop: "1rem" }}>
                <h4 style={{ fontSize: "0.95rem", color: "var(--warning-text)", marginBottom: "0.5rem" }}>🛡️ Preventive Action & Best Practices:</h4>
                <p style={{ fontSize: "0.85rem", opacity: 0.85, lineHeight: "1.5", color: "var(--text-main)" }}>
                  {scanResult.diagnosis.prevention}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Embedded Scan Animation Keyframe Styles */}
      <style>{`
        @keyframes scanLine {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Recommendations;