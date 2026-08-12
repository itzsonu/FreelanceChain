import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginRegister.css";

export default function LoginRegister() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (tab === "register" && formData.password !== formData.confirmPassword) {
      alert("Password and Confirm Password do not match");
      return;
    }

    try {
      setLoading(true);

      const url =
        tab === "login"
          ? "http://localhost:5000/api/auth/login"
          : "http://localhost:5000/api/auth/register";

      const body =
        tab === "login"
          ? {
              email: formData.email,
              password: formData.password,
              role,
            }
          : {
              name: formData.name,
              email: formData.email,
              password: formData.password,
              role,
            };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      if (tab === "register") {
        alert("Registration successful. Now login.");
        setTab("login");
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "client") {
          navigate("/client-dashboard");
        } else {
          navigate("/freelancer-dashboard");
        }
      }
    } catch (error) {
      alert("Backend se connection nahi ho raha. Check karo backend running hai ya nahi.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand" onClick={() => navigate("/")}>
          ← FreelanceChain
        </div>

        <div className="auth-tagline">
          <h2>Accountability starts here.</h2>
          <p>Milestone by milestone. Payment by payment. Trust by trust.</p>
        </div>

        <div className="auth-chain-visual">
          {["Design UI", "Build Backend", "Testing", "Delivery"].map((m, i) => (
            <div
              className="chain-node"
              key={i}
              style={{ opacity: i === 0 ? 1 : 0.4 + i * 0.15 }}
            >
              <div className={`node-dot ${i === 0 ? "active" : i < 2 ? "done" : "locked"}`}></div>
              <span>{m}</span>
              {i < 3 && <div className="node-line"></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="tab-switcher">
            <button
              type="button"
              className={tab === "login" ? "active" : ""}
              onClick={() => setTab("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={tab === "register" ? "active" : ""}
              onClick={() => setTab("register")}
            >
              Register
            </button>
          </div>

          <div className="role-picker">
            <button
              type="button"
              className={role === "client" ? "role-btn active" : "role-btn"}
              onClick={() => setRole("client")}
            >
              👤 Client
            </button>

            <button
              type="button"
              className={role === "freelancer" ? "role-btn active" : "role-btn"}
              onClick={() => setRole("freelancer")}
            >
              💼 Freelancer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {tab === "register" && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {tab === "register" && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading
                ? "Please wait..."
                : tab === "login"
                ? `Login as ${role}`
                : `Create ${role} Account`}
            </button>
          </form>

          <p className="auth-switch">
            {tab === "login" ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setTab(tab === "login" ? "register" : "login")}>
              {tab === "login" ? "Register" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
