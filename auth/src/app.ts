import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError } from '@rs-ticketing/common';

import { signInRouter } from './routes/signin';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import { currentUserRouter } from './routes/current-user';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test', // true in case for dev or prod env since https is required while in test false since http works
  })
);

app.use('/api/v1/users', signupRouter);
app.use('/api/v1/users', signInRouter);
app.use('/api/v1/users', currentUserRouter);
app.use('/api/v1/users', signoutRouter);
app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
