import { Message } from 'node-nats-streaming';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent, OrderStatus } from '@rs-ticketing/common';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../utils/nats-wrapper';
import { generateId } from '../../../test/id-generator';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const id = generateId();
  const data: OrderCreatedEvent['data'] = {
    id,
    version: 0,
    expiresAt: new Date().toISOString(),
    userId: generateId(),
    status: OrderStatus.Created,
    ticket: {
      id: generateId(),
      price: 10,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('replicates the order info', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
