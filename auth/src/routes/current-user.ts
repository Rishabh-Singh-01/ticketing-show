import express, { Request, Response } from 'express';
import { currentUser } from '@rs-ticketing/common';
const router = express.Router();

router.get('/currentUser', currentUser, (req: Request, res: Response) => {
  res.status(200).send({
    currentUser: req.currentUser || null,
  });
});
export { router as currentUserRouter };
