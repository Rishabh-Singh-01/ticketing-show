import { requireAuth } from '@rs-ticketing/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/orders';

const router = express.Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate('ticket');

  res.status(200).send({
    count: orders.length,
    orders: orders,
  });
});

export { router as getAllOrderRouter };
