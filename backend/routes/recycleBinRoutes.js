import express from 'express';
import {
  getRecycleBinItems,
  restoreRecycleBinItem,
  permanentlyDeleteRecycleBinItem,
  emptyRecycleBin
} from '../controllers/recycleBinControllers.js';
import { protect, staffUp, managerUp } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, staffUp, getRecycleBinItems);

router.route('/empty')
  .post(protect, managerUp, emptyRecycleBin);

router.route('/:id')
  .delete(protect, managerUp, permanentlyDeleteRecycleBinItem);

router.route('/:id/restore')
  .post(protect, staffUp, restoreRecycleBinItem);

export default router;
