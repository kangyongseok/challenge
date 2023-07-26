import { useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Button, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import { Gap } from '@components/UI/atoms';

import { fetchCommonCodeDetails } from '@api/common';

import queryKeys from '@constants/queryKeys';

import { copyToClipboard } from '@utils/common';

import { ordersDetailOpenDeliveryStatusFrameState } from '@recoil/ordersDetail';
import useQueryOrder from '@hooks/useQueryOrder';
import useOrderStatus from '@hooks/useOrderStatus';

function OrdersDetailDeliveryInfo() {
  const router = useRouter();
  const { id } = router.query;

  const {
    palette: { common }
  } = useTheme();

  const toastStack = useToastStack();

  const [invoiceNumberInfo, setInvoiceNumberInfo] = useState<{
    description: string;
    contents: string;
  }>();
  const [deliveryMethod, setDeliveryMethod] = useState('');

  const setOpenDeliveryStatusFrameState = useSetRecoilState(
    ordersDetailOpenDeliveryStatusFrameState
  );

  const { data, data: { deliveryInfo, orderDelivery, type } = {} } = useQueryOrder({
    id: Number(id)
  });
  const orderStatus = useOrderStatus({ order: data });

  const { data: deliveryCompanies = [] } = useQuery(
    queryKeys.commons.codeDetails({ codeId: 21 }),
    () =>
      fetchCommonCodeDetails({
        codeId: 21
      })
  );

  const handleClick =
    (text = '') =>
    () => {
      copyToClipboard(text);
      toastStack({
        children: '배송정보가 복사되었어요!'
      });
    };

  useEffect(() => {
    if (!data || !orderDelivery) return;

    const { deliveryCode, contents, type: orderDeliveryType } = orderDelivery;

    const { description } = deliveryCompanies.find(({ name }) => name === deliveryCode) || {};

    if (description) {
      setInvoiceNumberInfo({
        description,
        contents
      });
    } else {
      let newDeliveryMethod = '';

      if (!orderDeliveryType) {
        newDeliveryMethod = contents;
      } else if (orderDeliveryType === 2) {
        newDeliveryMethod = '퀵 서비스';
      } else if (orderDeliveryType === 3) {
        newDeliveryMethod = '용달';
      }

      setDeliveryMethod(newDeliveryMethod);
    }
  }, [data, deliveryCompanies, orderDelivery]);

  if (
    // 직거래
    type === 1 ||
    [
      '결제취소',
      '환불대기',
      '환불진행',
      '환불완료',
      '배송준비 중 취소 요청',
      '거래준비 중 취소 요청'
    ].includes(orderStatus.name)
  )
    return null;

  return (
    <>
      <Gap height={8} />
      <Flexbox
        component="section"
        direction="vertical"
        gap={20}
        customStyle={{
          padding: '32px 20px'
        }}
      >
        <Typography variant="h3" weight="bold">
          배송정보
        </Typography>
        {(!orderStatus.isSeller ||
          (orderStatus.isSeller && !['결제대기', '결제진행'].includes(orderStatus.name))) && (
          <Flexbox direction="vertical" gap={4}>
            <Flexbox justifyContent="space-between" alignment="center">
              <Typography color="ui60">받는사람</Typography>
              <Flexbox alignment="center" gap={4}>
                <Typography>{deliveryInfo?.name}</Typography>
                {orderStatus.isSeller && (
                  <Icon
                    name="CopyOutlined"
                    width={16}
                    height={16}
                    color="ui80"
                    onClick={handleClick(deliveryInfo?.name)}
                  />
                )}
              </Flexbox>
            </Flexbox>
            <Flexbox justifyContent="space-between" alignment="center">
              <Typography color="ui60">연락처</Typography>
              <Flexbox alignment="center" gap={4}>
                <Typography>{deliveryInfo?.phone}</Typography>
                {orderStatus.isSeller && (
                  <Icon
                    name="CopyOutlined"
                    width={16}
                    height={16}
                    color="ui80"
                    onClick={handleClick(deliveryInfo?.phone)}
                  />
                )}
              </Flexbox>
            </Flexbox>
            <Flexbox justifyContent="space-between" alignment="center">
              <Typography
                color="ui60"
                customStyle={{
                  minWidth: 80
                }}
              >
                배송지
              </Typography>
              <Flexbox alignment="center" gap={4}>
                <Typography textAlign="right">{deliveryInfo?.address}</Typography>
                {orderStatus.isSeller && (
                  <Icon
                    name="CopyOutlined"
                    width={16}
                    height={16}
                    color="ui80"
                    onClick={handleClick(deliveryInfo?.address)}
                  />
                )}
              </Flexbox>
            </Flexbox>
            {invoiceNumberInfo && (
              <Flexbox justifyContent="space-between" alignment="center">
                <Typography color="ui60">송장번호</Typography>
                <Typography>{`${invoiceNumberInfo?.description} ${invoiceNumberInfo?.contents}`}</Typography>
              </Flexbox>
            )}
            {deliveryMethod && (
              <Flexbox justifyContent="space-between" alignment="center">
                <Typography color="ui60">배송방법</Typography>
                <Typography>{deliveryMethod}</Typography>
              </Flexbox>
            )}
          </Flexbox>
        )}
        {orderStatus.isSeller && ['결제대기', '결제진행'].includes(orderStatus.name) && (
          <Flexbox
            alignment="center"
            gap={4}
            customStyle={{
              padding: 12,
              borderRadius: 9,
              backgroundColor: common.bg02
            }}
          >
            <Icon name="BangCircleFilled" width={16} height={16} color="primary-light" />
            <Typography variant="body2" weight="medium">
              판매승인 후 확인할 수 있어요.
            </Typography>
          </Flexbox>
        )}
        {!orderStatus.otherDeliveryMethod && invoiceNumberInfo && (
          <Button
            variant="ghost"
            brandColor="black"
            size="large"
            fullWidth
            onClick={() => setOpenDeliveryStatusFrameState(true)}
          >
            배송조회
          </Button>
        )}
      </Flexbox>
    </>
  );
}

export default OrdersDetailDeliveryInfo;
