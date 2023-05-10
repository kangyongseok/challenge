import { useMemo } from 'react';

import { Box, Flexbox, Skeleton, Typography } from '@mrcamelhub/camel-ui';
import type { CustomStyle } from '@mrcamelhub/camel-ui';

import type { ProductSeller } from '@dto/product';
import type { CommonCode } from '@dto/common';

import { ID_FILTER, LABELS, PRODUCT_SITE } from '@constants/product';

interface ProductGridCardSkeletonPros {
  title?: string;
  labels?: CommonCode[];
  productSeller?: ProductSeller;
  hasAreaWithDateInfo?: boolean;
  hasMetaInfo?: boolean;
  isRound?: boolean;
  compact?: boolean;
  gap?: number;
  customStyle?: CustomStyle;
}

function ProductGridCardSkeleton({
  title,
  labels = [],
  productSeller,
  hasAreaWithDateInfo = true,
  hasMetaInfo = true,
  isRound = false,
  compact,
  gap,
  customStyle
}: ProductGridCardSkeletonPros) {
  const isNormalSeller =
    productSeller?.type === 4 || productSeller?.site.id === 34 || productSeller?.type === 3;
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
    <Flexbox gap={gap || (compact ? 12 : 17)} direction="vertical" customStyle={customStyle}>
      <Skeleton round={isRound ? 8 : 0} />
      <Box customStyle={{ padding: compact ? 0 : '0 12px' }}>
        <Skeleton
          width="100%"
          maxWidth={!title ? 200 : 'fit-content'}
          minHeight={18}
          maxHeight={36}
          round={isRound ? 8 : 0}
          disableAspectRatio
        >
          {title && (
            <Typography variant="body2" weight="medium" customStyle={{ visibility: 'hidden' }}>
              {!isNormalSeller && isSafe && <strong>안전결제</strong>}&nbsp;{title}
            </Typography>
          )}
        </Skeleton>
        <Skeleton
          width="100%"
          maxWidth={50}
          height={23}
          round={isRound ? 8 : 0}
          disableAspectRatio
          customStyle={{ marginTop: 4 }}
        />
        {hasAreaWithDateInfo && (
          <Skeleton
            width="100%"
            maxWidth={120}
            height={13}
            round={isRound ? 8 : 0}
            disableAspectRatio
            customStyle={{ marginTop: 8 }}
          />
        )}
        {hasMetaInfo && (
          <Skeleton
            width="100%"
            maxWidth={75}
            height={15}
            round={isRound ? 8 : 0}
            disableAspectRatio
            customStyle={{ marginTop: 4 }}
          />
        )}
      </Box>
    </Flexbox>
  );
}

export default ProductGridCardSkeleton;
