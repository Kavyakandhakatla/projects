import React from "react";
import "./style.css";
import { useAuth } from "./AuthContext";  // ✅ Import AuthContext

function Servicesouterview() {
  const { user } = useAuth(); // ✅ Get user info

  return (
    <div className="outerview-wrapper">

      {/* SERVICES */}
      <section className="outer-services-section">
        <h2 className="section-title">What We Offer</h2>
        <div className="outer-service-cards">

          <div className="outer-service-card">
            <i className="bi bi-snow2 display-3 text-info mb-3"></i>
            <h3>Snow Removal</h3>
            <p>24/7 professional snow plowing & clearing for driveways, walkways & parking lots.</p>
          </div>

          <div className="outer-service-card">
            <i className="bi bi-tree-fill display-3 text-success mb-3"></i>
            <h3>Lawn Mowing</h3>
            <p>Expert mowing, edging, and grass care services for a perfect green lawn year-round.</p>
          </div>

          {/* <div className="outer-service-card">
            <i className="bi bi-flower1 display-3 text-warning mb-3"></i>
            <h3>Landscaping</h3>
            <p>Full landscaping design & maintenance to elevate your property appearance.</p>
            <span className="price-badge">Custom Pricing</span>
          </div> */}

        </div>
      </section>

      {/* ✅ Hide CTA if user is logged in */}
      {!user && (
        <section className="outer-cta-section">
          <h2>Ready to Book?</h2>
          <p>Sign up today and schedule your first service in minutes!</p>
          <button className="btn btn-lg btn-primary mt-3" onClick={() => window.location.href = "/login"}>
            Get Started
          </button>
        </section>
      )}
    </div>
  );
}

export default Servicesouterview;
