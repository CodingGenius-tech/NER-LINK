import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      console.log("Login response:", data);

      if (!data.data?.token) {
        throw new Error(
          "Login successful, but token was not received"
        );
      }

      login(data.data.token);

      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE */}
      <div className="login-info">

        <div className="login-brand">
          <div className="brand-mark">NER</div>

          <div>
            <h2>NER-LINK</h2>
            <span>Logistics Intelligence Platform</span>
          </div>
        </div>

        <div className="login-intro">

          <div className="system-label">
            <span></span>
            REGIONAL LOGISTICS INTELLIGENCE
          </div>

          <h1>
            Connecting the
            <br />
            <strong>North Eastern Region.</strong>
          </h1>

          <p>
            Real-time visibility into roads, routes, essential
            supplies and transportation accessibility across NER.
          </p>

        </div>

        <div className="login-features">

          <div className="feature">
            <div className="feature-icon">◉</div>

            <div>
              <strong>Regional Accessibility</strong>
              <span>
                Monitor road and district connectivity
              </span>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon">⚠</div>

            <div>
              <strong>Disruption Intelligence</strong>
              <span>
                Identify high-risk routes and disruptions
              </span>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon">◈</div>

            <div>
              <strong>Essential Supply Tracking</strong>
              <span>
                Monitor critical logistics movement
              </span>
            </div>
          </div>

        </div>

      </div>


      {/* LOGIN SIDE */}
      <div className="login-container">

        <div className="login-card">

          <div className="card-header">

            <div className="secure-icon">
              ◈
            </div>

            <div>
              <span className="card-label">
                SECURE ACCESS
              </span>

              <h2>Sign in to NER-LINK</h2>

              <p>
                Access the regional logistics command center.
              </p>
            </div>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label htmlFor="email">
                EMAIL ADDRESS
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="official.email@example.com"
                autoComplete="email"
                required
              />

            </div>


            <div className="form-group">

              <label htmlFor="password">
                PASSWORD
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

            </div>


            {error && (
              <div className="login-error">
                <span>!</span>
                {error}
              </div>
            )}


            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                "AUTHENTICATING..."
              ) : (
                <>
                  Access Command Center
                  <span>→</span>
                </>
              )}
            </button>

          </form>


          <div className="login-security">
            <span>●</span>
            Secure authenticated connection
          </div>

        </div>


        <div className="login-footer">
          <span>NER-LINK</span>
          <span>
            North Eastern Region Logistics Intelligence
          </span>
        </div>

      </div>

    </div>
  );
}

export default Login;