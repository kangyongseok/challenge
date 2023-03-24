import { useState } from 'react';

import { useRouter } from 'next/router';
import { Button, CheckboxGroup, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { useQuery } from '@tanstack/react-query';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';
import { fetchProductOrder } from '@api/order';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/formats';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function ProductOrderConfirm() {
  const router = useRouter();
  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const {
    data,
    data: {
      id: orderId,
      externalId = '',
      name = '',
      totalPrice = 0,
      deliveryInfo,
      status,
      result
    } = {},
    isLoading
  } = useQuery(
    queryKeys.orders.productOrder({ productId, isCreated: true }),
    () => fetchProductOrder({ productId, isCreated: true }),
    {
      enabled: !!accessUser && !!productId,
      refetchOnMount: true
    }
  );

  const { data: { product } = {}, isLoading: isLoadingProduct } = useQuery(
    queryKeys.products.product({ productId }),
    () => fetchProduct({ productId }),
    {
      refetchOnMount: true,
      enabled: !!productId
    }
  );

  const [checked, setChecked] = useState(false);

  const handleClick = () => {
    const { source } =
      SessionStorage.get<{ source?: string }>(
        sessionStorageKeys.productDetailOrderEventProperties
      ) || {};

    logEvent(attrKeys.productOrder.CLICK_ORDER_PAYMENT, {
      name: attrProperty.name.ORDER_PAYMENT,
      title: attrProperty.title.PAYMENT,
      data: {
        product,
        order: data
      },
      source
    });

    loadTossPayments(process.env.TOSS_PAYMENTS_CLIENT_KEY).then((tossPaymentInstance) => {
      tossPaymentInstance.requestPayment('가상계좌', {
        amount: totalPrice,
        orderId: externalId,
        orderName: name,
        customerName: deliveryInfo?.name,
        customerEmail: accessUser?.email || undefined,
        customerMobilePhone: deliveryInfo?.phone,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        dueDate: dayjs()
          .add(1, 'days')
          .set('hours', 23)
          .set('minutes', 59)
          .set('seconds', 59)
          .format('YYYY-MM-DDTHH:mm:ss'),
        successUrl: `${window.location.href}/success?camelOrderId=${orderId}`,
        failUrl: `${window.location.href}/fail`,
        cashReceipt: {
          type: '소득공제'
        },
        useEscrow: false
      });
    });
  };

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={20}
      customStyle={{
        padding: 20
      }}
    >
      <CheckboxGroup
        text="개인정보 제3자 제공 동의와 결제대행 서비스 이용약관에 동의합니다."
        size="large"
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
      <Button
        variant="solid"
        brandColor="black"
        size="xlarge"
        fullWidth
        onClick={handleClick}
        disabled={
          !checked ||
          !accessUser ||
          isLoading ||
          isLoadingProduct ||
          !externalId ||
          !name ||
          !totalPrice ||
          !deliveryInfo ||
          status !== 0 ||
          result !== 0
        }
      >
        {commaNumber(totalPrice)}원 결제하기
      </Button>
      <Typography
        variant="body2"
        customStyle={{
          color: common.ui60
        }}
      >
        (주)미스터카멜은 통신판매중개자로서 거래 당사자가 아니며, 판매자가 등록한 상품정보 및 거래에
        대해 책임을 지지 않습니다.
      </Typography>
    </Flexbox>
  );
}

export default ProductOrderConfirm;
