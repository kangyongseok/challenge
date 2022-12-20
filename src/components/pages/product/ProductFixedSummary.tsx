import { memo } from 'react';

import { Flexbox, Typography } from 'mrcamel-ui';
import type { TypographyVariant } from 'mrcamel-ui';
import styled from '@emotion/styled';
import type { EmotionJSX } from '@emotion/react/types/jsx-namespace';

import Image from '@components/UI/atoms/Image';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

interface ProductFixedSummaryProps {
  isSafe: boolean;
  image: string;
  title: string;
  price: number;
  status: number;
  isNormalSeller?: boolean;
  getProductImageOverlay: ({
    status,
    variant
  }: {
    status: number;
    variant?: TypographyVariant;
  }) => EmotionJSX.Element | null;
}

function ProductFixedSummary({
  isSafe,
  image,
  title,
  price,
  status,
  isNormalSeller,
  getProductImageOverlay
}: ProductFixedSummaryProps) {
  return (
    <>
      {getProductImageOverlay({ status, variant: 'body1' })}
      <Image src={image} width={64} height={64} disableAspectRatio alt="Product Summary Img" />
      <Flexbox
        direction="vertical"
        justifyContent="center"
        customStyle={{ padding: '11px 16px 10px' }}
      >
        <Title variant="body2" weight="medium">
          {!isNormalSeller && isSafe && <strong>안전결제 </strong>}
          {title}
        </Title>
        <Typography variant="body1" weight="bold" customStyle={{ marginTop: 4 }}>
          {commaNumber(getTenThousandUnitPrice(price))}만원
        </Typography>
      </Flexbox>
    </>
  );
}

const Title = styled(Typography)`
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;

  & > strong {
    color: ${({ theme: { palette } }) => palette.primary.main};
  }
`;

export default memo(ProductFixedSummary);
