import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../services/api";

function Login() {
  const { t } = useTranslation();
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
      alert(t("login_success"));
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Login failed";
      alert(t(msg, msg));
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{t("login_to_account")}</h2>
        <div className="input-group">
          <input
            placeholder={t("email_address")}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            placeholder={t("password_placeholder")}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button type="submit">{t("login_btn")}</button>
      </form>
    </div>
  );
}

export default Login;