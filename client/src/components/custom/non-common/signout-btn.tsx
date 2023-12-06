'use client';
import { Button } from '@/components/ui/button';
import { useRequest } from '@/hooks/use-request';
import { useRouter } from 'next/navigation';

export function SignoutBtn() {
  const router = useRouter();
  const { doRequest } = useRequest({
    url: '/api/v1/users/signout',
    method: 'post',
    body: {},
    onSuccess: () => {
      router.push('/');
      router.refresh();
    },
  });
  const onClickHandler = async () => {
    await doRequest();
  };
  return (
    <Button variant='secondary' onClick={onClickHandler}>
      Sign Out
    </Button>
  );
}
