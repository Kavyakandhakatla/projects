// src/routes/authRoutes.js
import express from 'express';
import authController from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { verifyAdmin } from '../middleware/admin.js'; 
import { getDashboardMetrics } from '../controllers/adminController.js';



const router = express.Router();

router.post('/google', authController.googleLogin);
router.get('/providers/pending', authController.getallPendingProviders); // Admin
router.put('/providers/approve/:userId', authController.approveProvider); // Admin
router.get("/user", authController.getUserDetails);
router.put('/provider/reject/:userId', authController.rejectProvider);
router.get('/providers/search', authController.searchProviders);
router.get('/allproviders', authController.getallProviders); 
router.get("/all-users", verifyToken, verifyAdmin, authController.getAllUsers);
router.get("/approved-providers", verifyToken, verifyAdmin, authController.getApprovedProviders);
router.get("/admin/dashboard-metrics", getDashboardMetrics);
router.get("/provider/:id", authController.getProviderById);
router.patch("/providers/:id/toggle-status", verifyToken, verifyAdmin,authController.toggleProviderStatus);




export default router;
