import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Signup() {
  const navigate = useNavigate();
  const { registerWithEmail, loginWithGoogle, loading, authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    gender: 'Male',
    acceptTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password || !formData.confirmPassword) {
      return 'Please fill in all fields';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (!formData.acceptTerms) {
      return 'Please accept the terms and conditions';
    }
    return null;
  };

  async function onSubmit(e) {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      await registerWithEmail({
        email: formData.email,
        password: formData.password,
        displayName: `${formData.firstName} ${formData.lastName}`
      });
      navigate("/activity");
    } catch (error) {
      console.error('Signup failed:', error);
    }
  }

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
      navigate("/activity");
    } catch (error) {
      console.error('Google signup failed:', error);
    }
  };

  const prevent = (e) => e.preventDefault();
  return (
    <>
      <div id="global-loader">
        <div className="loader-img">
          <img alt="Global" className="img-fluid" src="/assets/img/logo.png" style={{ width: "120px" }} />
        </div>
      </div>
      <div className="main-wrapper">
        <section className="section pt-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-12">
                <div className="card login-card glass-card">
                  <div className="row g-0">
                    <div className="col-md-6 login-left d-flex flex-column justify-content-center">
                      <h2 className="text-dark">
                        Welcome To Us!
                      </h2>
                      <p className="mt-3 f-4 text-dark">
                        Create your account to access your dashboard, manage your account, and continue where you left off.
                      </p>
                      <img src="/assets/img/login.png" />
                    </div>
                    <div className="col-md-6 login-right">
                      <h3 className="mb-4 fw-semibold">
                        Sign Up
                      </h3>
                      <form onSubmit={onSubmit}>
                        {authError && (
                          <div className="alert alert-danger mb-3">
                            {authError.message}
                          </div>
                        )}
                        <div className="mb-3">
                          <label className="form-label" htmlFor="signup_email">
                            Email address
                          </label>
                          <input
                            id="signup_email"
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
                        <div className="row">
                          <div className="mb-3 col-lg-6">
                            <label className="form-label" htmlFor="signup_firstname">
                              First name
                            </label>
                            <input
                              id="signup_firstname"
                              name="firstName"
                              className="form-control"
                              placeholder="First Name"
                              type="text"
                              autoComplete="given-name"
                              value={formData.firstName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="mb-3 col-lg-6">
                            <label className="form-label" htmlFor="signup_lastname">
                              Last name
                            </label>
                            <input
                              id="signup_lastname"
                              name="lastName"
                              className="form-control"
                              placeholder="Last Name"
                              type="text"
                              autoComplete="family-name"
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="mb-3 col-lg-6">
                            <label className="form-label" htmlFor="signup_password">
                              Password
                            </label>
                            <input
                              id="signup_password"
                              name="password"
                              className="form-control"
                              placeholder="Enter your password"
                              type="password"
                              autoComplete="new-password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="mb-3 col-lg-6">
                            <label className="form-label" htmlFor="signup_confirm_password">
                              Confirm Password
                            </label>
                            <input
                              id="signup_confirm_password"
                              name="confirmPassword"
                              className="form-control"
                              placeholder="Confirm password"
                              type="password"
                              autoComplete="new-password"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label" htmlFor="signup_gender">
                            Gender
                          </label>
                          <select
                            id="signup_gender"
                            name="gender"
                            className="form-control"
                            value={formData.gender}
                            onChange={handleChange}
                          >
                            <option value="Male">
                              Male
                            </option>
                            <option value="Female">
                              Female
                            </option>
                          </select>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="form-check">
                            <input
                              id="accept_terms"
                              name="acceptTerms"
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.acceptTerms}
                              onChange={handleChange}
                              required
                            />
                            <label className="form-check-label" htmlFor="accept_terms">
                              I Accept
                              <a href="#" onClick={prevent}>
                                terms and condition
                              </a>
                            </label>
                          </div>
                        </div>
                        <button
                          className="btn btn-primary w-100 mb-3"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? 'Signing up...' : 'Sign Up'}
                        </button>
                      </form>
                      <div className="divider">
                        or
                      </div>
                      <div className="d-grid gap-2">
                        <button
                          className="social-btn btn-danger border-0"
                          type="button"
                          onClick={handleGoogleSignup}
                          disabled={loading}
                        >
                          <i className="bi bi-google me-2"></i>
                          {loading ? 'Signing up...' : 'Signup with Google'}
                        </button>
                      </div>
                      <p className="text-center mt-4">
                        If you have an account.{" "}
                        <Link className="text-decoration-none fw-semibold" to="/login">
                          Login
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
