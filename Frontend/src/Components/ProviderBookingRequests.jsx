import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import './style.css'; // custom styling

const ProviderBookingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const handleRejectClick = (id) => {
    setSelectedBookingId(id);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    try {
      await axios.patch(`https://snowmow.online/api/bookings/reject/${selectedBookingId}`, {
        reason: rejectReason
      });
      alert("Booking rejected");
      setShowRejectModal(false);
      fetchBookings(); // Refresh list
    } catch (err) {
      console.error("Error rejecting booking:", err);
    }
  };


  const fetchBookings = async () => {
    try {
      const res = await axios.get(`https://snowmow.online/api/bookings/provider/${user.id}?status=pending`);
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      await axios.put(`https://snowmow.online/api/bookings/status/${bookingId}`, { status });
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      console.error(`Failed to ${status} booking:`, err);
      alert(`Error: Unable to ${status} booking`);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <div className="text-muted p-4">Loading booking requests...</div>;
  if (error) return <div className="text-danger p-4">{error}</div>;
  if (bookings.length === 0) return <div className="text-secondary p-4">No pending booking requests.</div>;

  return (
    <div className="container my-4">
      <h2 className="mb-4">Booking Requests</h2>
      {bookings.map((booking) => (
        <div key={booking.id} className="card shadow-sm mb-3 p-4">
          <div className="card-body">
            <h5 className="card-title">
              Customer: <span className="text-dark">{booking.customer_name}</span>
            </h5>
            <p className="card-text mb-1"><strong>Service:</strong> {booking.service_type}</p>
            <p className="card-text mb-1"><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
            <p className="card-text mb-1"><strong>Location:</strong> {booking.location}</p>
            <p className="card-text mb-1"><strong>Estimated Hours:</strong> {booking.estimated_hours}</p>
            <p className="card-text mb-1"><strong>Sq. Ft:</strong> {booking.sqft}</p>
            <p className="card-text mb-3"><strong>Special Request:</strong> {booking.special_request || 'None'}</p>

            {/* <p className="card-text mb-1"><strong>Rate:</strong> {formatCurrency(booking.rate)}</p>
            <p className="card-text mb-1"><strong>Commission:</strong> {formatCurrency(booking.admin_commission)}</p>
            <p className="card-text mb-1"><strong>Tax:</strong> {formatCurrency(booking.tax)}</p>
            <p className="card-text mb-1"><strong>Total Cost:</strong> {formatCurrency(booking.total_cost)}</p>  */}
            <div className="d-flex gap-2">
              <button
                className="btn btn-success me-4"
                onClick={() => updateStatus(booking.id, 'accepted')}
              >
                Accept
              </button>
              <button
                className="btn btn-danger"
                onClick={() => updateStatus(booking.id, 'rejected')}
              >
                Reject
              </button>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};

export default ProviderBookingRequests;
