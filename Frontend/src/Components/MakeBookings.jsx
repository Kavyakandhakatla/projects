import React, { useState, useEffect } from "react";
import axios from "axios";
import BookingForm from "./BookingForm";
import "./style.css";

const locationOptions = ["Overland Park", "Kansas City", "Lee's Summit"];

export default function MakeBookings() {
  const [serviceType, setServiceType] = useState("");
  const [location, setLocation] = useState("");
  const [minRating, setMinRating] = useState("");
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    if (!serviceType) {
      setProviders([]);
      return;
    }

    const fetchProviders = async () => {
      setLoading(true);
      try {
        const params = {
          serviceType,
          ...(location && { location }),
          ...(minRating && { minRating }),
        };

        const { data } = await axios.get(
          "https://snowmow.online/api/auth/providers/search",
          { params }
        );
        setProviders(data);
      } catch (err) {
        console.error("Error fetching providers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [serviceType, location, minRating]);

  return (
    <div className="make-bookings-wrapper">
      <h1 className="section-title">Book Your Service</h1>

      <div className="filter-card">
        <div className="filter-group">
          <label>Service</label>
          <select className="form-control" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
            <option value="">Select Service</option>
            <option value="Snow Removal">Snow Removal</option>
            <option value="Lawn Mowing">Lawn Mowing</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Location</label>
          <select className="form-control" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">All Locations</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* <div className="filter-group">
          <label>Min Rating</label>
          <select className="form-control" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
            <option value="">Any</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r}+</option>
            ))}
          </select>
        </div> */}
      </div>

      {loading ? (
        <div className="loader">Loading providers...</div>
      ) : providers.length === 0 ? (
        <div className="no-results">No providers found. Try adjusting your filters..</div>
      ) : (
        <div className="providers-grid">
          {providers.map((p) => (
            <div key={p.id} className="provider-card">
              <h3>{p.name}</h3>
              <p><strong>Services:</strong> {p.services}</p>
              <p><strong>Location:</strong> {p.locations}</p>
              {/* <p><strong>Rating:</strong> {parseFloat(p.average_rating).toFixed(1)}</p> */}
              <p><strong>Rate:</strong> ${serviceType === "Snow Removal" ? p.snowrate : p.lawnrate} {serviceType === "Snow Removal" ? "/hr" : "/sq.ft"}</p>
              <button className="primary-btn" onClick={() => setSelectedProvider(p)}>Book Now</button>
            </div>
          ))}
        </div>
      )}

      {selectedProvider && (
        <BookingForm provider={selectedProvider} serviceType={serviceType} onClose={() => setSelectedProvider(null)} />
      )}
    </div>
  );
}
