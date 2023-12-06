import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@rs-ticketing/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { stripe } from '../utils/stripe';

const router = express.Router();

const validation = [
  body('orderId').notEmpty().withMessage('Order should be valid !!!'),
];

router.post(
  '/',
  requireAuth,
  validation,
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError();
    if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();
    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError('Cannot charge cancelled order');

    // creating stripe charges
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Order from ticketing dev',
            },
            unit_amount: order.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://ticketing.dev/tickets`,
      cancel_url: `http://ticeting.dev`,
    });

    console.log(session.url);

    res.status(201).send({
      url: session.url,
    });
  }
);

export { router as checkoutSessionRouter };
