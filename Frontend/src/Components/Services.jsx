import React from "react";
import "./style.css";

function Services() {
  return (
    <div className="services-wrapper">
      <h1 className="text-center my-5">Our Available Services</h1>

      <div className="services-grid">
        <div className="service-card">
          <i className="bi bi-snow display-4 text-info mb-3"></i>
          <h3>Snow Removal</h3>
          <p>Reliable & fast snow removal for residential & commercial properties.</p>
          <p className="price-tag">$40/hr</p>
        </div>

        <div className="service-card">
          <i className="bi bi-tree-fill display-4 text-success mb-3"></i>
          <h3>Lawn Maintenance</h3>
          <p>Professional lawn mowing, trimming, fertilization & care services.</p>
          <p className="price-tag">$0.10 / sq.ft</p>
        </div>

        {/* <div className="service-card">
          <i className="bi bi-brush display-4 text-warning mb-3"></i>
          <h3>Landscaping</h3>
          <p>Custom landscaping design & seasonal garden care to elevate your outdoor spaces.</p>
          <p className="price-tag">Custom Pricing</p>
        </div> */}
      </div>
    </div>
  );
}

export default Services;
