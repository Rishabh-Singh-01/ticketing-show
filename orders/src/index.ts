import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './utils/nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-event';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

const start = async () => {
  if (!process.env.JWT_KEY)
    throw new Error('JWT KEY env variable not found !!');
  if (!process.env.MONGO_URI)
    throw new Error('JWT KEY env variable not found !!');

  if (!process.env.NATS_CLUSTER_ID)
    throw new Error('NATS_CLUSTER_ID env variable not found !!');

  if (!process.env.NATS_CLIENT_ID)
    throw new Error('NATS_CLIENT_ID env variable not found !!');

  if (!process.env.NATS_URL)
    throw new Error('NATS_URL env variable not found !!');

  try {
    // Connecting to the nats streaming server
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('NATS Connection closed !!!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    // Listening to the events
    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    // Connecting the mongoDB instance
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Unable to connect to MongoDB');
    console.error(err);
  }

  // Listening to the port 3000
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Orders Server listening on port ${PORT} !!`);
  });
};
start();
