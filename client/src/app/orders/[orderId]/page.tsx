import { CheckoutBtn } from '@/components/custom/non-common/checkout-btn';
import { ExpirationTimer } from '@/components/custom/non-common/expiration-timer';
import { Button } from '@/components/ui/button';
import { useRequest } from '@/hooks/use-request';
import { axiosBuilder } from '@/utils/axios-builder';
import { OrderInterface } from '@/utils/order-interfaces';

async function getOrder(orderId: string) {
  const axiosBuild = axiosBuilder('server');
  try {
    const res = await axiosBuild.get(`/api/v1/orders/${orderId}`);
    return (res as unknown as any).data as OrderInterface;
  } catch (err: any) {
    console.error('Error occured during getOrder :' + err.message);
  }
  return null;
}

export default async function Order({
  params,
}: {
  params: { orderId: string };
}) {
  const order = await getOrder(params.orderId);
  if (!order) return <div>Something went bad !!!</div>;

  return (
    <div>
      <div>{params.orderId}</div>
      <ExpirationTimer expiresAtUTC={order.expiresAt} />
      <CheckoutBtn orderId={params.orderId} />
    </div>
  );
}
