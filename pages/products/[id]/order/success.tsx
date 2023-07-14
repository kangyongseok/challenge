import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { OrderPaymentsData } from '@dto/order';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';
import { fetchProductOrder, postOrderPayments } from '@api/order';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { PAYMENTS_SUCCESS } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import getAccessUserByCookies from '@utils/common/getAccessUserByCookies';

import type { Payment } from '@typings/tosspayments';
import useSession from '@hooks/useSession';
import useMutationCreateChannel from '@hooks/useMutationCreateChannel';

// TODO 추후 결제 로직 리팩토링 및 서버에서 처리 되도록 수정 필요
function ProductOrderSuccess() {
  const router = useRouter();
  const { id, camelOrderId, paymentKey, orderId, amount } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const completedRef = useRef(false);

  const { isLoggedInWithSMS, data: accessUser } = useSession();

  const { data: { roleSeller, product, channels = [] } = {}, isLoading } = useQuery(
    queryKeys.products.product({ productId }),
    () => fetchProduct({ productId }),
    {
      enabled: !!productId,
      refetchOnMount: true
    }
  );

  const {
    data,
    data: { totalPrice = 0 } = {},
    isLoading: isLoadingOrder
  } = useQuery(
    queryKeys.orders.productOrder({ productId }),
    () => fetchProductOrder({ productId }),
    {
      enabled: isLoggedInWithSMS && !!productId,
      refetchOnMount: true
    }
  );

  const { mutate } = useMutationCreateChannel();

  useEffect(() => {
    LocalStorage.set(PAYMENTS_SUCCESS, true);
  }, []);

  useEffect(() => {
    if (
      isLoading ||
      isLoadingOrder ||
      !isLoggedInWithSMS ||
      !accessUser ||
      !roleSeller ||
      !product ||
      !data ||
      !camelOrderId ||
      !paymentKey ||
      !orderId ||
      !amount ||
      completedRef.current
    )
      return;

    completedRef.current = true;

    // 결제 금액 조작 승인 행위 방지
    if (Number(amount) !== totalPrice) {
      router.replace(
        `/products/${id}/order/fail?code=INVALID_PAYMENT&message=올바르지 않은 정보가 포함되었어요. 결제를 다시 진행해주세요.`
      );
      return;
    }

    logEvent(attrKeys.productOrder.REQUEST_TOSS_PAYMENT_CONFIRM, {
      name: attrProperty.name.ORDER_PAYMENT,
      title: attrProperty.title.PAYMENT,
      data: {
        paymentKey,
        orderId,
        amount
      }
    });

    axios
      .post(
        'https://api.tosspayments.com/v1/payments/confirm',
        {
          paymentKey,
          orderId,
          amount
        },
        {
          headers: {
            Authorization: `Basic ${window.btoa(`${process.env.TOSS_PAYMENTS_SECRET_KEY}:`)}`,
            'Content-Type': 'application/json'
          }
        }
      )
      .then(async (response) => {
        const {
          data: {
            method,
            orderId: newOrderId,
            paymentKey: newPaymentKey,
            card,
            virtualAccount,
            receipt: { url }
          }
        }: { data: Payment } = response;

        logEvent(attrKeys.productOrder.SUCCESS_TOSS_PAYMENT_CONFIRM, {
          name: attrProperty.name.ORDER_PAYMENT,
          title: attrProperty.title.PAYMENT,
          data: {
            response
          }
        });

        const {
          issuerCode,
          installmentPlanMonths,
          isInterestFree,
          number,
          approveNo,
          acquireStatus,
          amount: cardAmount
        } = card || {};
        const { bankCode = '', dueDate = '', accountNumber = '' } = virtualAccount || {};

        const channelId = (channels || []).find(
          (channel) => channel.userId === accessUser.userId
        )?.id;

        const orderPaymentsData: OrderPaymentsData =
          method === '가상계좌'
            ? {
                id: Number(camelOrderId),
                channelId,
                partnerId: 0,
                method: 1,
                externalKey: newOrderId,
                externalPaymentKey: newPaymentKey,
                agencyCode: String(bankCode),
                dateExpired: dueDate,
                data: accountNumber,
                receiptUrl: url,
                amount: Number(amount)
              }
            : {
                id: Number(camelOrderId),
                channelId,
                partnerId: 0,
                method: 0,
                externalKey: newOrderId,
                externalPaymentKey: newPaymentKey,
                agencyCode: String(issuerCode),
                data: `${installmentPlanMonths}|${isInterestFree}|${number}|${approveNo}|${acquireStatus}`,
                receiptUrl: url,
                amount: Number(cardAmount)
              };

        if (channelId) {
          postOrderPayments(orderPaymentsData).then((res) => {
            const { source } =
              SessionStorage.get<{ source?: string }>(
                sessionStorageKeys.productDetailOrderEventProperties
              ) || {};

            logEvent(attrKeys.productOrder.SUBMIT_ORDER_PAYMENT, {
              name: attrProperty.name.ORDER_PAYMENT,
              title: attrProperty.title.PAYMENT,
              data: {
                product,
                data,
                res,
                orderPaymentsData
              },
              source
            });

            router.push(`/channels/${channelId}`);
          });
        } else {
          await mutate(
            {
              userId: String(accessUser?.userId || 0),
              targetUserId: String(roleSeller?.userId || 0),
              productId: String(product?.id),
              productTitle: product?.title || '',
              productImage: product?.imageThumbnail || product?.imageMain || ''
            },
            undefined,
            async (newChannelId?: number) => {
              await postOrderPayments({ ...orderPaymentsData, channelId: newChannelId }).then(
                (res) => {
                  const { source } =
                    SessionStorage.get<{ source?: string }>(
                      sessionStorageKeys.productDetailOrderEventProperties
                    ) || {};

                  logEvent(attrKeys.productOrder.SUBMIT_ORDER_PAYMENT, {
                    name: attrProperty.name.ORDER_PAYMENT,
                    title: attrProperty.title.PAYMENT,
                    data: {
                      product,
                      data,
                      res
                    },
                    source
                  });

                  router.push(`/channels/${newChannelId}`);
                }
              );
            },
            undefined,
            true
          );
        }
      })
      .catch((error) => {
        const {
          data: { code, message }
        } = error.response;

        try {
          logEvent(attrKeys.commonEvent.REQUEST_ERROR, {
            error
          });
        } finally {
          router.replace(`/products/${id}/order/fail?code=${code}&message=${message}`);
        }
      });
  }, [
    id,
    accessUser,
    isLoggedInWithSMS,
    roleSeller,
    product,
    camelOrderId,
    paymentKey,
    orderId,
    amount,
    totalPrice,
    mutate,
    isLoading,
    isLoadingOrder,
    router,
    channels,
    data
  ]);

  return (
    <GeneralTemplate
      disablePadding
      hideAppDownloadBanner
      customStyle={{
        '& > main': {
          justifyContent: 'center',
          alignItems: 'center'
        }
      }}
    >
      <LoadingIcon name="LoadingFilled" width={48} height={48} />
    </GeneralTemplate>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {
      accessUser: getAccessUserByCookies(getCookies({ req }))
    }
  };
}

const LoadingIcon = styled(Icon)`
  animation: rotate 1s linear infinite;
  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default ProductOrderSuccess;
