export interface TicketDoc {
  id: string;
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;
}

export interface AllTicketResponse {
  count: number;
  tickets: TicketDoc[];
}
