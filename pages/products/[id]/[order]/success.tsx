import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { Icon } from 'mrcamel-ui';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';

import SessionStorage from '@library/sessionStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';
import { fetchProductOrder, postOrderPayments } from '@api/order';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import { checkAgent } from '@utils/common';

import type { Payment } from '@typings/tosspayments';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useMutationCreateChannel from '@hooks/useMutationCreateChannel';

function ProductOrderSuccess() {
  const router = useRouter();
  const { id, camelOrderId, paymentKey, orderId, amount } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const completedRef = useRef(false);

  const { data: accessUser } = useQueryAccessUser();

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
      enabled: !!accessUser && !!productId,
      refetchOnMount: true
    }
  );

  const { mutate } = useMutationCreateChannel();

  useEffect(() => {
    if (
      isLoading ||
      isLoadingOrder ||
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
            paymentKey: newPaymentKey,
            virtualAccount: { bankCode, dueDate, accountNumber, customerName },
            receipt: { url }
          }
        }: { data: Payment } = response;

        const channelId = (channels || []).find(
          (channel) => channel.userId === accessUser.userId
        )?.id;

        if (channelId) {
          postOrderPayments({
            id: Number(camelOrderId),
            channelId,
            partnerId: 0,
            method: 1,
            externalPaymentKey: newPaymentKey,
            agencyCode: bankCode,
            dateExpired: dueDate,
            data: accountNumber || customerName,
            receiptUrl: url,
            amount: Number(amount)
          }).then((res) => {
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

            if (checkAgent.isIOSApp()) {
              router.push({
                pathname: '/channels',
                query: {
                  channelId
                }
              });
            } else {
              router.push(`/channels/${channelId}`);
            }
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
              await postOrderPayments({
                id: Number(camelOrderId),
                channelId: newChannelId,
                partnerId: 0,
                method: 1,
                externalPaymentKey: newPaymentKey,
                agencyCode: bankCode,
                dateExpired: dueDate,
                data: accountNumber || customerName,
                receiptUrl: url,
                amount: Number(amount)
              }).then((res) => {
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
              });
            }
          );
        }
      })
      .catch((error) => {
        const {
          data: { code, message }
        } = error.response;

        if (code === 'ALREADY_PROCESSED_PAYMENT') {
          router.replace(`/products/${id}/order/fail?code=${code}&message=${message}`);
        } else {
          router.replace(
            `/products/${id}/order/fail?code=INVALID_PAYMENT&message=오류가 발생했어요. 결제를 다시 진행해주세요.`
          );
        }
      });
  }, [
    id,
    accessUser,
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
    props: {}
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
