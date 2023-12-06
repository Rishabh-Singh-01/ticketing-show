import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@rs-ticketing/common';
import { newOrderRouter } from './routes/new';
import { getAllOrderRouter } from './routes/get-all';
import { showOrderRouter } from './routes/show';
import { deleteOrderRouter } from './routes/delete';

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

app.use('/api/v1/orders', getAllOrderRouter);
app.use('/api/v1/orders', showOrderRouter);
app.use('/api/v1/orders', newOrderRouter);
app.use('/api/v1/orders', deleteOrderRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
