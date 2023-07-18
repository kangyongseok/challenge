import { useState } from 'react';
import type { MouseEvent } from 'react';

import { useSetRecoilState } from 'recoil';
import { useQuery } from '@tanstack/react-query';
import {
  Avatar,
  Box,
  Button,
  Flexbox,
  Icon,
  Skeleton,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';
import type { CustomStyle } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import {
  ProductPaymentMethodBottomSheet,
  PurchasingAgentBottomSheet
} from '@components/UI/organisms';

import type { ProductOffer } from '@dto/productOffer';
import type { Order } from '@dto/order';

import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { PRODUCT_INFORMATION_HEIGHT } from '@constants/common';
import { productStatus } from '@constants/channel';
import attrProperty from '@constants/attrProperty';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getImagePathStaticParser, getImageResizePath } from '@utils/common';

import { productOrderTypeState } from '@recoil/common';
import { channelBottomSheetStateFamily, channelDialogStateFamily } from '@recoil/channel/atom';
import useOrderStatus from '@hooks/useOrderStatus';

import { Title, Wrapper } from './FixedProductInfo.styles';

interface FixedProductInfoProps {
  isLoading?: boolean;
  isEditableProductStatus?: boolean;
  isDeletedProduct?: boolean;
  isChannel?: boolean;
  isTargetUserBlocked?: boolean;
  isAdminBlockUser?: boolean;
  isReserved?: boolean;
  image: string;
  title: string;
  status: number;
  price: number;
  order?: Order | null;
  offer?: ProductOffer | null;
  isAllOperatorProduct?: boolean;
  productId?: number;
  onClick?: () => void;
  onClickSafePayment?: () => void;
  onClickStatus?: () => void;
  customStyle?: CustomStyle;
}

function FixedProductInfo({
  isLoading = false,
  isEditableProductStatus = false,
  isDeletedProduct = false,
  isTargetUserBlocked,
  isAdminBlockUser,
  isChannel = true,
  isReserved,
  image,
  title,
  status,
  price,
  order,
  offer,
  productId,
  isAllOperatorProduct,
  onClick,
  onClickSafePayment,
  onClickStatus,
  customStyle
}: FixedProductInfoProps) {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  const { data } = useQuery(
    queryKeys.products.product({ productId: Number(productId) }),
    () => fetchProduct({ productId: Number(productId) }),
    {
      enabled: !!productId
    }
  );

  const orderStatus = useOrderStatus({ order: order as Order });

  const [openPurchasingAgentBottomSheet, setOpenPurchasingAgentBottomSheet] = useState(false);
  const [openProductPaymentBottomSheet, setOpenProductPaymentBottomSheet] = useState(false);

  const setProductStatusBottomSheetState = useSetRecoilState(
    channelBottomSheetStateFamily('productStatus')
  );
  const setReservingDialogState = useSetRecoilState(channelDialogStateFamily('reserving'));
  const setOrderTypeState = useSetRecoilState(productOrderTypeState);

  const handleClickProductStatus = (e: MouseEvent<HTMLDivElement>) => {
    if (!isEditableProductStatus || isDeletedProduct) return;

    e.stopPropagation();
    setProductStatusBottomSheetState({ open: true, isChannel });

    if (onClickStatus) onClickStatus();
  };

  const handleClick = (isOperator: boolean) => () => {
    if (status === 4) {
      setReservingDialogState((prevState) => ({
        ...prevState,
        open: true
      }));
      return;
    }

    if (
      ([
        '결제진행',
        '결제완료',
        '배송대기',
        '배송진행',
        '배송완료',
        '배송준비 중 취소 요청',
        '거래준비 중 취소 요청',
        '정산대기',
        '정산진행',
        '정산완료'
      ].includes(orderStatus.name) &&
        !!order) ||
      status !== 0 ||
      isTargetUserBlocked ||
      isAdminBlockUser ||
      isReserved
    )
      return;

    if (!isOperator) {
      setOpenProductPaymentBottomSheet(true);
    } else if (onClickSafePayment) {
      setOrderTypeState(2);
      onClickSafePayment();
    }
  };

  return isLoading ? (
    <Flexbox
      component="section"
      alignment="center"
      gap={12}
      customStyle={{
        padding: '4px 20px 12px',
        borderBottom: `1px solid ${common.line01}`,
        ...customStyle
      }}
    >
      <Skeleton width={48} height={48} round={8} disableAspectRatio />
      <Flexbox direction="vertical" gap={4}>
        <Flexbox gap={8}>
          <Skeleton width={43} height={16} round={8} disableAspectRatio />
          <Skeleton width={162} height={16} round={8} disableAspectRatio />
        </Flexbox>
        <Skeleton width={66} height={20} round={8} disableAspectRatio />
      </Flexbox>
    </Flexbox>
  ) : (
    <Flexbox
      component="section"
      customStyle={{
        minHeight: PRODUCT_INFORMATION_HEIGHT,
        ...customStyle
      }}
    >
      <Wrapper>
        <Flexbox
          onClick={onClick}
          alignment="center"
          gap={8}
          customStyle={{ width: 'calc(100% - 80px)' }}
        >
          <Avatar
            width={48}
            height={48}
            src={getImageResizePath({
              imagePath: getImagePathStaticParser(image || ''),
              w: 48
            })}
            alt="Product Img"
            round={8}
            customStyle={{
              opacity: isDeletedProduct ? 0.4 : 1
            }}
          />
          <Flexbox direction="vertical" gap={4} customStyle={{ overflow: 'hidden' }}>
            <Flexbox alignment="center" gap={8}>
              <Flexbox
                alignment="center"
                gap={2}
                customStyle={{
                  whiteSpace: 'nowrap'
                }}
                onClick={handleClickProductStatus}
              >
                <Typography
                  variant="body2"
                  weight="bold"
                  customStyle={{ color: isDeletedProduct ? common.ui80 : common.ui20 }}
                >
                  {isDeletedProduct
                    ? '삭제됨'
                    : productStatus[status as keyof typeof productStatus]}
                </Typography>
                {isEditableProductStatus && (
                  <Icon
                    name="DropdownFilled"
                    viewBox="0 0 12 26"
                    width={8}
                    height={16}
                    color={isDeletedProduct ? 'ui80' : 'ui20'}
                  />
                )}
              </Flexbox>
              <Title variant="body2" isDeletedProduct={isDeletedProduct}>
                {title}
              </Title>
            </Flexbox>
            {!isDeletedProduct && offer?.status === 1 && (
              <Flexbox gap={4} alignment="center">
                <Typography variant="h4" weight="bold" customStyle={{ color: primary.main }}>
                  {commaNumber(getTenThousandUnitPrice(offer?.price))}만원
                </Typography>
                <Typography
                  variant="body2"
                  customStyle={{ textDecoration: 'line-through', color: common.ui60 }}
                >
                  {commaNumber(getTenThousandUnitPrice(price))}만원
                </Typography>
              </Flexbox>
            )}
            {offer?.status !== 1 && (
              <Flexbox alignment="flex-end" gap={5}>
                <Typography
                  variant="h4"
                  weight="bold"
                  customStyle={{ color: isDeletedProduct ? common.ui80 : common.ui20 }}
                >
                  {commaNumber(getTenThousandUnitPrice(data?.orderInfo?.totalPrice || price))}
                  만원
                </Typography>
                {isAllOperatorProduct && (
                  <Typography variant="small2" color="ui60" customStyle={{ paddingBottom: 2 }}>
                    카멜 구매대행가
                  </Typography>
                )}
              </Flexbox>
            )}
          </Flexbox>
        </Flexbox>
        {onClickSafePayment && !isEditableProductStatus && (
          <Box
            customStyle={{
              flex: 1,
              textAlign: 'right'
            }}
          >
            <SafePaymentButton
              variant="solid"
              brandColor="black"
              onClick={() => {
                if (isAllOperatorProduct) {
                  setOpenPurchasingAgentBottomSheet(true);
                } else {
                  handleClick(false)();
                }
              }}
              customDisabled={
                ([
                  '결제진행',
                  '결제완료',
                  '배송대기',
                  '배송진행',
                  '배송완료',
                  '배송준비 중 취소 요청',
                  '거래준비 중 취소 요청',
                  '정산대기',
                  '정산진행',
                  '정산완료'
                ].includes(orderStatus.name) &&
                  !!order) ||
                status !== 0 ||
                isTargetUserBlocked ||
                isAdminBlockUser ||
                isReserved
              }
              customStyle={{
                whiteSpace: 'nowrap'
              }}
            >
              안전결제
            </SafePaymentButton>
          </Box>
        )}
      </Wrapper>
      <PurchasingAgentBottomSheet
        open={openPurchasingAgentBottomSheet}
        onClose={() => setOpenPurchasingAgentBottomSheet(false)}
        onClickPayment={handleClick(true)}
        logTitle={attrProperty.title.OPERATOR as 'OPERATOR'}
        orderInfoProps={data?.orderInfo}
      />
      <ProductPaymentMethodBottomSheet
        open={openProductPaymentBottomSheet}
        onClose={() => setOpenProductPaymentBottomSheet(false)}
        orderInfo={data?.orderInfo}
        onClick={onClickSafePayment}
        attributes={{
          name: attrProperty.name.ORDER_DETAIL,
          title: attrProperty.title.ORDER
        }}
      />
    </Flexbox>
  );
}

const SafePaymentButton = styled(Button)<{ customDisabled?: boolean }>`
  ${({
    theme: {
      palette: { common }
    },
    customDisabled
  }): CSSObject =>
    customDisabled
      ? {
          borderColor: 'transparent',
          backgroundColor: common.ui90,
          color: common.ui80,
          '& svg': {
            color: common.ui80
          }
        }
      : {}}
`;

export default FixedProductInfo;
