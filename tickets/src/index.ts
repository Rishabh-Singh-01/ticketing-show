import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './utils/nats-wrapper';
import { OrderCreatedListener } from './events/listener/order-created-listener';
import { OrderCancelledListener } from './events/listener/order-cancelled-listener';
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
    // connecting to nats streaming server
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    // nats gracefull shutdown
    natsWrapper.client.on('close', () => {
      console.log('NATS Connection closed !!!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    // listening to different events
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    // connecting to mongoose
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Unable to connect to MongoDB');
    console.error(err);
  }
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Tickets Server listening on port ${PORT} !!`);
  });
};
start();
