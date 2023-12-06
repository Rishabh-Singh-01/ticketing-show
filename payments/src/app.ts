import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@rs-ticketing/common';
import { newChargeRouter } from './routes/new';
import { checkoutSessionRouter } from './routes/checkout-session';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test', // true in case for dev or prod env since https is required while in test false since http works
  })
);
app.use(currentUser);

app.use('/api/v1/payments/checkout', checkoutSessionRouter);
app.use('/api/v1/payments', newChargeRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
