import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaUserTie, FaClipboardList, FaDollarSign } from "react-icons/fa";
import "./style.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null); // null = not loaded yet
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("https://snowmow.online/api/auth/admin/dashboard-metrics");
        setStats({
          users: res.data.totalUsers || 0,
          providers: res.data.totalProviders || 0,
          bookings: res.data.totalBookings || 0,
          revenue: res.data.totalRevenue?.toFixed(2) || "0.00",
        });
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="admin-dashboard-wrapper">
        <h2 className="section-title">Admin Dashboard</h2>
        <div className="dashboard-loading">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-wrapper">
      <h2 className="section-title">Admin Dashboard</h2>
      <div className="dashboard-cards">
        <div className="dashboard-card card-users">
          <FaUsers className="dashboard-icon" />
          <h3>Total Users</h3>
          <p className="dashboard-stat">{stats.users}</p>
        </div>
        <div className="dashboard-card card-providers">
          <FaUserTie className="dashboard-icon" />
          <h3>Approved Providers</h3>
          <p className="dashboard-stat">{stats.providers}</p>
        </div>
        <div className="dashboard-card card-bookings">
          <FaClipboardList className="dashboard-icon" />
          <h3>Total Bookings</h3>
          <p className="dashboard-stat">{stats.bookings}</p>
        </div>
        <div className="dashboard-card card-revenue">
          <FaDollarSign className="dashboard-icon" />
          <h3>Total Revenue</h3>
          <p className="dashboard-stat">${stats.revenue}</p>
        </div>
      </div>
    </div>
  );
}
