// src/controllers/bookingController.js

import * as Booking from '../models/bookingModel.js';
import pool from '../db/index.js';
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


const bookingController = {
  // Create a new booking
  createBooking: async (req, res) => {
    const {
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
    } = req.body;

    console.log("Creating booking with:", req.body);

    if (!customerId || !providerId || !serviceType || !location || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const booking = await Booking.createBooking({
        customerId,
        providerId,
        serviceType,
        location,
        date,
        estimatedHours: estimatedHours || null,
        sqft: sqft || null,
        specialRequest,
        rate,
        adminCommission,
        tax,
        totalCost,
        status: 'Pending',
      });

      res.status(201).json({ message: 'Booking created', booking });
    } catch (err) {
      console.error('Error creating booking:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get unavailable dates for a provider
  getUnavailableDates: async (req, res) => {
    const { id } = req.params;
    try {
      const dates = await Booking.getUnavailableDates(id);
      res.json(dates);
    } catch (err) {
      console.error('Error fetching unavailable dates:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getCustomerBookings: async (req, res) => {
    const { customerId } = req.params;
    try {
      const bookings = await Booking.getBookingsByCustomer(customerId);
      res.status(200).json(bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateBooking: async (req, res) => {
    const { bookingId } = req.params;
    const updatedFields = req.body;

    try {
      await Booking.updateBooking(bookingId, updatedFields);
      res.status(200).json({ message: "Booking updated successfully" });
    } catch (err) {
      console.error("Error updating booking:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  /* Admin to view all bookings*/
  getAllBookings: async (req, res) => {
    try {
      const bookings = await Booking.getAllBookings();
      res.status(200).json(bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  cancelBooking: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *", ['Cancelled', id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Booking not found." });
      }

      res.json({ message: "Booking cancelled successfully", booking: result.rows[0] });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getProviderBookings: async (req, res) => {
    const { providerId } = req.params;
    const { status } = req.query;

    try {
      const bookings = await Booking.getBookingsByProvider(providerId, status);
      res.status(200).json(bookings);
    } catch (err) {
      console.error("Error fetching provider bookings:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updateBookingStatus: async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    try {
      const updated = await Booking.updateBookingStatus(bookingId, status);
      res.status(200).json({ message: `Booking ${status}`, booking: updated });
    } catch (err) {
      console.error("Error updating booking status:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getUpcomingApprovedBookings: async (req, res) => {
    const { providerId } = req.params;
    try {
      const bookings = await Booking.getUpcomingApprovedBookings(providerId);
      res.status(200).json(bookings);
    } catch (err) {
      console.error("Error fetching upcoming approved bookings:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getApprovedBookingsGroupedByService: async (req, res) => {
    const { providerId } = req.params;
    try {
      const bookings = await Booking.getApprovedBookingsGroupedByService(providerId);
      res.status(200).json(bookings);
    } catch (err) {
      console.error("Error fetching approved bookings by service:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // PATCH: Mark booking as in_progress
  startService: async (req, res) => {
    const bookingId = req.params.id;
    try {
      const query = `UPDATE bookings SET status = 'in_progress' WHERE id = $1 RETURNING *`;
      const values = [bookingId];
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json({ message: "Service started", booking: result.rows[0] });
    } catch (err) {
      console.error("Error starting service:", err);
      res.status(500).json({ error: "Failed to start service" });
    }
  },

  // PATCH: Mark booking as completed
  completeService: async (req, res) => {
    const bookingId = req.params.id;
    try {
      const query = `UPDATE bookings SET status = 'completed' WHERE id = $1 RETURNING *`;
      const values = [bookingId];
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json({ message: "Service marked as completed", booking: result.rows[0] });
    } catch (err) {
      console.error("Error completing service:", err);
      res.status(500).json({ error: "Failed to complete service" });
    }
  },

  //Payment Service 
  createCheckoutSession: async (req, res) => {
    const { bookingId, amount, email } = req.body;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Service Booking #${bookingId}`,
              },
              unit_amount: Math.round(amount * 100), // cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `https://snowmow.online/payment-success/${bookingId}`,
        cancel_url: `https://snowmow.online/my-bookings`,
      });

      res.json({ id: session.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Stripe session creation failed' });
    }
  },

  markBookingPaid: async (req, res) => {
    const { id } = req.params;
    console.log("Marking booking as paid. ID:", id);

    try {
      const result = await pool.query(
        `UPDATE bookings 
       SET payment_status = true,
           status = 'completed'
       WHERE id = $1 
       RETURNING *;`,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      res.status(200).json({ message: 'Booking marked as paid', booking: result.rows[0] });
    } catch (error) {
      console.error("Error updating booking as paid:", error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  rejectBooking: async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const result = await pool.query(
      `UPDATE bookings 
       SET status = 'rejected', rejection_reason = $1
       WHERE id = $2 RETURNING *;`,
      [reason, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking rejected', booking: result.rows[0] });
  } catch (error) {
    console.error("Error rejecting booking:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
},




};

export default bookingController;
