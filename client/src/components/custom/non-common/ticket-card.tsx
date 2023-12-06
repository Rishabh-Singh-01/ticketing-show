'use client';
import { useRouter } from 'next/navigation';
import { useRequest } from '../../../hooks/use-request';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import React from 'react';
export function TicketCard({ ticket }) {
  const router = useRouter();
  const { doRequest, doRequestErrors } = useRequest({
    url: '/api/v1/orders',
    method: 'post',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) => {
      router.push(`/orders/${order.id}`);
    },
  });

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='opacity-60'>Ticket Info</CardTitle>
        <CardDescription>Buy at the best price</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <div className='grid w-full items-center gap-4 pt-8'>
          <div className='flex flex-row items-center justify-between'>
            <Label className='opacity-70'>Title: </Label>
            <span className='font-semibold'>{ticket.title}</span>
          </div>
          <div className='flex flex-row items-center justify-between'>
            <Label className='opacity-80'>Price: </Label>
            <span className='font-semibold'>Rs {ticket.price.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button variant='outline' onClick={() => router.push('/tickets')}>
          Cancel
        </Button>
        <Button onClick={doRequest}>Purchase</Button>
      </CardFooter>
      {doRequestErrors()}
    </Card>
  );
}
