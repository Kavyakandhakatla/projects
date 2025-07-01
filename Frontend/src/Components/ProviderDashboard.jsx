import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const today = new Date();
  const next7 = new Date();
  next7.setDate(today.getDate() + 7);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`https://snowmow.online/api/bookings/provider/${user.id}`);
        setBookings(res.data || []);
      } catch (err) {
        console.error('Failed to fetch bookings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const formatDate = d => new Date(d).toLocaleDateString();
  const formatCost = c => `$${parseFloat(c).toFixed(2)}`;

  const isWithin7Days = (dateStr) => {
    const d = new Date(dateStr);
    return d >= today && d <= next7;
  };

  const startService = async (id) => {
    await axios.patch(`https://snowmow.online/api/bookings/start/${id}`);
    window.location.reload();
  };

  const completeService = async (id) => {
    await axios.patch(`https://snowmow.online/api/bookings/complete/${id}`);
    window.location.reload();
  };

  const filtered = bookings.filter((b) =>
    statusFilter === "all" ? true : b.status === statusFilter
  );

  const upcoming = bookings.filter(b =>
    (b.status === 'accepted' || b.status === 'in_progress') && isWithin7Days(b.date)
  );

  const renderCard = (b, actions = null) => (
    <div key={b.id} className="card mb-3 shadow-sm">
      <div className="card-body">
        <h5>{b.service_type}</h5>
        <p><strong>Date:</strong> {formatDate(b.date)}</p>
        <p><strong>Customer:</strong> {b.customer_name}</p>
        <p><strong>Location:</strong> {b.location}</p>
        <p><strong>Cost:</strong> {formatCost(b.total_cost)}</p>
        {b.special_request && <p><strong>Note:</strong> {b.special_request}</p>}
        {actions}
      </div>
    </div>
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Provider Dashboard</h2>

      {/* FILTER */}
      <div className="mb-4">
        <label htmlFor="statusFilter" className="form-label">Filter by Status:</label>
        <select
          id="statusFilter"
          className="form-select w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="accepted">Approved</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* UPCOMING */}
      <section className="mb-5">
        <h4>Upcoming Bookings (Next 7 Days)</h4>
        {upcoming.length > 0 ? (
          upcoming.map(b => renderCard(b))
        ) : (
          <p className="text-muted">No upcoming bookings</p>
        )}
      </section>

      {/* FILTERED BOOKINGS DISPLAYED BY STATUS */}
      {statusFilter === "accepted" && (
        <section className="mb-5">
          <h4>Approved Bookings</h4>
          {filtered.length > 0 ? (
            filtered.map(b =>
              renderCard(b, (
                <button
                  className="btn btn-sm btn-outline-success mt-2"
                  onClick={() => startService(b.id)}
                >
                  Start Service
                </button>
              ))
            )
          ) : <p className="text-muted">No approved bookings</p>}
        </section>
      )}

      {statusFilter === "in_progress" && (
        <section className="mb-5">
          <h4>In Progress Bookings</h4>
          {filtered.length > 0 ? (
            filtered.map(b =>
              renderCard(b, (
                <button
                  className="btn btn-sm btn-success mt-2"
                  onClick={() => completeService(b.id)}
                >
                  Complete Service
                </button>
              ))
            )
          ) : <p className="text-muted">No bookings in progress</p>}
        </section>
      )}

      {statusFilter === "completed" && (
        <section>
          <h4>Completed Bookings</h4>
          {filtered.length > 0 ? (
            filtered.map(b =>
              renderCard(b, (
                <span
                  className={`badge ${b.payment_status ? 'bg-success' : 'bg-warning text-dark'
                    } mt-2`}
                >
                  {b.payment_status ? '✅ Payment Received' : '⚠️ Completed – Pending Payment'}
                </span>
              ))
            )
          ) : (
            <p className="text-muted">No completed bookings</p>
          )}
        </section>
      )}

    </div>
  );
};

export default ProviderDashboard;
