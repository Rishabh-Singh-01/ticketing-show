import { requireAuth, validateRequest } from '@rs-ticketing/common';
import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publisher/ticket-created-publisher';
import { natsWrapper } from '../utils/nats-wrapper';

const router = express.Router();

const validation = [
  body('title').notEmpty().withMessage('Title should not be empty !!!'),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price should be greater than 0 !!!'),
];

router.post(
  '/',
  requireAuth,
  validation,
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });
    await ticket.save();
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });
    res.status(201).send(ticket);
  }
);

export { router as newTicketRouter };
