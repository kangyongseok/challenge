import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { Box, Icon, Skeleton, Typography } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';

import SessionStorage from '@library/sessionStorage';

import sessionStorageKeys from '@constants/sessionStorageKeys';

import useQueryOrder from '@hooks/useQueryOrder';

function OrdersDetailHeader() {
  const router = useRouter();
  const { id, paymentComplete } = router.query;

  const { data: { orderPayments = [] } = {}, isLoading } = useQueryOrder({ id: Number(id) });

  const [title, setTitle] = useState('');

  const handleClick = () => {
    const lastPageUrl = SessionStorage.get(sessionStorageKeys.lastPageUrl);

    if (lastPageUrl) {
      router.replace(lastPageUrl);
    } else {
      router.back();
    }
  };

  useEffect(() => {
    if (!router.isReady || isLoading) return;

    if (paymentComplete) {
      if (orderPayments[0]?.method === 0) {
        setTitle('결제완료');
      } else if (orderPayments[0]?.method === 1) {
        setTitle('주문완료');
      } else {
        setTitle('주문상세내역');
      }
    } else {
      setTitle('주문상세내역');
    }
  }, [isLoading, orderPayments, paymentComplete, router.isReady]);

  return (
    <Header
      leftIcon={
        <Box
          onClick={handleClick}
          customStyle={{
            padding: 16
          }}
        >
          <Icon name="Arrow1BackOutlined" />
        </Box>
      }
      showRight={false}
      hideLine={false}
    >
      {title ? (
        <Typography variant="h3" weight="bold">
          {title}
        </Typography>
      ) : (
        <Skeleton width={90} height={24} round={8} disableAspectRatio />
      )}
    </Header>
  );
}

export default OrdersDetailHeader;
