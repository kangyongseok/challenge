import { useEffect } from 'react';

import { Box, Flexbox, Image, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { productSellerType } from '@constants/user';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber, getTenThousandUnitPrice } from '@utils/formats';

function ProductSoldoutCard({
  product,
  isSafe,
  onClick
}: {
  product?: Product;
  isSafe: boolean;
  onClick: () => void;
}) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  useEffect(() => {
    logEvent(attrKeys.products.VIEW_SOLDOUT, {
      name: attrProperty.name.productDetail
    });
  }, []);

  const isNormalSeller = product?.sellerType === productSellerType.normal;

  return (
    <StyledWrap justifyContent="space-between" alignment="center" onClick={onClick}>
      <Box customStyle={{ width: 'calc(100% - 92px)' }}>
        <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 8 }}>
          판매 완료된 매물이에요
        </Typography>
        <EllipsisTitle variant="body2" weight="medium">
          {!isNormalSeller && isSafe && <span>안전결제 </span>}
          {product?.title}
        </EllipsisTitle>
        <Typography variant="h4" weight="bold" customStyle={{ color: common.ui60 }}>
          {commaNumber(getTenThousandUnitPrice(product?.price || 0))}만원
        </Typography>
      </Box>
      <Box customStyle={{ marginLeft: 20, width: 72, height: 72 }}>
        <Image
          width={72}
          height={72}
          src={product?.imageMain || ''}
          alt="Product Img"
          round={8}
          disableAspectRatio
        />
      </Box>
    </StyledWrap>
  );
}

const StyledWrap = styled(Flexbox)`
  margin-left: -20px;
  width: calc(100% + 40px);
  padding: 20px;
  margin-bottom: 32px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
`;

const EllipsisTitle = styled(Typography)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: 4px;
  width: 100%;
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui60};
`;

export default ProductSoldoutCard;
