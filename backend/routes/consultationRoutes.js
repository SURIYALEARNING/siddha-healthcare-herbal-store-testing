import express from 'express';
import { bookConsultation } from '../controllers/consultationController.js';

const router = express.Router();

router.post("/", bookConsultation);

export default router;
