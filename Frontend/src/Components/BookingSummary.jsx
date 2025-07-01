import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BookingSummary() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const booking = state?.booking;

  if (!booking) return <p>No booking information available.</p>;

  return (
    <div className="booking-summary-wrapper">
      <h2>Booking Confirmed 🎉</h2>
      <p><strong>Provider:</strong> {booking.provider_name}</p>
      <p><strong>Service:</strong> {booking.service_type}</p>
      <p><strong>Location:</strong> {booking.location}</p>
      <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>

      <h4>Cost Breakdown:</h4>
      <ul>
        <li>Base Cost: ${booking.base_cost?.toFixed(2)}</li>
        <li>Admin Fee: ${booking.admin_commission?.toFixed(2)}</li>
        <li>Tax: ${booking.tax?.toFixed(2)}</li>
        <li><strong>Total:</strong> ${booking.total_cost?.toFixed(2)}</li>
      </ul>

      <button onClick={() => navigate("/")}>Back to Home</button>
      <button onClick={() => navigate("/customer/mybookings")}>Go to My Bookings</button>
    </div>
  );
}
