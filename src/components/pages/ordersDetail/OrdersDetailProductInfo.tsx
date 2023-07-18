import { useRouter } from 'next/router';
import { Button, Flexbox, Icon, Image, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import type { Product } from '@dto/product';

import { commaNumber, getTenThousandUnitPrice } from '@utils/formats';
import { getProductCardImageResizePath, getProductDetailUrl } from '@utils/common';

import useQueryOrder from '@hooks/useQueryOrder';
import useProductType from '@hooks/useProductType';
import useOrderStatus from '@hooks/useOrderStatus';

function OrdersDetailProductInfo() {
  const router = useRouter();
  const { id } = router.query;

  const {
    palette: { common }
  } = useTheme();

  const {
    data,
    data: {
      channelId,
      orderDetails = [],
      additionalInfo: { sellerName = '', sellerUserId = 0, product = {} as Product } = {}
    } = {}
  } = useQueryOrder({ id: Number(id) });
  const orderStatus = useOrderStatus({ order: data });

  const { isAllCrawlingProduct } = useProductType(product?.sellerType);

  const handleClick = () => {
    if (!product) return;

    router.push(getProductDetailUrl({ product }));
  };

  const handleClickChat = () => router.push(`/channels/${channelId}`);

  const handleClickShop = () =>
    router.push({
      pathname: isAllCrawlingProduct
        ? `/sellerInfo/${product?.sellerId}`
        : `/userInfo/${sellerUserId}`,
      query: {
        tab: 'products'
      }
    });

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={20}
      customStyle={{
        padding: 20,
        borderTop: `1px solid ${common.line01}`
      }}
    >
      <Flexbox justifyContent="space-between" alignment="center" gap={12}>
        <Flexbox gap={16} onClick={handleClick}>
          <Image
            src={getProductCardImageResizePath(product?.imageMain || product?.imageThumbnail, 0)}
            alt="Product Img"
            width={50}
            height={60}
            round={8}
            disableAspectRatio
            customStyle={{
              minWidth: 50
            }}
          />
          <Flexbox direction="vertical" justifyContent="center" gap={2}>
            <Typography variant="body2" noWrap lineClamp={2}>
              {orderDetails[0]?.name}
            </Typography>
            <Typography variant="h3" weight="bold">
              {commaNumber(getTenThousandUnitPrice(orderDetails[0]?.price || 0))}만원
            </Typography>
          </Flexbox>
        </Flexbox>
        <Button
          variant="ghost"
          brandColor="black"
          onClick={handleClickChat}
          customStyle={{
            whiteSpace: 'nowrap'
          }}
        >
          채팅하기
        </Button>
      </Flexbox>
      {!orderStatus.isSeller && orderStatus.transactionMethod !== '카멜 구매대행' && (
        <Flexbox
          justifyContent="space-between"
          alignment="center"
          gap={4}
          onClick={handleClickShop}
        >
          <Flexbox gap={4} alignment="center">
            <Icon name="ShopOutlined" width={16} height={16} color="ui60" />
            <Typography variant="body2" weight="medium" color="ui60">
              {sellerName}의 상점 바로가기
            </Typography>
          </Flexbox>
          <Icon name="Arrow2RightOutlined" width={16} height={16} color="ui80" />
        </Flexbox>
      )}
    </Flexbox>
  );
}

export default OrdersDetailProductInfo;
