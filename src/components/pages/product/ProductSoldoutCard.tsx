import { useEffect } from 'react';

import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

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

  const isNormalSeller = product?.productSeller.type === 4 || product?.site.id === 34;

  return (
    <StyledWrap justifyContent="space-between" alignment="center" onClick={onClick}>
      <Box customStyle={{ width: 'calc(100% - 92px)' }}>
        <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 8 }}>
          판매 완료된 매물이에요
        </Typography>
        <EllipsisTitle variant="small1" weight="medium">
          {!isNormalSeller && isSafe && <span>안전결제 </span>}
          {product?.title}
        </EllipsisTitle>
        <Typography variant="h4" weight="bold" customStyle={{ color: common.ui60 }}>
          {commaNumber(getTenThousandUnitPrice(product?.price || 0))}만원
        </Typography>
      </Box>
      <ImageWrap imageUrl={product?.imageMain} />
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

const ImageWrap = styled.div<{ imageUrl?: string }>`
  margin-left: 20px;
  width: 72px;
  height: 72px;
  border-radius: 8px;
  background: url(${({ imageUrl }) => imageUrl}) no-repeat 50% 50%;
  background-size: cover;
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
