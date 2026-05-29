import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "farmer",
    serviceType: "Land Preparation",
    locationInput: "",
    location: null
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Resolve location using Nominatim if provided
    let locationData = null;
    if (form.locationInput.trim()) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.locationInput)}&limit=1`);
        const data = await res.json();
        if (data.length) {
          const { display_name, lat, lon } = data[0];
          locationData = { name: display_name, lat: parseFloat(lat), lon: parseFloat(lon) };
        } else {
          setError("Location not found. Please enter a valid city or district.");
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error(e);
        setError("Failed to resolve location.");
        setLoading(false);
        return;
      }
    }
    // Merge resolved location into form payload
    const payload = { ...form, location: locationData };
    // Remove temporary fields before sending
    delete payload.locationInput;

    // Password validation: > 8 characters, at least one uppercase, at least one special character
    const hasUpperCase = /[A-Z]/.test(form.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);

    if (form.password.length < 8 || form.password.length > 12) {
      setError("Password must be between 8 and 12 characters long.");
      setLoading(false);
      return;
    }
    if (!hasUpperCase) {
      setError("Password must contain at least one uppercase letter.");
      setLoading(false);
      return;
    }
    if (!hasSpecialChar) {
      setError("Password must contain at least one special character.");
      setLoading(false);
      return;
    }

    try {
      const res = await API.post("/auth/register", payload);

      if (res.data.pendingApproval) {
        navigate("/login", { state: { message: res.data.message } });
        return;
      }

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      navigate(form.role === "owner" ? "/profile" : "/equipment");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "0.5rem" }}>Join AgriShare</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Smart tools for a smarter farm.</p>
        </div>

        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            padding: "1rem",
            borderRadius: "12px",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            animation: "fadeIn 0.3s ease"
          }}>
            ⚠️ {error}
          </div>
        )}

        <div className="input-group">
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="input-group">
          <input
            placeholder="Location (City/District)"
            value={form.locationInput}
            onChange={(e) => setForm({ ...form, locationInput: e.target.value })}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            placeholder="Create Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <div className="input-group">
          <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", display: "block" }}>Select Your Role</label>
          <select onChange={(e) => setForm({ ...form, role: e.target.value })} value={form.role}>
            <option value="farmer">Farmer (Rent Equipment)</option>
            <option value="owner">Equipment Owner (List Equipment)</option>
            <option value="service_provider">Service Provider (Offer Services)</option>
          </select>
        </div>

        {form.role === "service_provider" && (
          <div className="input-group">
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", display: "block" }}>Select Your Specialty</label>
            <select onChange={(e) => setForm({ ...form, serviceType: e.target.value })} value={form.serviceType}>
              <option value="Land Preparation">Land Preparation</option>
              <option value="Harvesting">Harvesting</option>
              <option value="Crop Spraying">Crop Spraying</option>
              <option value="Soil Testing">Soil Testing</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Get Started"}
        </button>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Already have an account? <span onClick={() => navigate("/login")} style={{ color: "var(--primary)", cursor: "pointer", fontWeight: "600" }}>Login</span>
        </p>
      </form>
    </div>
  );
}

export default Register;