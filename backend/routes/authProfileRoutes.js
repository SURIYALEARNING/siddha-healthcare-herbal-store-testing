import express from 'express';
import { getProfile, updateProfile } from '../controllers/authProfileController.js';

const router = express.Router();

router.get("/", getProfile);
router.put("/update", updateProfile);

export default router;
