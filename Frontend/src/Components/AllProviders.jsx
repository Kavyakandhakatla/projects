import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style.css"; // custom styles

export default function AllProviders() {
  const [providers, setProviders] = useState([]);

  const fetchProviders = async () => {
    try {
      const res = await axios.get("https://snowmow.online/api/auth/allproviders");
      setProviders(res.data);
    } catch (err) {
      console.error("Failed to fetch providers:", err);
      setProviders([]);
    }
  };

  const toggleProviderStatus = async (id) => {
    try {
      console.log("Toggling status for provider ID:", id); 
      await axios.patch("https://snowmow.online/api/providers/${providers.id}/toggle-status");
      fetchProviders(); // Refresh data after toggling
    } catch (err) {
      console.error("Failed to toggle provider status:", err);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <div className="providers-page-wrapper">
      <h2 className="page-title">All Approved Providers</h2>
      <div className="providers-grid">
        {providers.map((p) => (
          <div key={p._id} className="provider-card">
            <img src={p.picture} alt={p.name} className="provider-avatar" />
            <div className="provider-info">
              <h3 className="provider-name">{p.name}</h3>
              <p><strong>Email:</strong> {p.email}</p>
              <p><strong>Locations:</strong> {Array.isArray(p.locations) ? p.locations.join(", ") : p.locations || "N/A"}</p>
              <p><strong>Services:</strong> {Array.isArray(p.services) ? p.services.join(", ") : p.services || "N/A"}</p>
              {p.services?.includes("Snow Removal") && (
                <p><strong>Snow Rate:</strong> ${p.snowrate}/hr</p>
              )}
              {p.services?.includes("Lawn Mowing") && (
                <p><strong>Lawn Rate:</strong> ${p.lawnrate}/sq.ft</p>
              )}
              <p><strong>Experience:</strong> {p.experience} year(s)</p>
              <p><strong>Mobile:</strong> {p.mobilenumber}</p>
              <p><strong>SSN:</strong> {p.ssn}</p>
              <p><strong>About:</strong> {p.about}</p>

              {/* <button
                className={`btn btn-${p.is_disabled ? "success" : "danger"} mt-2`}
                onClick={() => toggleProviderStatus(p._id)} >
                {p.is_disabled ? "Enable" : "Disable"}
              </button> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
