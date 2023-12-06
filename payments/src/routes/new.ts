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
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publisher/payment-created-publisher';
import { natsWrapper } from '../utils/nats-wrapper';

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
    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'inr',
      amount: order.price * 100,
    });

    const payment = Payment.build({
      orderId,
      stripeId: paymentIntent.id,
    });
    await payment.save();

    // publishing event for further processing
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({
      success: true,
      payment: {
        id: payment.id,
      },
    });
  }
);

export { router as newChargeRouter };
