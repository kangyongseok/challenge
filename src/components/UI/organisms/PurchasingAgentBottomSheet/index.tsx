import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { BottomSheet, Box, Button, Flexbox, Icon, Tooltip, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { OrderInfo } from '@dto/product';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { ORDER_FEE_TOOLTIP_MESSAGE } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';

function PurchasingAgentBottomSheet({
  open,
  onClose,
  onClickPayment,
  logTitle,
  orderInfoProps
}: {
  open: boolean;
  onClose: () => void;
  onClickPayment: () => void;
  logTitle: 'OPERATOR' | 'ORDER';
  orderInfoProps?: OrderInfo;
}) {
  const router = useRouter();
  const [isCheck, setCheck] = useState(true);
  const [openTooltip, setOpenTooltip] = useState<0 | 1 | 2 | null>(null);

  // const { data: productDetail } = useQueryProduct();

  const handleClickCheck = () => {
    setCheck((prev) => !prev);
  };

  const handleClickPurchasingAgent = () => {
    logEvent(attrKeys.productOrder.CLICK_ORDER_OPTION, {
      title: attrProperty.title.OPERATOR,
      att: isCheck ? 'LEGIT' : 'NONE',
      type: 'OPERATOR'
    });

    LocalStorage.set('includeLegit', isCheck);

    onClickPayment();
  };

  useEffect(() => {
    logEvent(attrKeys.productOrder.VIEW_ORDER_OPTION, {
      title: logTitle
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inspectorFee =
    orderInfoProps?.orderFees?.find((orderInfo) => orderInfo.type === 2)?.totalFee || 0;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      customStyle={{ padding: '32px 20px' }}
      disableSwipeable
    >
      <Flexbox alignment="flex-start" justifyContent="space-between">
        <Typography variant="h2" weight="bold">
          카멜 구매대행
        </Typography>
        <Typography
          color="ui60"
          customStyle={{ textDecoration: 'underline' }}
          onClick={() => {
            logEvent(attrKeys.productOrder.CLICK_CAMEL_GUIDE);
            router.push('/products/purchasingInfo?step=2');
          }}
        >
          구매대행이란?
        </Typography>
      </Flexbox>
      <Typography variant="h4" customStyle={{ marginTop: 6, wordBreak: 'keep-all' }}>
        직접 거래하기 어렵고 무서울 때, 문의, 검수, 배송까지 모두 카멜이 대신해드려요!
      </Typography>
      <Box
        customStyle={{
          padding: 20,
          borderRadius: 8,
          border: `1px solid ${isCheck ? 'black' : '#7B7D85'}`,
          marginTop: 32
        }}
        onClick={handleClickCheck}
      >
        <Flexbox alignment="flex-start" gap={8} customStyle={{ width: '100%' }}>
          <Icon name="CheckCircleFilled" color={isCheck ? 'ui20' : 'ui80'} />
          <Box customStyle={{ width: '100%' }}>
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{ width: '100%' }}
            >
              <Typography variant="h3" weight="medium" color={isCheck ? 'ui20' : 'ui60'}>
                카멜 정품검수
              </Typography>
              <Typography variant="h3" weight="bold" color={isCheck ? 'ui20' : 'ui60'}>
                {commaNumber(inspectorFee)}원
              </Typography>
            </Flexbox>
            {isCheck ? (
              <Typography variant="body2" color="ui60" customStyle={{ marginTop: 4 }}>
                카멜 구매대행과 정품검수를 통해
                <br />
                100% 편리하고 안전한 거래가 가능해요.
              </Typography>
            ) : (
              <Typography variant="body2" color="red-light" customStyle={{ marginTop: 4 }}>
                정품검수 미선택시, 정품 여부는 구매자가 자체판단한
                <br />
                것으로 간주되며 가품으로 인한 환불이 어렵습니다.
              </Typography>
            )}
          </Box>
        </Flexbox>
      </Box>
      <Flexbox alignment="center" justifyContent="space-between" customStyle={{ marginTop: 32 }}>
        <Typography variant="h3" weight="medium">
          총 결제금액
        </Typography>
        <Typography color="red-light" weight="bold" customStyle={{ fontSize: 20 }}>
          {isCheck
            ? commaNumber(orderInfoProps?.totalPrice || 0)
            : commaNumber((orderInfoProps?.totalPrice || 0) - inspectorFee)}
          원
        </Typography>
      </Flexbox>
      <FeeOptionBox direction="vertical" gap={6}>
        <Flexbox alignment="center" justifyContent="space-between">
          <Typography color="ui60">매물가격</Typography>
          <Typography>{commaNumber(orderInfoProps?.price || 0)}원</Typography>
        </Flexbox>
        {orderInfoProps?.orderFees
          ?.filter((orderInfo) => orderInfo.type !== 0)
          ?.map((orderInfo) => (
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              key={`product-operator-${orderInfo.name}`}
            >
              <Typography color="ui60" customStyle={{ display: 'flex', alignItems: 'center' }}>
                {orderInfo.name}
                <Tooltip
                  open={openTooltip === orderInfo.type}
                  message={
                    <>
                      {ORDER_FEE_TOOLTIP_MESSAGE[orderInfo.type].map((message: string) => (
                        <TooltipText key={message} color="uiWhite" variant="body2" weight="medium">
                          {message}
                        </TooltipText>
                      ))}
                    </>
                  }
                  placement="top"
                  triangleLeft={33}
                  customStyle={{
                    top: 15,
                    bottom: 'auto',
                    left: 100,
                    zIndex: 5
                  }}
                >
                  <Icon
                    name="QuestionCircleOutlined"
                    width={16}
                    color="ui80"
                    onClick={() => {
                      if (orderInfo.type === openTooltip) {
                        setOpenTooltip(null);
                        return;
                      }
                      setOpenTooltip(orderInfo.type);
                    }}
                  />
                </Tooltip>
              </Typography>
              {!isCheck && orderInfo?.type === 2 ? (
                <Typography color="ui60">선택안함</Typography>
              ) : (
                <Typography>{commaNumber(orderInfo?.totalFee)}원</Typography>
              )}
            </Flexbox>
          ))}
      </FeeOptionBox>
      <Button
        fullWidth
        variant="solid"
        brandColor="black"
        size="xlarge"
        customStyle={{ marginTop: 20 }}
        onClick={handleClickPurchasingAgent}
      >
        구매대행 시작하기
      </Button>
    </BottomSheet>
  );
}

const FeeOptionBox = styled(Flexbox)`
  margin: 12px 0;
  width: 100%;
`;

const TooltipText = styled(Typography)`
  text-align: left;
  width: 240px;
  white-space: pre-wrap;
`;

export default PurchasingAgentBottomSheet;
