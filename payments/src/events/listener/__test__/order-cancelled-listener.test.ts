import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models/order';
import { generateId } from '../../../test/id-generator';
import { OrderStatus, OrderCancelledEvent } from '@rs-ticketing/common';
import { natsWrapper } from '../../../utils/nats-wrapper';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const id = generateId();
  const order = Order.build({
    id,
    status: OrderStatus.Created,
    price: 10,
    userId: generateId(),
    version: 0,
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: generateId(),
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it('updates the status of the order', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
