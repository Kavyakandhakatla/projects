import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pool from './db/index.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = 5002;

// Middleware
app.use(cors({ origin: '*', credentials: false }));



app.use(bodyParser.json());

// Test DB connection
pool.query('SELECT NOW()')
  .then(res => console.log('Database time:', res.rows[0]))
  .catch(err => console.error('Database connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

// Serve React static files from the correct folder
// app.use(express.static(path.join(__dirname, '../../client/dist')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
// });
// Serve frontend (Vite build) from dist folder
app.use(express.static(path.join(__dirname, '../../Frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../Frontend/dist/index.html'));
});


import https from 'https';
import fs from 'fs';

const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/snowmow.online/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/snowmow.online/fullchain.pem'),
};

https.createServer(sslOptions, app).listen(443, () => {
  console.log('✅ HTTPS server running at https://snowmow.online');
});
