import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const tickets = await Ticket.find({});

  res.status(200).send({
    count: tickets.length,
    tickets,
  });
});
export { router as getAllTicketsRouter };
