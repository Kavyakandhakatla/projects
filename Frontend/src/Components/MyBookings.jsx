import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import BookingForm from "./BookingForm";
import "./style.css";
import { loadStripe } from '@stripe/stripe-js';


export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`https://snowmow.online/api/bookings/customer/${user.id}`);
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const handleBookingUpdated = () => {
    setSelectedBooking(null);
    fetchBookings();
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    try {
      await axios.put(`https://snowmow.online/api/bookings/cancel/${bookingId}`);
      fetchBookings();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking.");
    }
  };

  const renderStatusTag = (status) => {
    const colorMap = {
      accepted: "#facc15",
      Cancelled: "#e06f63",
      completed: "#2196F3",
      pending: "#FF9800",
      rejected:"#f44336",

    };
    return (
      <span
        style={{
          backgroundColor: colorMap[status] || "#ccc",
          color: "#fff",
          padding: "3px 8px",
          borderRadius: "6px",
          fontSize: "0.8rem",
        }}
      >
        {status}
      </span>
    );
  };


  const filteredBookings = bookings.filter(b => {
    return filterStatus === "All" || b.status === filterStatus;
  });

  const stripePromise = loadStripe('pk_test_51RafEEI3paNQlZbwotfBIHqev2o0k6HZppUCF2L9zSAnDQZFaQxUCelWvX4KboXKsRPRx8YynK270fDwq7tge5H600iDDiMeyI'); // your Stripe public key

  const handlePayNow = async (booking) => {
    const stripe = await stripePromise;

    const response = await axios.post('https://snowmow.online/api/bookings/create-checkout-session', {
      bookingId: booking.id,
      amount: booking.total_cost,
      email: user.email,
    });

    const session = response.data;
    await stripe.redirectToCheckout({ sessionId: session.id });
  };


  return (
    <div className="my-bookings-wrapper">
      <h1 className="section-title">My Bookings</h1>

      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <label htmlFor="statusFilter" style={{ fontWeight: "bold" }}>Filter by Status:</label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          <option value="All">All</option>
          <option value="accepted">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="loader">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="no-results">No bookings match this filter.</div>
      ) : (
        <div className="booking-history-grid">
          {filteredBookings.map((b) => (
            <div key={b.id} className="booking-history-card">
              <div className="booking-top">
                <h3>{b.service_type}</h3>
                <span className="booking-date">{new Date(b.date).toLocaleDateString()}</span>
              </div>
              <p><strong>Status:</strong> {renderStatusTag(b.status || "Confirmed")}</p>
              <p><strong>Provider:</strong> {b.provider_name || b.provider_id}</p>
              <p><strong>Location:</strong> {b.location}</p>

              <p>
                <strong>Cost:</strong>{" "}
                <span
                  title={
                    b.base_cost != null && b.admin_commission != null && b.tax != null && b.total_cost != null
                      ? `Base: $${parseFloat(b.base_cost).toFixed(2)}\nAdmin: $${parseFloat(b.admin_commission).toFixed(2)}\nTax: $${parseFloat(b.tax).toFixed(2)}\nTotal: $${parseFloat(b.total_cost).toFixed(2)}`
                      : "Cost breakdown unavailable"
                  }
                >
                  {b.total_cost != null ? `$${parseFloat(b.total_cost).toFixed(2)}` : "N/A"}
                </span>
              </p>

              {b.special_request && <p><strong>Note:</strong> {b.special_request}</p>}

              {b.status === 'pending' && (
                <div className="button-group">
                  <button className="edit-btn" onClick={() => setSelectedBooking(b)} >Edit</button>
                  <button className="cancel-btn" onClick={() => handleCancelBooking(b.id)}>Cancel</button>
                </div>
              )}

              {b.status === 'completed' && b.payment_status && (
                <span className="badge bg-success">✅ Completed - Paid</span>
              )}

              {b.status === 'completed' && !b.payment_status && (
                <button className="btn btn-primary" onClick={() => handlePayNow(b)}>
                  Pay Now
                </button>
              )}


            </div>
          ))}
        </div>
      )}

      {selectedBooking && (
        <BookingForm
          isEditMode={true}
          existingBooking={selectedBooking}
          onClose={handleBookingUpdated}
        />
      )}
    </div>
  );
}
