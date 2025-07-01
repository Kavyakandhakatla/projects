// src/models/userModel.js
import pool from '../db/index.js';

const findByGoogleId = async (googleId) => {
  const query = `
    SELECT * FROM users WHERE google_id = $1;
  `;
  const values = [googleId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// src/models/userModel.js
const create = async ({ googleId, email, name, picture, role, status,
                       locations, snowRate,lawnRate, services, experience,mobilenumber }) => {
  const query = `
    INSERT INTO users (
      google_id, email, name, picture, role, status,
      locations, snowrate, lawnrate, services, experience, mobilenumber
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11,$12)
    RETURNING *;
  `;
  console.log("mobile number",mobilenumber)
  const values = [
    googleId, email, name, picture, role, status,
    locations ? locations.join(",") : null,
    snowRate|| null,lawnRate || null,
    services ? services.join(",") : null,
    experience || null,mobilenumber || null
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const findById = async (id) => {
  const query = `SELECT * FROM users WHERE id = $1;`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const findByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1;`;
  const values = [email];
  const result = await pool.query(query, values);
  return result.rows[0];
};
const getPendingProviders = async () => {
  const result = await pool.query(
    `SELECT * FROM users WHERE role = 'provider' AND status = 'pending'`
  );
  return result.rows;
};

const getallProviders = async () => {
  const result = await pool.query(
    `SELECT * FROM users WHERE role = 'provider' AND status = 'approved'`
  );
  return result.rows;
};
 
/* Admin to view number of users */
export const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users WHERE role = 'customer'");
  return result.rows;
};

/* Admin views for number of approved providers */
export const getApprovedProviders = async () => {
  const result = await pool.query(`
    SELECT id, name, email, status, is_disabled
    FROM users
    WHERE role = 'provider' AND status = 'approved'
  `);
  return result.rows;
};


export const approveProvider = async (userId) => {
  const query = `
    UPDATE users
    SET status = 'approved'
    WHERE id = $1 AND role = 'provider'
    RETURNING *;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};
export const rejectProvider = async (userId) => {
  const query = `
    UPDATE users
    SET status = 'rejected'
    WHERE id = $1 AND role = 'provider'
    RETURNING *;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

export const findProviders = async ({ serviceType, location, minRating }) => {
  if (!serviceType) throw new Error("Service type is required");

  let query = `
    SELECT id, name, services, locations, snowrate, lawnrate, rating
    FROM users
    WHERE role = 'provider'
      AND status = 'approved'
      AND $1 = ANY (string_to_array(services, ','))
  `;

  const params = [serviceType];

  if (location) {
    query += ` AND $${params.length + 1} = ANY (string_to_array(locations, ','))`;
    params.push(location);
  }

  if (minRating !== undefined && minRating !== null) {
    query += ` AND rating >= $${params.length + 1}`;
    params.push(Number(minRating));
  }

  const result = await pool.query(query, params);
  return result.rows;
};

export const toggleProviderStatus = async (userId) => {
  console.log("Toggling user ID:", userId);
  const result = await pool.query(
    `UPDATE users
     SET is_disabled = NOT is_disabled
     WHERE id = $1 AND role = 'provider'
     RETURNING *;`,
    [userId]
  );
  return result.rows[0];
};


export default {
  findByGoogleId,
  create,
  findById,
  findByEmail,
  getPendingProviders,
  approveProvider,
  rejectProvider,
  findProviders,
  getallProviders,
  getApprovedProviders,
  getAllUsers,
  toggleProviderStatus

};
