import { useEffect, useRef } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import type { OrderInfo } from '@dto/product';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/formats';
import getOrderType from '@utils/common/getOrderType';
import { checkAgent } from '@utils/common';

import { loginBottomSheetState, productOrderTypeState } from '@recoil/common';
import useSession from '@hooks/useSession';

interface ProductPaymentMethodBottomSheetProps {
  open: boolean;
  onClose: () => void;
  orderInfo?: OrderInfo;
  onClick?: () => void;
  attributes?: {
    name?: string;
    title?: string;
  };
}

function ProductPaymentMethodBottomSheet({
  open,
  onClose,
  orderInfo,
  onClick,
  attributes
}: ProductPaymentMethodBottomSheetProps) {
  const router = useRouter();
  const { id } = router.query;

  const { isLoggedInWithSMS } = useSession();

  const [type, setOrderTypeState] = useRecoilState(productOrderTypeState);
  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);

  const loginBottomSheetOpenTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleClick = (newType: 0 | 1 | 2) => () => setOrderTypeState(newType);

  const handleClickPayment = () => {
    logEvent(attrKeys.products.CLICK_ORDER_OPTION, {
      ...attributes,
      att: 'NONE',
      type: getOrderType(type)
    });

    if (onClick && typeof onClick === 'function') {
      onClick();
      return;
    }

    if (!isLoggedInWithSMS) {
      onClose();
      loginBottomSheetOpenTimerRef.current = setTimeout(() => {
        setLoginBottomSheet({
          open: true,
          returnUrl: '',
          mode: !checkAgent.isMobileApp() ? 'nonMember' : 'normal'
        });
      }, 500);
    } else {
      router.push({
        pathname: `/products/${id}/order`,
        query: {
          type
        }
      });
    }
  };

  const handleClickSafePaymentGuideText = () => {
    logEvent(attrKeys.productOrder.CLICK_CAMEL_GUIDE);
    router.push('/products/purchasingInfo');
  };

  useEffect(() => {
    if (open && type === 2) {
      setOrderTypeState(0);
    }
  }, [setOrderTypeState, open, type]);

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.products.VIEW_ORDER_OPTION, attributes);
    }
  }, [open, attributes]);

  useEffect(() => {
    return () => {
      if (loginBottomSheetOpenTimerRef.current) {
        clearTimeout(loginBottomSheetOpenTimerRef.current);
      }
    };
  }, []);

  return (
    <BottomSheet open={open} onClose={onClose} disableSwipeable>
      <Flexbox
        direction="vertical"
        customStyle={{
          padding: '32px 20px'
        }}
      >
        <Typography
          textAlign="right"
          color="ui60"
          onClick={handleClickSafePaymentGuideText}
          customStyle={{
            textDecoration: 'underline'
          }}
        >
          카멜의 안전결제란?
        </Typography>
        <Flexbox
          direction="vertical"
          gap={8}
          customStyle={{
            marginTop: 20
          }}
        >
          <PaymentMethodSelectBox selected={type === 0} onClick={handleClick(0)}>
            <Icon
              name={type === 0 ? 'CheckCircleFilled' : 'CircleOutlined'}
              color={type === 0 ? undefined : 'ui80'}
            />
            <Flexbox direction="vertical" gap={4}>
              <Typography variant="h3" weight="medium" color={type === 0 ? undefined : 'ui60'}>
                택배로 거래할게요.
              </Typography>
              <Typography color="ui60">배송비 별도</Typography>
            </Flexbox>
          </PaymentMethodSelectBox>
          <PaymentMethodSelectBox selected={type === 1} onClick={handleClick(1)}>
            <Icon
              name={type === 1 ? 'CheckCircleFilled' : 'CircleOutlined'}
              color={type === 1 ? undefined : 'ui80'}
            />
            <Typography variant="h3" weight="medium" color={type === 1 ? undefined : 'ui60'}>
              직거래로 할게요.
            </Typography>
          </PaymentMethodSelectBox>
        </Flexbox>
        <Flexbox
          direction="vertical"
          gap={8}
          customStyle={{
            marginTop: 32
          }}
        >
          <Flexbox alignment="center" justifyContent="space-between">
            <Typography variant="h3" weight="medium">
              총 결제금액
            </Typography>
            <Typography
              variant="h3"
              weight="bold"
              color="red-light"
              customStyle={{
                fontSize: 20
              }}
            >
              {commaNumber(orderInfo?.totalPrice || 0)}원
            </Typography>
          </Flexbox>
          <Flexbox alignment="center" justifyContent="space-between">
            <Typography color="ui60">매물금액</Typography>
            <Typography>{commaNumber(orderInfo?.price || 0)}원</Typography>
          </Flexbox>
          <Flexbox alignment="center" justifyContent="space-between">
            <Typography color="ui60">안전결제수수료</Typography>
            <Typography>{commaNumber(orderInfo?.fee || 0)}원</Typography>
          </Flexbox>
        </Flexbox>
        <Button
          variant="solid"
          brandColor="black"
          size="xlarge"
          fullWidth
          onClick={onClick || handleClickPayment}
          customStyle={{
            marginTop: 32
          }}
        >
          안전하게 결제하기
        </Button>
      </Flexbox>
    </BottomSheet>
  );
}

const PaymentMethodSelectBox = styled.div<{ selected?: boolean }>`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 20px;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      },
      selected
    }) => (selected ? common.ui20 : common.line01)};
  border-radius: 8px;
`;

export default ProductPaymentMethodBottomSheet;
