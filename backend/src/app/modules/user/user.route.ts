import express from 'express';
import { UserController } from './user.controller';

const router = express.Router();

// Local Database Routes
router.post('/', UserController.createLocalUser);
router.get('/', UserController.getLocalUsers);

export const userRoutes = router;
