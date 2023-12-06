import { OrderCreatedListener } from './events/listener/order-created-listener';
import { natsWrapper } from './utils/nats-wrapper';
const start = async () => {
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

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error('Unable to connect to MongoDB');
    console.error(err);
  }
};
start();
