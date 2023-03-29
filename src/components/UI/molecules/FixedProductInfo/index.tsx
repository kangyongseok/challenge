import type { MouseEvent } from 'react';

import { useSetRecoilState } from 'recoil';
import {
  Avatar,
  Box,
  Button,
  CustomStyle,
  Flexbox,
  Icon,
  Skeleton,
  Typography,
  useTheme
} from 'mrcamel-ui';

import type { Order } from '@dto/order';

import { PRODUCT_INFORMATION_HEIGHT } from '@constants/common';
import { productStatus } from '@constants/channel';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getOrderStatusText } from '@utils/common';

import { channelBottomSheetStateFamily } from '@recoil/channel/atom';

import { Title, Wrapper } from './FixedProductInfo.styles';

interface FixedProductInfoProps {
  isLoading?: boolean;
  isEditableProductStatus?: boolean;
  isDeletedProduct?: boolean;
  isChannel?: boolean;
  isAdminBlockUser?: boolean;
  image: string;
  title: string;
  status: number;
  price: number;
  order?: Order | null;
  onClick?: () => void;
  onClickSafePayment?: (e: MouseEvent<HTMLButtonElement>) => void;
  onClickStatus?: () => void;
  customStyle?: CustomStyle;
}

function FixedProductInfo({
  isLoading = false,
  isEditableProductStatus = false,
  isDeletedProduct = false,
  isAdminBlockUser,
  isChannel = true,
  image,
  title,
  status,
  price,
  order,
  onClick,
  onClickSafePayment,
  onClickStatus,
  customStyle
}: FixedProductInfoProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const setProductStatusBottomSheetState = useSetRecoilState(
    channelBottomSheetStateFamily('productStatus')
  );

  const handleClickProductStatus = (e: MouseEvent<HTMLDivElement>) => {
    if (!isEditableProductStatus || isDeletedProduct) return;

    e.stopPropagation();
    setProductStatusBottomSheetState({ open: true, isChannel });

    if (onClickStatus) onClickStatus();
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
      onClick={onClick}
      customStyle={{
        minHeight: PRODUCT_INFORMATION_HEIGHT,
        position: 'relative',
        ...customStyle
      }}
    >
      <Wrapper>
        <Avatar
          width={48}
          height={48}
          src={image}
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
                {isDeletedProduct ? '삭제됨' : productStatus[status as keyof typeof productStatus]}
              </Typography>
              {isEditableProductStatus && (
                <Icon
                  name="DropdownFilled"
                  viewBox="0 0 12 26"
                  width="8px"
                  height="16px"
                  color={isDeletedProduct ? common.ui80 : common.ui20}
                />
              )}
            </Flexbox>
            <Title variant="body2" isDeletedProduct={isDeletedProduct}>
              {title}
            </Title>
          </Flexbox>
          <Typography
            variant="h4"
            weight="bold"
            customStyle={{ color: isDeletedProduct ? common.ui80 : common.ui20 }}
          >
            {commaNumber(getTenThousandUnitPrice(price))}만원
          </Typography>
        </Flexbox>
        {!isAdminBlockUser && onClickSafePayment && !isEditableProductStatus && (
          <Box
            customStyle={{
              flex: 1,
              textAlign: 'right'
            }}
          >
            <Button
              variant="solid"
              brandColor="black"
              onClick={onClickSafePayment}
              disabled={
                (!['결제대기', '결제취소', '환불완료/거래취소'].includes(
                  getOrderStatusText({ status: order?.status, result: order?.result })
                ) &&
                  !!order) ||
                status !== 0
              }
              customStyle={{
                whiteSpace: 'nowrap'
              }}
            >
              안전결제
            </Button>
          </Box>
        )}
      </Wrapper>
    </Flexbox>
  );
}

export default FixedProductInfo;
