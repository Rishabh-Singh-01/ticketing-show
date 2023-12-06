import { Listener, Subjects, TicketUpdatedEvent } from '@rs-ticketing/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/tickets';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    console.log(JSON.stringify(data));
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) throw new Error('Ticket not found !!!');

    const { title, price } = data;
    ticket.set({
      title,
      price,
    });
    await ticket.save();

    msg.ack();
  }
}
