import { useMemo } from 'react';

import { Box, CustomStyle, Flexbox, Typography } from 'mrcamel-ui';

import Skeleton from '@components/UI/atoms/Skeleton';

import type { ProductSeller } from '@dto/product';
import type { CommonCode } from '@dto/common';

import { ID_FILTER, LABELS, PRODUCT_SITE } from '@constants/product';

interface ProductGridCardSkeletonPros {
  title?: string;
  labels?: CommonCode[];
  productSeller?: ProductSeller;
  hasMetaInfo?: boolean;
  isRound?: boolean;
  customStyle?: CustomStyle;
}

function ProductGridCardSkeleton({
  title,
  labels = [],
  productSeller,
  hasMetaInfo = true,
  isRound = false,
  customStyle
}: ProductGridCardSkeletonPros) {
  const isSafe = useMemo(() => {
    const { site } = productSeller || {};

    if (!title || !site || !labels.length) return false;

    return (
      Object.entries(PRODUCT_SITE).some(
        ([key, productSite]) => ['HELLO', 'KREAM'].includes(key) && productSite.id === site.id
      ) ||
      labels.some(
        (label) =>
          label.codeId === ID_FILTER &&
          LABELS[ID_FILTER].some(
            ({ name, description }) => name === label.name && description === '안전'
          )
      )
    );
  }, [labels, productSeller, title]);
  return (
    <Flexbox gap={18} direction="vertical" customStyle={customStyle}>
      <Skeleton isRound={isRound} />
      <Box customStyle={{ padding: '0 12px' }}>
        <Skeleton
          width="100%"
          maxWidth={!title ? '200px' : 'fit-content'}
          minHeight="18px"
          maxHeight="36px"
          disableAspectRatio
          isRound={isRound}
        >
          {title && (
            <Typography variant="body2" weight="medium" customStyle={{ visibility: 'hidden' }}>
              {isSafe && <strong>안전결제</strong>}&nbsp;{title}
            </Typography>
          )}
        </Skeleton>
        <Skeleton
          width="100%"
          maxWidth="50px"
          height="23px"
          disableAspectRatio
          isRound={isRound}
          customStyle={{ marginTop: 4 }}
        />
        <Skeleton
          width="100%"
          maxWidth="120px"
          height="13px"
          disableAspectRatio
          isRound={isRound}
          customStyle={{ marginTop: 8 }}
        />
        {hasMetaInfo && (
          <Skeleton
            width="100%"
            maxWidth="75px"
            height="15px"
            disableAspectRatio
            isRound={isRound}
            customStyle={{ marginTop: 4 }}
          />
        )}
      </Box>
    </Flexbox>
  );
}

export default ProductGridCardSkeleton;
