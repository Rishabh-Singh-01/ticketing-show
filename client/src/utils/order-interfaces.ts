interface OrderPopulatedTicket {
  title: string;
  price: number;
  version: number;
  id: string;
}

export interface OrderInterface {
  userId: string;
  status: string;
  expiresAt: string;
  version: number;
  id: string;
  ticket: OrderPopulatedTicket;
}
