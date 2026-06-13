import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../src/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { loginWithEmail, loginWithGoogle, loading, authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await loginWithEmail(formData.email, formData.password);
      navigate("/activity");
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/activity");
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const prevent = (e) => e.preventDefault();

  return (
    <>
      <div className="main-wrapper">
        <section className="section">
          <div className="container">

            <div className="row g-0" style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
            }}>
              {/* Left Info Section */}
              <div className="col-md-6 login-left d-flex flex-column justify-content-center">
                <h2 className="text-dark">Welcome To Us!</h2>
                <p className="f-4 text-dark">
                  Login to access your dashboard, manage your account, and continue where you
                  left off.
                </p>
                <img src="/assets/img/login.png" alt="Login" />
              </div>

              {/* Login Form */}
              <div className="col-md-6 login-right">
                <h3 className="mb-4 fw-semibold">Login</h3>

                <form onSubmit={onSubmit}>
                  {authError && (
                    <div className="alert alert-danger mb-3">
                      {authError.message}
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label" htmlFor="login_email">
                      Email address
                    </label>
                    <input
                      id="login_email"
                      name="email"
                      className="form-control"
                      placeholder="Enter your email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="login_password">
                      Password
                    </label>
                    <input
                      id="login_password"
                      name="password"
                      className="form-control"
                      placeholder="Enter your password"
                      type="password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        id="remember_me"
                        type="checkbox"
                      />
                      <label className="form-check-label" htmlFor="remember_me">
                        Remember me
                      </label>
                    </div>
                    <a className="text-decoration-none" href="#" onClick={prevent}>
                      Forgot password?
                    </a>
                  </div>

                  <button
                    className="btn btn-primary w-100 mb-3"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <div className="divider">or</div>

                {/* Social Login */}
                <div className="d-grid gap-2">
                  <button
                    className="social-btn btn-danger border-0"
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    <i className="bi bi-google me-2"></i>
                    {loading ? 'Logging in...' : 'Login with Google'}
                  </button>
                </div>

                <p className="text-center mt-4">
                  Don’t have an account?{" "}
                  <Link className="text-decoration-none fw-semibold" to="/signup">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>



          </div>
        </section>
      </div>
    </>
  );
}
