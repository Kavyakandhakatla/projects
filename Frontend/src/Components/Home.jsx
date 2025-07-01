import React, { useEffect, useState, useRef } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const warningDisplayed = useRef(false);

  useEffect(() => {
    if (!user) return;

    const stored = JSON.parse(localStorage.getItem("user"));
    const sessionDuration = stored.expiry - stored.createdAt; // Your session time from authcontext.jsx

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      setShowPopup(false);
      warningDisplayed.current = false;
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    const interval = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current;
      const remainingTime = sessionDuration - inactiveTime;

      if (remainingTime <= 5000 && remainingTime > 0 && !warningDisplayed.current) {
        setShowPopup(true);
        warningDisplayed.current = true;
      }

      if (remainingTime <= 0) {
        logout(); // Use logout from AuthContext
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      clearInterval(interval);
    };
  }, [user, logout]);

  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>SnowMow Solutions</h1>
          <p>Making Outdoor Maintenance Easy, Year-Round</p>
          <button className="cta-button" onClick={() => navigate("/servicesouterview")}>
            Explore Our Services
          </button>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="features-section">
        <h2>Why Choose SnowMow?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="bi bi-truck"></i>
            <h4>Quick Response</h4>
            <p>Fast, on-time snow removal and mowing services every season.</p>
          </div>
          <div className="feature-card">
            <i className="bi bi-shield-check"></i>
            <h4>Trusted Professionals</h4>
            <p>Certified, insured, and verified service providers.</p>
          </div>
          <div className="feature-card">
            <i className="bi bi-cash-stack"></i>
            <h4>Transparent Pricing</h4>
            <p>Clear, upfront pricing with no hidden fees.</p>
          </div>
          <div className="feature-card">
            <i className="bi bi-stars"></i>
            <h4>Top Rated</h4>
            <p>Consistently rated highly by happy customers.</p>
          </div>
        </div>
      </section>

      {/* Contact Footer */}
      <footer className="contact-footer">
        <h2>Contact Us</h2>
        <p>📞 Phone: +1 (555) 123-4567</p>
        <p>📧 Email: info@snowmowsolutions.com</p>
      </footer>

      {/* Session Expiration Popup */}
      {showPopup && (
        <div className="session-popup">
          <div className="popup-content">
            <h4>Session Expiring</h4>
            <p>Your session will expire shortly due to inactivity.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
