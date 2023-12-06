import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@rs-ticketing/common';
import { newTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { getAllTicketsRouter } from './routes/get-all';
import { updateTicketRouter } from './routes/update';

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

app.use('/api/v1/tickets', getAllTicketsRouter);
app.use('/api/v1/tickets', newTicketRouter);
app.use('/api/v1/tickets', showTicketRouter);
app.use('/api/v1/tickets', updateTicketRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
