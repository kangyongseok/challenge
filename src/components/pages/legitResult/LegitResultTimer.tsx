import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';
import { Flexbox, Typography } from 'mrcamel-ui';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

function LegitResultTimer() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const [{ hour, minute, seconds }, setTimer] = useState({
    hour: '00',
    minute: '00',
    seconds: '00'
  });

  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const { data: { dateCompleted } = {} } = useQuery(
    queryKeys.productLegits.legit(productId),
    () => fetchProductLegit(productId),
    {
      enabled: !!id
    }
  );

  useEffect(() => {
    if (dateCompleted) {
      timerRef.current = setInterval(() => {
        const completeDate = dayjs(dateCompleted);
        const currentDate = dayjs();
        const diff = dayjs(completeDate).diff(currentDate);

        const newTimer = {
          hour: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
          minute: String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0'),
          seconds: String(Math.floor((diff / 1000) % 60)).padStart(2, '0')
        };

        if (Number(newTimer.hour) <= 0) newTimer.hour = '00';
        if (Number(newTimer.minute) <= 0) newTimer.minute = '00';
        if (Number(newTimer.seconds) <= 0) newTimer.seconds = '00';

        setTimer(newTimer);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [dateCompleted]);

  if (!dateCompleted) return null;

  return (
    <Flexbox
      component="section"
      direction="vertical"
      alignment="center"
      customStyle={{ marginTop: 20 }}
    >
      <Flexbox alignment="center" gap={8}>
        <TimerBox>
          <Typography variant="h0" weight="bold">
            {hour}
          </Typography>
        </TimerBox>
        <Typography variant="h3" weight="medium">
          :
        </Typography>
        <TimerBox>
          <Typography variant="h0" weight="bold">
            {minute}
          </Typography>
        </TimerBox>
        <Typography variant="h3" weight="medium">
          :
        </Typography>
        <TimerBox>
          <Typography variant="h0" weight="bold">
            {seconds}
          </Typography>
        </TimerBox>
      </Flexbox>
    </Flexbox>
  );
}

const TimerBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 9px;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg01};
`;

export default LegitResultTimer;
