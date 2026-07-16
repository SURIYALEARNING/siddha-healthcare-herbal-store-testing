import express from 'express';
import { addReview } from '../controllers/reviewController.js';

const router = express.Router();

router.post("/:id/review", addReview);

export default router;
