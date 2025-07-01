// src/models/bookingModel.js

import pool from '../db/index.js';

// Create a new booking
export const createBooking = async ({
  customerId,
  providerId,
  serviceType,
  location,
  date,
  estimatedHours,
  sqft,
  specialRequest,
  rate
}) => {
  const baseCost =
    serviceType === 'Snow Removal'
      ? rate * (estimatedHours || 0)
      : rate * (sqft || 0);

  const adminCommission = baseCost * 0.05;
  const tax = (baseCost + adminCommission) * 0.05;
  const totalCost = baseCost + adminCommission + tax;

  const query = `
    INSERT INTO bookings (
      customer_id, provider_id, service_type, location, date,
      estimated_hours, sqft, special_request, rate,
      admin_commission, tax, total_cost, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *;
  `;

  const values = [
    customerId,
    providerId,
    serviceType,
    location,
    date,
    estimatedHours,
    sqft,
    specialRequest,
    rate,
    adminCommission,
    tax,
    totalCost,
    'pending'
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get unavailable dates for a provider
export const getProviderUnavailableDates = async (providerId) => {
  const query = `
    SELECT date FROM bookings
    WHERE provider_id = $1
  `;
  const result = await pool.query(query, [providerId]);
  return result.rows.map(row => row.date);
};

// Get all bookings for a customer
export const getBookingsByCustomer = async (customerId) => {
  const query = `
    SELECT b.*, u.name as provider_name
    FROM bookings b
    JOIN users u ON b.provider_id = u.id
    WHERE b.customer_id = $1
    ORDER BY b.date DESC
  `;
  const result = await pool.query(query, [customerId]);
  return result.rows;
};

/* Admin to view all bookings*/
export const getAllBookings = async () => {
  const result = await pool.query("SELECT * FROM bookings ORDER BY date DESC");
  return result.rows;
};

// Cancel a booking by ID
export const cancelBooking = async (bookingId) => {
  const query = `
    UPDATE bookings
    SET status = 'Cancelled'
    WHERE id = $1
    RETURNING *;
  `;
  const result = await pool.query(query, [bookingId]);
  return result.rows[0];
};

export const getBookingsByProvider = async (providerId, status = null) => {
  let query = `
    SELECT b.*, u.name as customer_name
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    WHERE b.provider_id = $1
  `;
  const values = [providerId];

  if (status) {
    query += ` AND b.status = $2`;
    values.push(status);
  }

  query += ` ORDER BY b.date DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};
export const updateBookingStatus = async (bookingId, status) => {
  const query = `
    UPDATE bookings
    SET status = $1
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [status, bookingId]);
  return result.rows[0];
};

// Get upcoming approved bookings (next 7 days) for a provider
export const getUpcomingApprovedBookings = async (providerId) => {
  const query = `
    SELECT b.*, u.name as customer_name
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    WHERE b.provider_id = $1
      AND b.status = 'accepted'
      AND b.date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    ORDER BY b.date ASC;
  `;
  const result = await pool.query(query, [providerId]);
  return result.rows;
};

// Get all approved bookings grouped by service type
export const getApprovedBookingsGroupedByService = async (providerId) => {
  const query = `
    SELECT b.*, u.name as customer_name
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    WHERE b.provider_id = $1
      AND b.status = 'accepted'
    ORDER BY b.service_type, b.date DESC;
  `;
  const result = await pool.query(query, [providerId]);
  return result.rows;
};

  
// Update a booking by ID
export const updateBooking = async (bookingId, fields) => {
  const query = `
    UPDATE bookings
    SET location = $1, date = $2, estimated_hours = $3, sqft = $4, special_request = $5, rate = $6,
        admin_commission = $7, tax = $8, total_cost = $9
    WHERE id = $10
  `;
  const values = [
    fields.location,
    fields.date,
    fields.estimatedHours,
    fields.sqft,
    fields.specialRequest,
    fields.rate,
    fields.adminCommission,
    fields.tax,
    fields.totalCost,
    bookingId
  ];
  await pool.query(query, values);
};
