import pool from '../db/index.js';


export const getDashboardMetrics = async (req, res) => {
  try {
    const usersResult = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'customer'`);
    const providersResult = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'provider' AND status = 'approved'`);
    const bookingsResult = await pool.query(`SELECT COUNT(*) FROM bookings`);
    const revenueResult = await pool.query(`SELECT COALESCE(SUM(total_cost), 0) FROM bookings`);

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalProviders: parseInt(providersResult.rows[0].count),
      totalBookings: parseInt(bookingsResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].coalesce),
    });
  } catch (err) {
    console.error("Error fetching dashboard metrics:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

