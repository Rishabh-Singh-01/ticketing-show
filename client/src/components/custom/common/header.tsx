import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/helper/current-user';
import Link from 'next/link';
import { SignoutBtn } from '../non-common/signout-btn';

export async function Header() {
  const currentUser = await getCurrentUser();

  const headerBtns = () => {
    if (currentUser) return <SignoutBtn />;

    return [
      { label: 'Sign Up', href: '/auth/signup' },
      { label: 'Sign In', href: '/auth/signin' },
    ].map(({ label, href }) => {
      return (
        <Link href={href} key={label}>
          <Button variant='secondary'>{label}</Button>
        </Link>
      );
    });
  };
  return (
    <>
      <div className='container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16'>
        <h2 className='text-lg font-semibold'>Ticketing</h2>
        <div className='ml-auto flex w-full space-x-4 sm:justify-end'>
          {headerBtns()}
        </div>
      </div>
      <Separator />
    </>
  );
}
