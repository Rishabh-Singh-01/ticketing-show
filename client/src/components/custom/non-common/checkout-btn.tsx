'use client';
import { Button } from '@/components/ui/button';
import { useRequest } from '@/hooks/use-request';

export function CheckoutBtn({ orderId }: { orderId: string }) {
  const { doRequest, doRequestErrors } = useRequest({
    url: '/api/v1/payments/checkout',
    method: 'post',
    body: {
      orderId,
    },
    onSuccess: ({ url }) => {
      window.location.assign(url);
    },
  });

  return (
    <div>
      <div>
        <Button onClick={doRequest}>Checkout</Button>
      </div>
      <div>{doRequestErrors()}</div>
    </div>
  );
}
