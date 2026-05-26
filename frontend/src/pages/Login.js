import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      // Store JWT token
      localStorage.setItem("token", res.data.token);
      
      // Determine role from response and navigate accordingly
      const userRole = res.data.user.role;
      if (userRole === "owner" || userRole === "admin") {
        navigate("/profile"); 
      } else {
        navigate("/equipment");
      }
      alert("Login Success");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login to your Account</h2>
        <div className="input-group">
          <input
            placeholder="Email Address"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;