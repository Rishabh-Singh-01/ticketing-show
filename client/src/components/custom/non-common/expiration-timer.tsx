'use client';

import { useEffect, useState } from 'react';

export function ExpirationTimer({ expiresAtUTC }: { expiresAtUTC: string }) {
  const [timeLeft, setTimeLeft] = useState(1);

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(expiresAtUTC).valueOf() - new Date().valueOf();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [expiresAtUTC]);

  if (timeLeft <= 0) return <div>Order Expired</div>;

  return (
    <div>
      <div>Time left to pay: {timeLeft} sec</div>
    </div>
  );
}
